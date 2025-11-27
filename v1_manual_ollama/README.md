# Chat with PDF — Local RAG using Ollama

A small local Retrieval-Augmented Generation (RAG) demo that lets you chat with a PDF document. This repository provides tools to extract and clean text, build embeddings, persist a Chroma vector database, and query it via a backend or a small React frontend.

IMPORTANT: Ollama must be installed and running on the machine you use to run this project. Ollama runs local models (for example `nomic-embed-text` for embeddings). See https://ollama.com for install instructions and downloads.

## Project overview

- OCR & text extraction: `Backend/text_process.py` (uses Tesseract via `pytesseract`).
- Text cleaning: `Backend/text_process.py` outputs cleaned text in `Backend/main_data/cleaned_text.txt`.
- Build vector DB: `Backend/create_db.py` — creates embeddings and a Chroma DB in `Backend/chroma/`.
- Querying: `Backend/query.py` provides a small script to query the DB. The front-end in `Frontend/` talks to the backend during development.

## Quick setup (Windows PowerShell)

These steps assume Windows PowerShell; adapt the commands for macOS / Linux as needed.

1. Clone the repository and open the project folder

```powershell
git clone <your-repo-url>
cd <repo-folder>
```

2. Create and activate a Python virtual environment

```powershell
py -3.11 -m venv venv
.\venv\Scripts\activate
```

3. Install Python dependencies

```powershell
cd Backend
pip install -r requirements.txt
```

If you plan to run the React frontend locally, open a separate terminal and:

```powershell
cd Frontend
npm install
```

4. Install required system tools

- Tesseract OCR (Windows): install and add to PATH — e.g. https://github.com/UB-Mannheim/tesseract/wiki
- Ollama: install and run the Ollama daemon locally. Confirm with `ollama ls` and `ollama pull`.

5. Pull the Ollama models used by this project

```powershell
# Example models (adjust as needed):
ollama pull nomic-embed-text
ollama pull phi3
```

> Note: `create_db.py` expects Ollama to be running and models available when using the local embedding path.

## Usage — end-to-end

1. Extract and clean text from your PDFs

```powershell
# Place PDFs under Backend/data
cd Backend
py text_process.py
```

2. Build embeddings and create the Chroma DB

```powershell
# Ensure Ollama is running and models are pulled
py create_db.py
```

3. Run the backend and query

```powershell
# Start the backend server (if applicable)
py app.py

# In another terminal, query the server or use the frontend
py query.py "What are the main themes in chapter 3?"
```

## Frontend (optional)

The repository includes a React + Vite frontend in `Frontend/`.

```powershell
cd Frontend
npm run dev
# Open the URL printed by Vite (usually http://localhost:5173)
```

## Troubleshooting

- If you see errors about missing models or model availability, confirm Ollama is running and the model was pulled:

```powershell
ollama ls
ollama pull nomic-embed-text
```

- If you prefer OpenAI (cloud) instead of Ollama/local models, set `OPENAI_API_KEY` in a `.env` file and use the OpenAI path in `create_db.py` — be mindful of billing and quota.
- Keep `.env` out of source control. `.gitignore` excludes `.env` and the `chroma/` DB folder.

## Advanced

- To reduce embedding costs/time for development set the `MAX_CHUNKS` environment variable before running `create_db.py` to limit how many chunks are embedded during a test run.

```powershell
$env:MAX_CHUNKS="200"
py create_db.py
```

## Contributing

If you'd like improvements (screenshots, Dockerfile, GitHub Actions CI) or help adapting the project to different models, open an issue or a PR.

---

Maintainer
