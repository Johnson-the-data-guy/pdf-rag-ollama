# AI History Assistant - RAG Chat Application

A full-stack Retrieval-Augmented Generation (RAG) application that enables users to chat with historical PDF documents using two different AI backends: a stateless manual RAG approach and a stateful conversational chain with memory.

## 🌟 Features

- **Dual Backend Architecture**: Switch seamlessly between two RAG implementations
  - **Manual RAG (Flask)**: Stateless queries using Ollama models
  - **Chain Memory (FastAPI)**: Stateful conversations with Google Gemini and persistent chat history
- **Modern Chat Interface**: Clean, dark-themed React UI with typing indicators
- **PDF Processing**: Advanced document extraction with OCR support via Docling
- **Vector Search**: Efficient semantic search using Chroma vector database
- **Session Management**: Maintains conversation context for follow-up questions
- **Preset Topics**: Quick access to predefined historical topics

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
│                    Port: 5173 (Vite)                        │
└─────────────────┬───────────────────────┬───────────────────┘
                  │                       │
        ┌─────────▼──────────┐  ┌────────▼─────────────┐
        │  Flask Backend     │  │  FastAPI Backend     │
        │  Port: 5000        │  │  Port: 8000          │
        │  (Stateless)       │  │  (Stateful)          │
        └─────────┬──────────┘  └────────┬─────────────┘
                  │                      │
        ┌─────────▼──────────┐  ┌────────▼─────────────┐
        │  Ollama Models     │  │  Google Gemini       │
        │  - nomic-embed-text│  │  - gemini-2.5-flash  │
        │  - phi3            │  │  - text-embedding-004│
        └────────────────────┘  └──────────────────────┘
                  │                      │
                  └──────────┬───────────┘
                             │
                    ┌────────▼──────────┐
                    │   Chroma Vector   │
                    │     Database      │
                    └───────────────────┘
```

## 📋 Prerequisites

### General Requirements

- **Python**: 3.8 or higher
- **Node.js**: 16.x or higher
- **npm** or **yarn**

### Backend-Specific Requirements

#### For Flask Backend (Manual RAG)

- **Ollama**: Must be installed and running locally
  - Download from: https://ollama.ai
  - Required models:
    ```bash
    ollama pull nomic-embed-text
    ollama pull phi3
    ```

#### For FastAPI Backend (Chain Memory)

- **Tesseract OCR**: For PDF text extraction
  - Windows: Download from https://github.com/UB-Mannheim/tesseract/wiki
  - Linux: `sudo apt-get install tesseract-ocr`
  - macOS: `brew install tesseract`
- **Google API Key**: For Gemini models
  - Get from: https://aistudio.google.com/app/apikey

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd <project-directory>
```

### 2. Frontend Setup

```bash
# Navigate to frontend directory (if separate) or root
npm install

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:5173`

### 3. Backend Setup

#### Flask Backend (Port 5000)

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install langchain-community chromadb ollama

# Ensure Ollama is running
ollama serve

# Run the Flask server
python flask_backend.py
```

#### FastAPI Backend (Port 8000)

```bash
# Create virtual environment (or use the same one)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install fastapi uvicorn python-dotenv docling langchain-google-genai \
            langchain-community chromadb pydantic

# Create .env file
echo "GOOGLE_API_KEY=your_api_key_here" > .env

# Update Tesseract path in code if needed (line 72)
# Default: C:\Program Files\Tesseract-OCR\tesseract.exe

# Run the FastAPI server
python fastapi_backend.py
```

## 📁 Project Structure

```
project/
│
├── App.tsx                      # React frontend application
├── flask_backend.py             # Manual RAG implementation (Ollama)
├── fastapi_backend.py           # Chain Memory implementation (Gemini)
├── modern_history.pdf           # Source PDF document
│
├── chroma/                      # Flask vector database
│   └── (generated files)
│
├── chroma_db/                   # FastAPI vector database
│   └── (generated files)
│
├── docling_extract.json         # Cached PDF extraction
├── .env                         # Environment variables
└── README.md                    # This file
```

## 🔧 Configuration

### Flask Backend (`flask_backend.py`)

```python
CHROMA_PATH = "chroma"              # Vector DB path
EMBEDDING_MODEL = "nomic-embed-text" # Ollama embedding model
CHAT_MODEL = "phi3"                 # Ollama chat model
```

### FastAPI Backend (`fastapi_backend.py`)

```python
PDF_PATH = "modern_history.pdf"           # Source PDF
DB_PATH = "chroma_db"                     # Vector DB path
EMBEDDING_MODEL = "models/text-embedding-004"  # Google embedding
LLM_MODEL = "gemini-2.5-flash"            # Google chat model
```

### Frontend (`App.tsx`)

```typescript
// Backend endpoints
Flask:   http://127.0.0.1:5000/query
FastAPI: http://127.0.0.1:8000/chat
```

## 📡 API Documentation

### Flask Backend - Manual RAG

#### Endpoint: `POST /query`

**Description**: Stateless RAG query using Ollama models

**Request Body**:

```json
{
  "query_text": "What caused World War I?"
}
```

**Response**:

```json
{
  "response": "World War I was caused by...",
  "sources": ["page1.pdf", "page2.pdf"]
}
```

**Features**:

- No conversation history
- Fast response with phi3 model
- Returns source documents
- Suitable for independent queries

---

### FastAPI Backend - Chain Memory

#### Endpoint: `POST /chat`

**Description**: Stateful conversational RAG with memory

**Request Body**:

```json
{
  "query_text": "Tell me more about that",
  "session_id": "session_abc123"
}
```

**Response**:

```json
{
  "response": "Based on our previous discussion..."
}
```

**Features**:

- Maintains conversation context
- Session-based memory management
- Follow-up question support
- Sophisticated prompt engineering
- OCR support for scanned PDFs

## 💡 Usage Examples

### Starting a Conversation

1. **Open the application** at `http://localhost:5173`
2. **Click the menu icon** (☰) to open the sidebar
3. **Select a backend**:
   - Manual RAG for single, independent questions
   - Chain Memory for multi-turn conversations
4. **Type your question** or select a preset topic

### Example Queries

**With Manual RAG (Flask)**:

```
Query: "Summarize the chapter on The Great War"
Response: [Independent, detailed answer]

Query: "What is imperialism?"
Response: [New independent answer - no context from previous query]
```

**With Chain Memory (FastAPI)**:

```
User: "What caused World War I?"
AI: [Detailed answer about WWI causes]

User: "How did it end?"
AI: [Answer with context from previous question about WWI]

User: "What were the consequences?"
AI: [Continues the conversation about WWI]
```

## 🎨 Frontend Features

### User Interface

- **Dark Theme**: Modern, eye-friendly design
- **Chat Bubbles**: Distinct styling for user/AI messages
- **Typing Indicator**: Visual feedback during AI processing
- **Auto-Scroll**: Automatic scrolling to latest messages

### Sidebar Components

1. **Backend Selector**: Radio buttons to switch between Flask/FastAPI
2. **Preset Topics**: Quick access to 9 historical topics
3. **Social Links**: GitHub and LinkedIn connections
4. **Mode Indicator**: Shows current backend status

## 🔍 Technical Deep Dive

### PDF Processing (FastAPI)

The FastAPI backend uses **Docling** for advanced PDF processing:

1. **Document Conversion**: Extracts text, tables, and images
2. **OCR Support**: Uses Tesseract for scanned documents
3. **Caching**: Saves extraction results to avoid re-processing
4. **Hybrid Chunking**: Intelligent document segmentation

```python
# Pipeline configuration
pipeline_options = PdfPipelineOptions()
pipeline_options.do_ocr = True
pipeline_options.ocr_options = TesseractCliOcrOptions()
```

### Vector Search

Both backends use **Chroma** for semantic search:

1. **Embedding Creation**: Convert text to vectors
2. **Similarity Search**: Find relevant document chunks (k=5)
3. **Context Assembly**: Combine chunks for LLM input
4. **Metadata Filtering**: Clean complex metadata for storage

### Memory Management (FastAPI)

The Chain Memory backend maintains conversation history:

```python
sessions: Dict[str, ConversationalRetrievalChain] = {}

# Each session_id gets its own memory
memory = ConversationBufferMemory(
    memory_key="chat_history",
    return_messages=True
)
```

## 🐛 Troubleshooting

### Common Issues

#### Flask Backend Won't Start

```bash
# Error: "Ollama models not found"
# Solution: Pull required models
ollama pull nomic-embed-text
ollama pull phi3

# Error: "Chroma database not found"
# Solution: Ensure PDF is processed first
python create_database.py
```

#### FastAPI Backend Won't Start

```bash
# Error: "GOOGLE_API_KEY not found"
# Solution: Create .env file with your API key
echo "GOOGLE_API_KEY=your_key_here" > .env

# Error: "Tesseract not found"
# Solution: Update path in fastapi_backend.py (line 72)
ocr_options.tesseract_cmd = r"YOUR_PATH_HERE"
```

#### Frontend Connection Issues

```bash
# Error: "Failed to connect to backend"
# Solution: Ensure backend is running on correct port

# For Flask:
curl http://localhost:5000/query -X POST -H "Content-Type: application/json" -d '{"query_text":"test"}'

# For FastAPI:
curl http://localhost:8000/chat -X POST -H "Content-Type: application/json" -d '{"query_text":"test","session_id":"test"}'
```

#### CORS Errors

Both backends have CORS enabled. If you still see errors:

- Check that `allow_origins=["*"]` is set
- Ensure frontend is on `http://localhost:5173`
- Clear browser cache

## 🔐 Security Notes

⚠️ **Important**: This is a development setup. For production:

1. **API Keys**: Use environment variables, never commit to version control
2. **CORS**: Restrict `allow_origins` to specific domains
3. **Input Validation**: Add rate limiting and input sanitization
4. **Authentication**: Implement user authentication for session management
5. **HTTPS**: Use SSL/TLS for all communications

## 📊 Performance Considerations

### Flask Backend (Manual RAG)

- **Pros**: Fast, lightweight, no external API calls
- **Cons**: No conversation context, requires Ollama locally
- **Best For**: Quick lookups, independent questions

### FastAPI Backend (Chain Memory)

- **Pros**: Conversational context, sophisticated prompts, cloud-based
- **Cons**: API costs, slight latency, requires internet
- **Best For**: Deep discussions, follow-up questions

## 🛠️ Development

### Adding New Features

**To add a new backend**:

1. Create endpoint following existing patterns
2. Add backend type to `BackendType` union in `App.tsx`
3. Update sidebar radio buttons
4. Add URL mapping in `handleSubmit` function

**To customize prompts**:

- Flask: Modify `PROMPT_TEMPLATE` in `flask_backend.py`
- FastAPI: Edit `prompt_template` in `get_conversation_chain()`

**To change models**:

- Flask: Update `CHAT_MODEL` and `EMBEDDING_MODEL`
- FastAPI: Update `LLM_MODEL` and `EMBEDDING_MODEL`

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📧 Contact

- LinkedIn: www.linkedin.com/in/johnson-the-data-guy

## 🙏 Acknowledgments

- **Docling**: For advanced PDF processing
- **LangChain**: For RAG orchestration
- **Ollama**: For local LLM inference
- **Google Gemini**: For cloud-based AI
- **Chroma**: For vector storage
- **Lucide React**: For beautiful icons

---

Built with ❤️ for history enthusiasts and AI developers
