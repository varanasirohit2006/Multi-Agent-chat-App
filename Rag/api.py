from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
import sys

# Ensure the directory of api.py is in the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

app = FastAPI(
    title="Acme Corp RAG API",
    description="FastAPI service for the Multi-Agent RAG customer support system",
    version="1.0.0"
)

# Enable CORS for frontend and other services
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Lazy-load the heavy LangGraph workflow to avoid blocking server startup
_workflow_app = None

def get_workflow():
    global _workflow_app
    if _workflow_app is None:
        from graph import app as compiled_app
        _workflow_app = compiled_app
    return _workflow_app


class QueryRequest(BaseModel):
    query: str
    history: Optional[List[Dict[str, Any]]] = None

class QueryResponse(BaseModel):
    query: str
    intents: List[str]
    agent_outputs: Dict[str, str]
    final_response: str

@app.get("/health")
def health_check():
    """Simple health check endpoint."""
    return {"status": "healthy", "service": "rag-api"}

@app.post("/query", response_model=QueryResponse)
async def query_rag(request: QueryRequest):
    """
    Submit a support query to the Multi-Agent RAG pipeline.
    """
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    try:
        workflow = get_workflow()

        initial_state = {
            "query": request.query,
            "history": request.history or [],
            "intents": [],
            "agent_outputs": {},
            "final_response": ""
        }

        result = workflow.invoke(initial_state)

        return QueryResponse(
            query=result.get("query", request.query),
            intents=result.get("intents", []),
            agent_outputs=result.get("agent_outputs", {}),
            final_response=result.get("final_response", "I'm sorry, I couldn't process your query.")
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error executing RAG workflow: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
