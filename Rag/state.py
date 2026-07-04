from typing import TypedDict, List, Annotated


def merge_outputs(left: dict, right: dict) -> dict:
    """Reducer function that merges two dictionaries of agent outputs.
    
    This is required in LangGraph to handle concurrent updates to state
    keys when executing parallel branches (fan-out / map-reduce).
    """
    new_dict = left.copy() if left else {}
    new_dict.update(right)
    return new_dict


class AgentState(TypedDict):
    """State object that flows through the LangGraph multi-agent pipeline.

    Attributes:
        query: The original user question.
        history: Conversation history (list of dicts with 'role' and 'content').
        intents: List of classified intents, e.g. ["billing", "technical"].
        agent_outputs: Dict mapping agent name to its generated response (merged via reducer).
        final_response: The aggregated final answer returned to the user.
    """
    query: str
    history: List[dict]
    intents: List[str]
    agent_outputs: Annotated[dict, merge_outputs]
    final_response: str
