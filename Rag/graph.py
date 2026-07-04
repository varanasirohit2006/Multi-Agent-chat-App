from langgraph.graph import StateGraph, END
from state import AgentState
from nodes import (
    intent_node,
    billing_node,
    technical_node,
    product_node,
    complaint_node,
    faq_node,
    aggregator_node
)

# Define routing function
def route_intents(state: AgentState):
    """
    Conditional router that reads the classified intents from state
    and returns a list of target node names to execute in parallel.
    """
    intents = state.get("intents", [])
    if not intents:
        # Fallback to billing if no intent is classified
        return ["billing"]
    return intents

# Initialize the StateGraph
workflow = StateGraph(AgentState)

# Add all nodes
workflow.add_node("intent", intent_node)
workflow.add_node("billing", billing_node)
workflow.add_node("technical", technical_node)
workflow.add_node("product", product_node)
workflow.add_node("complaint", complaint_node)
workflow.add_node("faq", faq_node)
workflow.add_node("aggregator", aggregator_node)

# Set entry point
workflow.set_entry_point("intent")

# Add conditional edges from intent node
workflow.add_conditional_edges(
    "intent",
    route_intents,
    {
        "billing": "billing",
        "technical": "technical",
        "product": "product",
        "complaint": "complaint",
        "faq": "faq",
    }
)

# Connect all agent nodes to the aggregator (fan-in / join point)
workflow.add_edge("billing", "aggregator")
workflow.add_edge("technical", "aggregator")
workflow.add_edge("product", "aggregator")
workflow.add_edge("complaint", "aggregator")
workflow.add_edge("faq", "aggregator")

# End the workflow after aggregation
workflow.add_edge("aggregator", END)

# Compile graph
app = workflow.compile()
