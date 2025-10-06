Chat with PDF - A Local RAG Pipeline with Ollama
This project provides a complete, local-first RAG (Retrieval-Augmented Generation) pipeline that allows you to chat with your PDF documents. It uses Tesseract for OCR, LangChain for orchestration, and Ollama to run open-source models for embeddings and chat, ensuring your data remains private and the process is entirely free.

Features
PDF to Text: Extracts text from PDF documents using OCR (pytesseract).

Text Cleaning: A robust script (text_process.py) cleans and prepares the extracted text for the RAG model.

Local & Free: Uses Ollama to run powerful open-source models like nomic-embed-text and phi3 on your own machine. No API keys or costs.

Vector Database: Stores document embeddings in a local Chroma vector database for fast retrieval.

Question & Answer: A command-line interface (query.py) lets you ask questions about the document's content.

Project Structure
RAG01/
│
├── 📄 .env # (Optional) For storing API keys if you switch models.
├── 📄 .gitignore # Specifies files for Git to ignore.
├── 📄 requirements.txt # Lists all the necessary Python packages.
├── 📁 data/ # Place your raw PDF documents here.
│ └── modern_history.pdf
├── 📁 main_data/ # Stores the cleaned text file.
│ └── cleaned_text.txt
├── 📁 chroma/ # The local Chroma vector database will be stored here.
├── 🐍 text_process.py # Script to perform OCR and clean the text from the PDF.
├── 🐍 create_db.py # Script to create the vector database from the cleaned text.
└── 🐍 query.py # Script to ask questions to your document.

Setup Instructions
Follow these steps to set up the project environment.

1. Install System Dependencies
   Python (Version 3.11 recommended): Make sure you have Python installed. You can download it from python.org.

Tesseract OCR Engine: This is required for extracting text from the PDF. Download and install it from the official Tesseract at UB Mannheim page.

Important: During installation, remember the path where it's installed (e.g., C:\Program Files\Tesseract-OCR).

Ollama: This application runs the local AI models. Download and install it from ollama.com.

2. Set Up the Python Environment
   Clone the Repository (or use your local folder).

Create and Activate a Virtual Environment: Open your terminal in the project folder and run:

# Create the environment

py -3.11 -m venv venv

# Activate the environment (on Windows)

.\venv\Scripts\activate

Install Python Packages: Install all the required libraries at once.

pip install -r requirements.txt

3. Download the AI Models
   After installing Ollama, you must download the models it will use. Make sure the Ollama application is running before you run these commands in your terminal.

# Download the embedding model

ollama pull nomic-embed-text

# Download the chat model

ollama pull phi3

Usage: A 3-Step Process
Run these scripts from your terminal in order. Make sure your virtual environment is activated.

Step 1: Process the PDF
This script reads the PDF from the data folder, extracts the text using OCR, cleans it, and saves the result in the main_data folder.

python text_process.py

Step 2: Create the Database
This script takes the cleaned text, creates vector embeddings for it using the local nomic-embed-text model, and saves them into the chroma database folder.

python create_db.py

Step 3: Ask a Question
Now you can chat with your document. Run this script with your question in quotes.

python query.py "Your question about the document goes here"

Example:

python query.py "Summarize the differences between Spanish and British colonization in the Americas."
