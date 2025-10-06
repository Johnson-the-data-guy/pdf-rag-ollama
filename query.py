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
You are an expert assistant. Your primary task is to answer the user's question based only on the following context.
- Your answer should be concise, but provide enough detail to thoroughly answer the question.
- After generating the initial answer, you must proofread it carefully. Correct any typos, grammatical errors, or nonsensical word combinations to ensure the final output is in standard, no-nonsense English.

Context:
{context}

---

Based on the context provided, answer the following question: {question}
"""


def main():
    # Create CLI
    parser = argparse.ArgumentParser()
    parser.add_argument("query_text", type=str, help="The query text.")
    args = parser.parse_args()
    query_text = args.query_text

    # Prepare the DB with the Ollama embedding function
    embedding_function = OllamaEmbeddings(model=EMBEDDING_MODEL)
    db = Chroma(persist_directory=CHROMA_PATH, embedding_function=embedding_function)

    # Search the DB
    results = db.similarity_search(query_text, k=3)

    if len(results) == 0:
        print("Unable to find matching results.")
        return

    context_text = "\n\n---\n\n".join([doc.page_content for doc in results])
    prompt_template = ChatPromptTemplate.from_template(PROMPT_TEMPLATE)
    prompt = prompt_template.format(context=context_text, question=query_text)
    print(prompt)

    # --- USE THE OLLAMA CHAT MODEL ---
    print("\nGenerating answer...")
    model = ChatOllama(model=CHAT_MODEL)

    # Use the new 'invoke' method instead of the deprecated 'predict'
    response = model.invoke(prompt)
    response_text = response.content

    sources = [doc.metadata.get("source", None) for doc in results]
    formatted_response = f"\nResponse: {response_text}\n\nSources: {sources}"
    print(formatted_response)


if __name__ == "__main__":
    main()
