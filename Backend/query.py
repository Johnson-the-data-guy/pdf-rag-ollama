import argparse
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import OllamaEmbeddings
from langchain_community.chat_models import ChatOllama
from langchain.prompts import ChatPromptTemplate

# --- SETTINGS ---
CHROMA_PATH = "chroma"
EMBEDDING_MODEL = "nomic-embed-text"
# Use a smaller, faster model for the chat function.
CHAT_MODEL = "phi3"

PROMPT_TEMPLATE = """
You are a helpful assistant. Your task is to answer the user's question clearly and accurately, based only on the provided context.

- Be direct and concise in your response.
- Ensure the answer is well-written, in standard English, and free of errors.
- Do not add any information that is not found in the context below.

Context:
{context}

---

Based on the context, please answer the following question: {question}
"""


def query_rag(query_text: str):
    """
    This is the core RAG function. It takes a query, searches the database,
    and returns the model's response and the sources.
    """
    # Prepare the DB
    embedding_function = OllamaEmbeddings(model=EMBEDDING_MODEL)
    db = Chroma(persist_directory=CHROMA_PATH, embedding_function=embedding_function)

    # Search the DB
    results = db.similarity_search(query_text, k=5)

    if not results:
        return "Unable to find matching results.", []

    context_text = "\n\n---\n\n".join([doc.page_content for doc in results])
    prompt_template = ChatPromptTemplate.from_template(PROMPT_TEMPLATE)
    prompt = prompt_template.format(context=context_text, question=query_text)

    # Use the Ollama Chat Model
    model = ChatOllama(model=CHAT_MODEL)
    response = model.invoke(prompt)

    sources = [doc.metadata.get("source", None) for doc in results]

    return response.content, sources


def main():
    """
    This function handles the command-line interface for the script.
    """
    # Create CLI
    parser = argparse.ArgumentParser(
        description="Query a RAG model with a PDF document."
    )
    parser.add_argument(
        "query_text", type=str, help="The question to ask the document."
    )
    args = parser.parse_args()
    query_text = args.query_text

    print(f"Query: {query_text}")
    print("\nGenerating answer...")
    response_text, sources = query_rag(query_text)

    formatted_response = f"\nResponse: {response_text}\n\nSources: {sources}"
    print(formatted_response)


if __name__ == "__main__":
    main()
