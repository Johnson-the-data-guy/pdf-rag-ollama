# RAG V2: Chain & Memory with Google Gemini + Docling

> **Advanced conversational RAG system with session-based memory, LangChain orchestration, and intelligent document parsing**

---

## 📋 Overview

This is the **second iteration** of the RAG (Retrieval-Augmented Generation) system, featuring significant architectural improvements over V1. It transforms a stateless, manually-orchestrated pipeline into a **production-ready conversational AI** with persistent session memory and enterprise-grade document processing.

### Evolution from V1

| Feature               | V1 (Manual/Flask)         | V2 (Chain/FastAPI)                              |
| --------------------- | ------------------------- | ----------------------------------------------- |
| **Framework**         | Flask (Simple)            | FastAPI (Async, Type-Safe, Auto-Docs)           |
| **Document Parsing**  | Tesseract OCR (Raw Text)  | Docling (Layout & Table Preservation)           |
| **Text Chunking**     | Recursive Character Split | Hybrid Chunking (Semantic/Structure-Aware)      |
| **Orchestration**     | Manual Loops              | LangChain Chains (ConversationalRetrievalChain) |
| **Memory Management** | None (Stateless)          | Session-Based Memory (Multi-User Stateful)      |
| **LLM Backend**       | Ollama (Local)            | Google Gemini (Cloud API)                       |
| **Session Handling**  | No persistence            | In-memory session store with unique IDs         |

---

## 🚀 Key Features

### 1. **Session-Based Conversational Memory**

**The Challenge**: REST APIs are stateless by default—each request is independent.

**Our Solution**: Server-side session management

- Each user gets a unique `session_id`
- Conversations are stored in memory using `ConversationBufferMemory`
- Sessions persist across multiple requests until server restart
- Enables true multi-turn conversations without client-side history management

```python
# Session storage
sessions: Dict[str, ConversationalRetrievalChain] = {}

# Automatic session creation
if session_id not in sessions:
    sessions[session_id] = get_conversation_chain(vectorstore)
```

**Benefits**:

- ✅ No need to send chat history with every request
- ✅ Supports multiple concurrent users
- ✅ Reduces payload size and network overhead
- ✅ Natural conversation flow without frontend complexity

### 2. **Intelligent Document Parsing with Docling**

**Problem with V1**: Tesseract OCR produced unstructured text, losing critical document structure.

**Solution**: Docling's advanced parsing engine preserves:

- **Document hierarchy** (headers, subheaders, sections)
- **Table structures** with proper cell relationships
- **Bounding boxes** for spatial layout understanding
- **Font styles** and formatting metadata
- **Reading order** based on document flow

**Smart Caching System**:

```python
# First run: Full OCR processing (slow)
converter.convert(PDF_PATH)
docling_doc.save_as_json(CACHE_EXTRACT_DOC)

# Subsequent runs: Load from cache (instant)
docling_doc = DoclingDocument.load_from_json(CACHE_EXTRACT_DOC)
```

### 3. **Hybrid Chunking Strategy**

Unlike naive text splitters that break documents at arbitrary character counts, our hybrid approach:

- **Respects semantic boundaries** (paragraphs, sections)
- **Preserves context** by keeping headers with their content
- **Maintains table integrity** (doesn't split tables mid-row)
- **Optimizes for embeddings** (fits within model context windows)
- **Uses tokenizer-based math** for precise boundary detection

```python
chunker = HybridChunker()
chunk_iter = chunker.chunk(dl_doc=docling_doc)
# Each chunk maintains metadata about its source location
```

### 4. **LangChain ConversationalRetrievalChain**

**V1 Manual Flow** (Brittle & Error-Prone):

```python
# You wrote everything manually
query_embedding = embed(query)
results = vector_db.search(query_embedding)
context = format_results(results)
prompt = build_prompt(query, context, history)
response = llm.generate(prompt)
```

**V2 Chain Flow** (Robust & Maintainable):

```python
# LangChain orchestrates the entire pipeline
conversation_chain = ConversationalRetrievalChain.from_llm(
    llm=llm,
    retriever=vectorstore.as_retriever(),
    memory=memory,
    combine_docs_chain_kwargs={"prompt": PROMPT}
)
response = conversation_chain.invoke({"question": query_text})
```

**What the chain handles automatically**:

1. ✅ Question reformulation using chat history
2. ✅ Context-aware retrieval from vector database
3. ✅ Memory management (saving/loading chat history)
4. ✅ Prompt construction with context injection
5. ✅ Response generation and formatting

### 5. **Custom Academic Prompt Template**

Specialized prompt engineering for historical/academic queries:

- **Authoritative tone** with sophisticated vocabulary
- **Deep analytical responses** (causes, effects, nuances)
- **Structured output** (introduction, body, conclusion)
- **Source fidelity** (answers only from provided context)
- **Graceful handling** of unanswerable questions

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│            Frontend (React/JS)              │
│   { session_id: "abc123", query: "..." }   │
└──────────────────┬──────────────────────────┘
                   │ POST /chat
                   ▼
┌─────────────────────────────────────────────┐
│           FastAPI Backend (Port 8000)       │
├─────────────────────────────────────────────┤
│  Session Manager                            │
│  ├─ sessions: Dict[str, Chain]             │
│  └─ ConversationBufferMemory per session   │
├─────────────────────────────────────────────┤
│  ConversationalRetrievalChain              │
│  ├─→ Question Reformulator                 │
│  ├─→ Vector Retrieval (Chroma)            │
│  ├─→ Context + History Combiner           │
│  └─→ Gemini Response Generator            │
└──────────────┬──────────────────────────────┘
               │
    ┌──────────┴──────────┐
    ▼                     ▼
┌──────────────┐   ┌────────────────┐
│ Chroma Vector│   │ Google Gemini  │
│   Database   │   │   2.5 Flash    │
│  (Persistent)│   │   (Cloud API)  │
└──────────────┘   └────────────────┘
```

---

## 🛠️ Installation & Setup

### Prerequisites

- **Python 3.9+**
- **Tesseract OCR** installed ([Download here](https://github.com/tesseract-ocr/tesseract))
- **Google Gemini API key** ([Get one here](https://ai.google.dev/))

### 1. Clone & Navigate

```bash
cd v2_chain_google_docling
```

### 2. Create Virtual Environment

```bash
python -m venv venv

# Activate
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Create a `.env` file in the project root:

```env
GOOGLE_API_KEY=your_gemini_api_key_here
```

### 5. Configure Tesseract Path (Windows Users)

Update line 76 in `app_chain.py` with your Tesseract installation path:

```python
ocr_options.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
```

For macOS/Linux, Tesseract is usually in PATH, so you can remove this line or use:

```python
ocr_options.tesseract_cmd = "tesseract"  # Usually in PATH
```

### 6. Add Your PDF Document

Place your PDF file in the project root and update the path in the code:

```python
PDF_PATH = "your_document.pdf"  # Line 33
```

---

## 🎯 Usage

### Starting the Server

**Option 1: Direct Python**

```bash
python app_chain.py
```

**Option 2: Uvicorn (Recommended)**

```bash
uvicorn app_chain:app --host 0.0.0.0 --port 8000 --reload
```

The server will start on `http://localhost:8000`

### First Run: Document Processing

On the **first startup**, the system will:

1. 🔍 Check for existing vector database (`chroma_db/`)
2. 📄 If not found, look for cached Docling extraction (`docling_extract.json`)
3. 🔄 If cache missing, process PDF with full OCR (takes 2-5 minutes)
4. 🧩 Chunk document using HybridChunker
5. 💾 Create embeddings and save to Chroma database
6. 📦 Cache Docling document for future runs

**Subsequent startups**: Instant (loads from existing database)

### Interactive API Documentation

FastAPI automatically generates interactive docs:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

Test the `/chat` endpoint directly from your browser!

---

## 📚 API Endpoints

### `POST /chat`

Send a question and receive a context-aware answer

**Request Body**:

```json
{
  "query_text": "What were the main causes of World War I?",
  "session_id": "user_abc123"
}
```

**Response**:

```json
{
  "response": "The Great War, as contemporaries termed it, emerged from a complex web of interrelated factors..."
}
```

**Key Parameters**:

- `query_text`: Your question (string)
- `session_id`: Unique identifier for conversation continuity (string)

**Session ID Best Practices**:

- Use UUIDs for production: `crypto.randomUUID()` (JavaScript)
- Keep session_id consistent for the same conversation
- Generate new session_id for new conversation threads

---

## 💬 Example Conversation Flow

```javascript
// First message - creates new session
POST /chat
{
  "session_id": "conv_001",
  "query_text": "Tell me about the Treaty of Versailles"
}
// Response: "The Treaty of Versailles, signed on June 28, 1919..."

// Follow-up question - uses same session
POST /chat
{
  "session_id": "conv_001",  // Same ID!
  "query_text": "What were its main consequences?"
}
// Response: "The treaty's harsh reparations provisions..."
// ✅ AI remembers we're discussing Versailles

// New conversation - different session
POST /chat
{
  "session_id": "conv_002",  // Different ID
  "query_text": "What were its main consequences?"
}
// Response: "I don't have enough context to answer that question..."
// ✅ New session = no memory of previous conversation
```

---

## 🔧 Configuration

### Key Constants (Lines 30-36)

```python
CACHE_EXTRACT_DOC = "docling_extract.json"  # Docling cache file
PDF_PATH = "modern_history.pdf"              # Your source document
DB_PATH = "chroma_db"                        # Vector database directory
EMBEDDING_MODEL = "models/text-embedding-004" # Google embedding model
LLM_MODEL = "gemini-2.5-flash"              # Gemini model for responses
```

### Customizing the System

**Change chunk size** (modify HybridChunker parameters):

```python
chunker = HybridChunker(
    max_tokens=512,  # Default: 1024
    min_tokens=64
)
```

**Adjust LLM creativity**:

```python
llm = ChatGoogleGenerativeAI(
    model=LLM_MODEL,
    temperature=0.7  # 0.0 = deterministic, 1.0 = creative
)
```

**Modify retrieval count**:

```python
retriever=vectorstore.as_retriever(
    search_kwargs={"k": 5}  # Return top 5 chunks (default: 4)
)
```

---

## 🔍 Technical Deep Dive

### Why Session-Based Memory?

**Comparison of Approaches**:

| Approach                | Pros                          | Cons                     | Best For                |
| ----------------------- | ----------------------------- | ------------------------ | ----------------------- |
| **Stateless (V1)**      | Simple, scalable              | No conversation memory   | Single-shot Q&A         |
| **Client-Side History** | Works with any backend        | Large payloads, insecure | Prototypes              |
| **Session Store (V2)**  | Efficient, secure, natural UX | Requires server memory   | Production chatbots     |
| **Database Sessions**   | Survives restarts             | Overhead, complexity     | Enterprise applications |

### Metadata Filtering Explained

Chroma (vector database) cannot handle nested metadata structures like bounding boxes:

```python
# Raw Docling metadata (causes errors)
metadata = {
    "bbox": {"x": 100, "y": 200, "width": 300, "height": 50},  # ❌ Nested dict
    "page": 1  # ✅ Simple value
}

# After filter_complex_metadata()
metadata = {
    "page": 1  # ✅ Only simple types remain
}
```

### OCR Pipeline Options

```python
pipeline_options = PdfPipelineOptions()
pipeline_options.do_ocr = True  # Enable OCR for scanned PDFs

# For digital PDFs (faster):
pipeline_options.do_ocr = False  # Skip OCR, extract text directly
```

---

## 🚨 Troubleshooting

### Issue: "Vector Database not found"

**Solution**: Ensure PDF exists at `PDF_PATH` on first run. Delete `chroma_db/` folder to force reprocessing.

### Issue: "TesseractNotFoundError"

**Solution**:

1. Install Tesseract: https://github.com/tesseract-ocr/tesseract
2. Update path in code (line 76)
3. Verify installation: `tesseract --version`

### Issue: "GOOGLE_API_KEY not found"

**Solution**:

- Check `.env` file exists in project root
- Verify key format: `GOOGLE_API_KEY=AIza...` (no quotes)
- Restart server after adding `.env`

### Issue: "Session not found after server restart"

**Solution**: Sessions are stored in memory. After restart:

- All sessions are cleared
- Users need to start new conversations
- For persistence, implement Redis or database sessions

### Issue: "Out of memory with large PDFs"

**Solution**:

```python
# Reduce chunk size
chunker = HybridChunker(max_tokens=256)

# Process pages in batches
pipeline_options.max_pages = 50  # Process first 50 pages
```

### Issue: "CORS errors from frontend"

**Solution**: The current config allows all origins:

```python
allow_origins=["*"]  # Already configured
```

For production, restrict to your domain:

```python
allow_origins=["https://yourdomain.com"]
```

---

## 📦 Dependencies Explained

```txt
fastapi              # Modern async web framework with auto-docs
uvicorn             # Lightning-fast ASGI server
pydantic            # Data validation for request/response models
python-dotenv       # Environment variable management

docling             # Advanced PDF parsing with layout preservation
docling-core        # Core document models and utilities

langchain           # LLM orchestration framework
langchain-google-genai  # Google Gemini integration
langchain-community # Community-contributed integrations
chromadb            # Vector database for embeddings
sentence-transformers  # Embedding model utilities

python-multipart    # File upload support (for future /upload endpoint)
```

---

## 🎓 How It Works: Request Flow

1. **Request Arrives**: Client sends `{session_id, query_text}` to `/chat`

2. **Session Lookup**: Server checks if `session_id` exists in memory

   - If new: Create new `ConversationBufferMemory` + Chain
   - If exists: Retrieve existing chain with full history

3. **Chain Execution**:

   ```
   User Question → Memory Retrieval → Question Reformulation
   → Vector Search → Context Assembly → LLM Generation
   → Memory Update → Response Return
   ```

4. **Memory Update**: Chain automatically saves interaction

   ```python
   # Happens internally:
   memory.save_context(
       {"input": query_text},
       {"output": response["answer"]}
   )
   ```

5. **Response**: JSON returned to client, session persists in memory

---

## 🔐 Security Considerations

### Current Setup (Development)

- ✅ API keys in `.env` (not committed to git)
- ⚠️ CORS allows all origins
- ⚠️ No rate limiting
- ⚠️ Sessions stored in memory (cleared on restart)

### Production Recommendations

```python
# 1. Restrict CORS
allow_origins=["https://yourdomain.com"]

# 2. Add authentication
from fastapi import Depends, HTTPException, Security
from fastapi.security import HTTPBearer

security = HTTPBearer()

@app.post("/chat")
async def handle_chat(
    request: ChatRequest,
    credentials: HTTPBearer = Depends(security)
):
    # Validate token...

# 3. Add rate limiting
from slowapi import Limiter
limiter = Limiter(key_func=get_remote_address)

@app.post("/chat")
@limiter.limit("10/minute")
async def handle_chat(...):
    ...

# 4. Use persistent sessions (Redis)
from langchain.memory import RedisChatMessageHistory
```

---

## 🚀 Performance Optimization Tips

### 1. Embedding Batch Size

```python
# Process embeddings in batches
vectorstore = Chroma.from_documents(
    documents=docs,
    embedding=embeddings,
    batch_size=100  # Adjust based on API limits
)
```

### 2. Retrieval Optimization

```python
# Use MMR (Maximal Marginal Relevance) for diverse results
retriever = vectorstore.as_retriever(
    search_type="mmr",
    search_kwargs={"k": 4, "fetch_k": 20}
)
```

### 3. Response Streaming (Future Enhancement)

```python
# Stream responses for better UX
async for chunk in conversation_chain.astream({...}):
    yield chunk
```

---

## 🔜 Future Enhancements

- [ ] **Persistent session storage** (Redis/PostgreSQL)
- [ ] **File upload endpoint** (dynamic document ingestion)
- [ ] **Multi-document support** (cross-reference multiple PDFs)
- [ ] **Streaming responses** (real-time token generation)
- [ ] **Source citation** (return specific page/section references)
- [ ] **User authentication** (JWT-based access control)
- [ ] **Rate limiting** (prevent API abuse)
- [ ] **Session cleanup** (auto-expire inactive sessions)
- [ ] **Export conversations** (download chat history as PDF/JSON)
- [ ] **Admin dashboard** (monitor active sessions, usage stats)

---

## 📚 Learning Resources

- [LangChain Conversational Chains](https://python.langchain.com/docs/use_cases/question_answering/chat_history)
- [Docling Documentation](https://github.com/DS4SD/docling)
- [FastAPI Tutorial](https://fastapi.tiangolo.com/tutorial/)
- [Google Gemini API](https://ai.google.dev/docs)
- [Chroma Vector Database](https://docs.trychroma.com/)
- [Session Management Patterns](https://fastapi.tiangolo.com/tutorial/security/)

---

## 🤝 Contributing

Contributions are welcome! Please ensure:

- ✅ Code follows PEP 8 style guidelines
- ✅ All endpoints have proper type hints
- ✅ New features include docstrings
- ✅ Test with multiple concurrent sessions

---

## 📄 License

MIT License - See LICENSE file for details

---

**Built with ❤️ using LangChain, Docling, FastAPI, and Google Gemini**

_"History is not a burden on the memory but an illumination of the soul." — Lord Acton_
