

import os
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import FastEmbedEmbeddings
from langchain_chroma import Chroma


KNOWLEDGE_BASES = {
    "knowledge_base_1": "billing",
    "knowledge_base_2": "technical",
    "knowledge_base_3": "product",
    "knowledge_base_4": "complaint",
    "knowledge_base_5": "faq",
}

CHROMA_PERSIST_DIR = os.path.join(os.path.dirname(__file__), "chroma_db")
COLLECTION_NAME = "rag_knowledge_base"


def get_embedding_function():
    """Returns FastEmbed local embedding model (bge-small-en-v1.5)."""
    return FastEmbedEmbeddings()


def load_and_chunk_pdfs():
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len,
        separators=["\n\n", "\n", ". ", " ", ""],
    )

    all_chunks = []
    base_dir = os.path.dirname(__file__)

    for folder, agent_category in KNOWLEDGE_BASES.items():
        folder_path = os.path.join(base_dir, folder)
        if not os.path.exists(folder_path):
            print(f"  [SKIP] Folder not found: {folder_path}")
            continue

        pdf_files = [f for f in os.listdir(folder_path) if f.endswith(".pdf")]
        for pdf_file in pdf_files:
            pdf_path = os.path.join(folder_path, pdf_file)
            print(f"  Loading: {folder}/{pdf_file} (category: {agent_category})")

            loader = PyPDFLoader(pdf_path)
            pages = loader.load()

            # Split pages into smaller chunks
            chunks = text_splitter.split_documents(pages)

            # Tag each chunk with metadata for filtered retrieval
            for chunk in chunks:
                chunk.metadata["agent"] = agent_category
                chunk.metadata["source_file"] = pdf_file
                chunk.metadata["category"] = agent_category

            all_chunks.extend(chunks)
            print(f"    -> {len(chunks)} chunks extracted")

    return all_chunks


def ingest():
    """Main ingestion pipeline."""
    print("=" * 60)
    print("MULTI-AGENT RAG — DOCUMENT INGESTION")
    print("=" * 60)

    # Check if database already exists and is populated to skip ingestion
    if os.path.exists(CHROMA_PERSIST_DIR):
        print(f"ChromaDB directory found at {CHROMA_PERSIST_DIR}.")
        try:
            embeddings = get_embedding_function()
            vectorstore = Chroma(
                persist_directory=CHROMA_PERSIST_DIR,
                embedding_function=embeddings,
                collection_name=COLLECTION_NAME,
            )
            count = vectorstore._collection.count()
            if count > 0:
                print(f"Database already contains {count} vectors. Skipping ingestion.")
                print("=" * 60)
                return
        except Exception as e:
            print(f"Error checking existing database: {e}. Proceeding with re-ingestion...")

    # Step 1: Load and chunk
    print("\n[1/3] Loading and chunking PDFs...")
    chunks = load_and_chunk_pdfs()
    print(f"\nTotal chunks across all categories: {len(chunks)}")

    # Step 2: Initialize embeddings
    print("\n[2/3] Initializing FastEmbed local embeddings...")
    embeddings = get_embedding_function()

    # Step 3: Store in ChromaDB
    print(f"\n[3/3] Storing in ChromaDB at: {CHROMA_PERSIST_DIR}...")
    
    batch_size = 200
    vectorstore = None
    
    for i in range(0, len(chunks), batch_size):
        batch = chunks[i:i+batch_size]
        print(f"  Embedding and saving chunks {i} to {min(i + batch_size, len(chunks))} / {len(chunks)}...")
        if vectorstore is None:
            vectorstore = Chroma.from_documents(
                documents=batch,
                embedding=embeddings,
                persist_directory=CHROMA_PERSIST_DIR,
                collection_name=COLLECTION_NAME,
            )
        else:
            vectorstore.add_documents(batch)

    # Verify
    count = vectorstore._collection.count()
    print(f"\nIngestion complete! ChromaDB now contains {count} vectors.")

    # Print breakdown by category
    for category in KNOWLEDGE_BASES.values():
        cat_results = vectorstore.get(where={"agent": category})
        cat_count = len(cat_results["ids"])
        print(f"  -> {category}: {cat_count} chunks")

    print("\n" + "=" * 60)
    print("INGESTION FINISHED SUCCESSFULLY")
    print("=" * 60)


if __name__ == "__main__":
    ingest()
