"""
LangGraph node functions for the multi-agent RAG pipeline.

Nodes:
  - intent_node:     LLM-based intent classification
  - billing_node:    Billing RAG agent
  - technical_node:  Technical RAG agent
  - product_node:    Product RAG agent
  - complaint_node:  Complaint RAG agent
  - aggregator_node: Combines all agent outputs into final response
"""

import os
import json
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_chroma import Chroma
from state import AgentState

load_dotenv()


CHROMA_PERSIST_DIR = os.path.join(os.path.dirname(__file__), "chroma_db")
COLLECTION_NAME = "rag_knowledge_base"


def _get_llm(temperature=0):
    """Returns a Gemini LLM instance."""
    model_name = os.getenv("LLM_MODEL_NAME", "gemma-4-31b-it")
    return ChatGoogleGenerativeAI(
        model=model_name,
        temperature=temperature,
    )


def _clean_llm_content(content) -> str:
    """Helper to convert LLM message content (which can be a string or list of blocks) into a clean string,
    filtering out thinking/reasoning blocks and keeping only the final answer.
    """
    if isinstance(content, str):
        return content
    elif isinstance(content, list):
        parts = []
        for part in content:
            if isinstance(part, dict):
                # Ignore thinking blocks completely
                if part.get("type") == "thinking" or "thinking" in part:
                    continue
                # Keep text blocks
                if "text" in part:
                    parts.append(part["text"])
                # Fallback to string representation of other non-thinking elements
                elif part.get("type") != "thinking":
                    parts.append(str(part))
            elif isinstance(part, str):
                parts.append(part)
            else:
                parts.append(str(part))
        return "".join(parts).strip()
    return str(content).strip()


_EMBEDDINGS = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-2")

_VECTORSTORE = Chroma(
    persist_directory=CHROMA_PERSIST_DIR,
    embedding_function=_EMBEDDINGS,
    collection_name=COLLECTION_NAME,
)


def _retrieve_chunks(query: str, agent_category: str, k: int = 4) -> str:
    """Retrieves relevant chunks from ChromaDB filtered by agent category."""
    results = _VECTORSTORE.similarity_search(
        query, k=k, filter={"agent": agent_category}
    )
    if not results:
        return "No relevant information found in the knowledge base."
    return "\n\n---\n\n".join([doc.page_content for doc in results])

INTENT_PROMPT = """You are an intent classifier for a customer support system.
Given a user query, classify which support agent(s) should handle it.

Available agents:
- billing: Handles refund policies, payment methods, invoices, subscriptions, pricing, billing FAQs
- technical: Handles installation guides, login issues, troubleshooting, error codes, password reset, API documentation
- product: Handles product information, features, comparisons, specifications, availability, product pricing
- complaint: Handles complaint processes, escalation policies, SLAs, customer rights, grievance redressal
- faq: Handles general company policies, general questions, contact information, head office location, office operating hours

RULES:
1. Return ONLY a JSON array of agent names. Example: ["billing"] or ["billing", "technical"]
2. A query can match MULTIPLE agents if it spans multiple domains.
3. Choose the MOST relevant agent(s). Do not include agents that are not clearly related.
4. Return ONLY the JSON array, nothing else.

User Query: {query}

JSON Response:"""


def intent_node(state: AgentState) -> AgentState:
    """Classifies the user query into one or more agent categories using LLM."""
    llm = _get_llm(temperature=0)
    prompt = INTENT_PROMPT.format(query=state["query"])
    response = llm.invoke(prompt)

    # Parse the LLM response into a list of intents
    raw = _clean_llm_content(response.content).strip()
    # Clean markdown code fences if present
    raw = raw.replace("```json", "").replace("```", "").strip()

    try:
        intents = json.loads(raw)
        # Validate — only keep known agent names
        valid_agents = {"billing", "technical", "product", "complaint", "faq"}
        intents = [i for i in intents if i in valid_agents]
        if not intents:
            intents = ["billing"]  # fallback
    except (json.JSONDecodeError, TypeError):
        intents = ["billing"]  # fallback on parse failure

    print(f"  [Intent Classifier] Query: \"{state['query']}\"")
    print(f"  [Intent Classifier] Routed to: {intents}")

    state["intents"] = intents
    return state


AGENT_SYSTEM_PROMPTS = {
    "billing": (
        "You are a billing support specialist at Acme Corporation. "
        "You help customers with refund policies, payment methods, invoices, "
        "subscriptions, pricing, and billing FAQs. Use ONLY the provided context "
        "to answer. If the context doesn't contain the answer, say so clearly. "
        "Be concise, helpful, and professional."
    ),
    "technical": (
        "You are a technical support engineer at Acme Corporation. "
        "You help customers with installation guides, login issues, troubleshooting, "
        "error codes, password resets, and API documentation. Use ONLY the provided "
        "context to answer. If the context doesn't contain the answer, say so clearly. "
        "Be precise and include specific steps when applicable."
    ),
    "product": (
        "You are a product specialist at Acme Corporation. "
        "You help customers understand product features, comparisons, specifications, "
        "availability, and pricing tiers. Use ONLY the provided context to answer. "
        "If the context doesn't contain the answer, say so clearly. "
        "Be informative and highlight key product advantages."
    ),
    "complaint": (
        "You are a customer relations officer at Acme Corporation. "
        "You help customers with complaint filing, escalation procedures, SLA terms, "
        "customer rights, and grievance redressal. Use ONLY the provided context to answer. "
        "If the context doesn't contain the answer, say so clearly. "
        "Be empathetic, professional, and provide clear next steps."
    ),
    "faq": (
        "You are a general customer service assistant at Acme Corporation. "
        "You help customers with company policies, general questions, contact information, "
        "office hours, and location. Use ONLY the provided context to answer. "
        "If the context doesn't contain the answer, say so clearly. "
        "Be polite, clear, and direct."
    ),
}


def _agent_node(state: AgentState, agent_name: str) -> AgentState:
    """Generic agent node — retrieves context and generates a response."""
    print(f"  [{agent_name.upper()} Agent] Retrieving relevant context...")

    context = _retrieve_chunks(state["query"], agent_name)
    system_prompt = AGENT_SYSTEM_PROMPTS[agent_name]

    prompt = (
        f"{system_prompt}\n\n"
        f"CONTEXT FROM KNOWLEDGE BASE:\n{context}\n\n"
        f"CUSTOMER QUESTION: {state['query']}\n\n"
        f"YOUR RESPONSE:"
    )

    llm = _get_llm(temperature=0.1)
    response = llm.invoke(prompt)

    print(f"  [{agent_name.upper()} Agent] Response generated.")

    # Return only the state update to enable clean reduction during parallel execution
    return {"agent_outputs": {agent_name: _clean_llm_content(response.content)}}


def billing_node(state: AgentState) -> AgentState:
    """Billing agent RAG node."""
    return _agent_node(state, "billing")


def technical_node(state: AgentState) -> AgentState:
    """Technical agent RAG node."""
    return _agent_node(state, "technical")


def product_node(state: AgentState) -> AgentState:
    """Product agent RAG node."""
    return _agent_node(state, "product")


def complaint_node(state: AgentState) -> AgentState:
    """Complaint agent RAG node."""
    return _agent_node(state, "complaint")


def faq_node(state: AgentState) -> AgentState:
    """FAQ agent RAG node."""
    return _agent_node(state, "faq")



AGGREGATOR_PROMPT = """You are a senior customer support coordinator at Acme Corporation.
Multiple specialist agents have each provided a response to the customer's query.
Your job is to combine these responses into ONE clear, coherent, and non-repetitive final answer.

RULES:
1. Merge overlapping information — do not repeat the same facts.
2. Maintain a professional and helpful tone.
3. Structure the response clearly. Use bullet points or sections if multiple topics are covered.
4. If agents provided conflicting information, note the discrepancy.
5. Do NOT mention that multiple agents were involved — present it as a single unified response.

CUSTOMER QUERY: {query}

AGENT RESPONSES:
{agent_responses}

YOUR COMBINED FINAL RESPONSE:"""


def aggregator_node(state: AgentState) -> AgentState:
    """Combines all agent outputs into a single coherent final response."""
    agent_outputs = state.get("agent_outputs", {})

    if not agent_outputs:
        state["final_response"] = "I'm sorry, I couldn't find relevant information for your query."
        return state

    # If only one agent responded, use its output directly
    if len(agent_outputs) == 1:
        final = list(agent_outputs.values())[0]
        print(f"  [Aggregator] Single agent response — passing through directly.")
        state["final_response"] = final
        return state

    # Multiple agents responded — combine via LLM
    agent_responses = ""
    for agent_name, response in agent_outputs.items():
        agent_responses += f"\n--- {agent_name.upper()} AGENT ---\n{response}\n"

    prompt = AGGREGATOR_PROMPT.format(
        query=state["query"],
        agent_responses=agent_responses,
    )

    print(f"  [Aggregator] Combining {len(agent_outputs)} agent responses...")

    llm = _get_llm(temperature=0.1)
    response = llm.invoke(prompt)

    print(f"  [Aggregator] Final response generated.")
    state["final_response"] = _clean_llm_content(response.content)
    return state
