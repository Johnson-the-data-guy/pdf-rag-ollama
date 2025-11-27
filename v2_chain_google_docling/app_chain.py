import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

# docling imports
from docling.document_converter import DocumentConverter, PdfFormatOption
from docling.datamodel.base_models import InputFormat
from docling.datamodel.pipeline_options import (
    PdfPipelineOptions,
    TesseractCliOcrOptions,
)
from docling.chunking import HybridChunker
from docling.datamodel.document import DoclingDocument

# langchain imports
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_classic.chains import ConversationalRetrievalChain
from langchain_classic.memory import ConversationBufferMemory
from langchain_core.prompts import PromptTemplate
from langchain_community.vectorstores import Chroma
from langchain_core.documents import Document
from langchain_community.vectorstores.utils import filter_complex_metadata

# Configuration
load_dotenv()
app = FastAPI(title="RAG Chain API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (React on port 5173)
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (POST, OPTIONS, GET)
    allow_headers=["*"],  # Allows all headers
)

# constants
CACHE_EXTRACT_DOC = "docling_extract.json"
PDF_PATH = "modern_history.pdf"
DB_PATH = "chroma_db"
EMBEDDING_MODEL = "models/text-embedding-004"  # Often requires 'models/' prefix
LLM_MODEL = "gemini-2.5-flash"


class ChatRequest(BaseModel):
    query_text: str
    session_id: str


# --- 2. GLOBAL STORE ---
# Acts like st.session_state but for multiple users
sessions: Dict[str, ConversationalRetrievalChain] = {}


def get_vectorstores():
    embeddings = GoogleGenerativeAIEmbeddings(model=EMBEDDING_MODEL)
    print("✅ Loading existing Vector Database...")
    if os.path.exists(DB_PATH) and os.listdir(DB_PATH):
        return Chroma(persist_directory=DB_PATH, embedding_function=embeddings)

    print("Vectorstore not found...Creating one")
    docling_doc = None

    if os.path.exists(CACHE_EXTRACT_DOC):
        print("Loading Docling object from JSON cache (Skipping OCR)...")
        try:
            docling_doc = DoclingDocument.load_from_json(CACHE_EXTRACT_DOC)
        except Exception as e:
            print("Corrupted cache. Proceeding to conversion")

    if not docling_doc and os.path.exists(PDF_PATH):
        print("📄 PDF found. Running full Docling conversion (This may take time)...")

        # 1. Configure the docling pipeline
        pipeline_options = PdfPipelineOptions()
        pipeline_options.do_ocr = True

        ocr_options = TesseractCliOcrOptions()
        ocr_options.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
        ocr_options.lang = ["eng"]
        pipeline_options.ocr_options = ocr_options
        # -------------------------------------------
        # 2. Create the docling converter
        converter = DocumentConverter(
            format_options={
                InputFormat.PDF: PdfFormatOption(pipeline_options=pipeline_options)
            }
        )
        result = converter.convert(PDF_PATH)
        docling_doc = result.document

        # saving cache document
        print("Saving docling document to cache path for future purpose")
        docling_doc.save_as_json(CACHE_EXTRACT_DOC)

    # Chunking
    print("Chunking with docling HybridChunker")
    docs = []

    # HybridChunker requires the DoclingDocument object, which we now have
    chunker = HybridChunker()
    chunk_iter = chunker.chunk(dl_doc=docling_doc)

    # Convert Docling Chunks -> LangChain Documents
    for chunk in chunk_iter:
        docs.append(
            Document(page_content=chunk.text, metadata=chunk.meta.export_json_dict())
        )

    # This removes lists/dicts from metadata (like bounding boxes) so Chroma doesn't crash
    print("🧹 Filtering complex metadata for Chroma compatibility...")
    docs = filter_complex_metadata(docs)

    # 4. Create Vector Store
    if docs:
        print(f"💾 Saving {len(docs)} chunks to Chroma...")
        vectorstore = Chroma.from_documents(
            documents=docs, embedding=embeddings, persist_directory=DB_PATH
        )
        print("✅ Database created successfully!")
        return vectorstore
    return None


vectorstore = get_vectorstores()


def get_conversation_chain(vectorstore):
    """
    Creates the Chain with persistent buffer memory.
    """
    llm = ChatGoogleGenerativeAI(model=LLM_MODEL, temperature=0.7)

    # This memory object stays alive in the 'sessions' dictionary
    memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)

    prompt_template = """
        You are a distinguished academic historian and an expert encyclopedic assistant. Your goal is to provide exhaustive, highly detailed, and intellectually enriching responses based on the provided document context.

        Please adhere to the following style guidelines:
        1. **Tone:** Authoritative, eloquent, and poised. Use sophisticated vocabulary and varied sentence structures.
        2. **Depth:** Do not merely summarize. Analyze the causes, effects, and nuances of the historical events described.
        3. **Structure:** Organize your response logically with a powerful introduction, detailed thematic body paragraphs, and a conclusion on historical significance.
        4. **Accuracy:** Answer strictly based on the context provided below. If the answer is not in the context, politely state that the document does not contain that information.

        Context:
        {context}

        Chat History:
        {chat_history}

        Question: {question}

        Detailed Historical Answer:
        """

    PROMPT = PromptTemplate(
        template=prompt_template,
        input_variables=["context", "chat_history", "question"],
    )

    conversation_chain = ConversationalRetrievalChain.from_llm(
        llm=llm,
        retriever=vectorstore.as_retriever(),
        memory=memory,
        combine_docs_chain_kwargs={"prompt": PROMPT},
    )
    return conversation_chain


@app.post("/chat")
async def handle_chat(request: ChatRequest):
    if not vectorstore:
        raise HTTPException(
            status_code=500, detail="Vector Database not found. Run ingestion first."
        )

    try:
        # Check if this user already has an active session (Memory)
        if request.session_id not in sessions:
            print(f"🆕 Creating new memory for session: {request.session_id}")
            sessions[request.session_id] = get_conversation_chain(vectorstore)

        # Retrieve the user's specific chain (with their history preserved)
        active_chain = sessions[request.session_id]

        # Run the chain
        response = active_chain.invoke({"question": request.query_text})

        return {"response": response["answer"]}

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
