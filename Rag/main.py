import os
import sys
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
import pypdf

# Load env variables first
load_dotenv()

# Import the compiled LangGraph workflow
try:
    from graph import app
except ImportError as e:
    print(f"Error importing graph workflow: {e}")
    app = None

def callLlm(prompt: str):
    model_name = os.getenv("LLM_MODEL_NAME", "gemma-4-31b-it")
    llm = ChatGoogleGenerativeAI(
        model=model_name,
        temperature=0
    )
    response = llm.invoke(prompt)
    return response.content


def read_pdf(path: str , text_content : list[str]):
    with open(path, "rb") as f:
        reader = pypdf.PdfReader(f)
        
        for page in reader.pages:
            extracted_text = page.extract_text()
            if extracted_text:
                text_content.append(extracted_text)


def extract_text_from_pdf(filepaths : list[str]) -> str:
    text_content = []
    for path in filepaths:
        read_pdf(path, text_content)
    return "\n".join(text_content)


def run_pipeline(query: str):
    """Runs a single query through the LangGraph multi-agent pipeline."""
    if not app:
        print("Error: Compiled LangGraph application is not available.")
        return

    # Check if database exists
    chroma_dir = os.path.join(os.path.dirname(__file__), "chroma_db")
    if not os.path.exists(chroma_dir):
        print("\n[WARNING] 'chroma_db' folder not found. Please run 'python ingest.py' first to populate the vector database!\n")
        return

    print("\n" + "=" * 50)
    print(f"Processing Query: \"{query}\"")
    print("=" * 50)

    # Initialize state
    initial_state = {
        "query": query,
        "history": [],
        "intents": [],
        "agent_outputs": {},
        "final_response": ""
    }

    # Execute graph
    # We use stream() to show the steps happening in real-time
    try:
        final_response = "I'm sorry, I couldn't process your query."
        events = app.stream(initial_state)
        for event in events:
            for node_name, output in event.items():
                print(f"\n>> Node '{node_name}' finished.")
                if node_name == "intent":
                    print(f"   Routed to: {output.get('intents', [])}")
                elif node_name in ["billing", "technical", "product", "complaint"]:
                    print(f"   {node_name.capitalize()} response generated successfully.")
                elif node_name == "aggregator":
                    print("   Responses combined.")
                    if "final_response" in output:
                        final_response = output["final_response"]
        
        print("\n" + "=" * 50)
        print("FINAL RESPONSE:")
        print("=" * 50)
        print(final_response)
        print("=" * 50 + "\n")
        
    except Exception as e:
        print(f"\nAn error occurred during workflow execution: {e}")


def main():
    """Interactive loop to query the RAG system."""
    print("=" * 60)
    print("ACME CORP MULTI-AGENT RAG CLI")
    print("=" * 60)
    print("Type 'exit' or 'quit' to end the session.")
    
    # Check if database is populated
    chroma_dir = os.path.join(os.path.dirname(__file__), "chroma_db")
    if not os.path.exists(chroma_dir):
        print("\n[INFO] Initializing first-time setup: Ingesting documents...")
        try:
            import ingest
            ingest.ingest()
        except Exception as e:
            print(f"Auto-ingestion failed: {e}. Please run 'python ingest.py' manually.")
            
    while True:
        try:
            query = input("\nEnter your query: ").strip()
            if not query:
                continue
            if query.lower() in ["exit", "quit"]:
                print("Goodbye!")
                break
                
            run_pipeline(query)
            
        except KeyboardInterrupt:
            print("\nGoodbye!")
            break
        except Exception as e:
            print(f"Error in main loop: {e}")

if __name__ == "__main__":
    # If a command line query is provided, run it directly; otherwise start interactive CLI
    if len(sys.argv) > 1:
        load_dotenv()
        query_str = " ".join(sys.argv[1:])
        run_pipeline(query_str)
    else:
        main()
