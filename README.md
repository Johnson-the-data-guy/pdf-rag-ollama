PDF-RAG: A Local Question-Answering System
This project is a complete Retrieval-Augmented Generation (RAG) pipeline that allows you to ask questions about a PDF document using free, locally-run AI models. The system extracts text from a PDF, processes it, creates a searchable vector database, and then uses a local language model to answer questions based on the document's content.

Features
PDF Text Extraction: Uses Tesseract-OCR to accurately extract text from PDF files.

Text Cleaning: A dedicated Python script cleans and formats the raw OCR output using regular expressions to make it suitable for an AI model.

Local Vector Database: Uses Chroma DB to store and retrieve information locally, without needing a cloud service.

Free, Local AI Models: Powered by Ollama, this project uses open-source models for embeddings and chat, so there are no API costs.

Command-Line Interface: Ask questions and get answers directly from your terminal.

Project Structure
text_process.py: A script that handles the initial OCR extraction of raw text from a PDF.

clean_text.py: A script that takes the raw text and performs a comprehensive cleaning process.

create_db.py: A script that takes the cleaned text, splits it into chunks, and builds a Chroma vector database.

query.py: The main query engine. Run this script with a question to get an answer from your document.

requirements.txt: A list of all the necessary Python packages for the project.

.env: A file to store secret keys (though not required for the Ollama setup, it's included for good practice).

Prerequisites
Before you begin, you must have the following software installed on your system:

Python (Version 3.11 is recommended): Make sure it's added to your system's PATH.

Tesseract-OCR Engine: This is required for the text extraction script.

Download the installer from the Tesseract at UB Mannheim page.

During installation, take note of the installation path (e.g., C:\Program Files\Tesseract-OCR\tesseract.exe).

Ollama: This application runs the local AI models.

Download and install it from the Ollama official website.

Setup and Installation
Follow these steps to set up the project environment:

Clone the Repository (or download the files):

git clone [https://your-repo-url.com/](https://your-repo-url.com/)
cd RAG01

Create a Virtual Environment:
It's crucial to use a virtual environment to manage dependencies.

py -3.11 -m venv venv

Activate the Virtual Environment:
You must activate the environment every time you work on the project.

.\venv\Scripts\activate

Install Python Dependencies:
Install all the required Python packages from the requirements.txt file.

pip install -r requirements.txt

Download Ollama Models:
Important: You must have the Ollama application running for this step. Open your terminal and pull the necessary models.

# For creating embeddings

ollama pull nomic-embed-text

# For answering questions (choose one based on your computer's memory)

ollama pull tinyllama # Fastest, lowest quality, for low-memory systems
ollama pull phi3 # Good balance of speed and quality

Place Your PDF:
Put the PDF file you want to process (e.g., my_document.pdf) into the project's root directory.

Usage
Run the scripts in the following order:

1. Extract Text from PDF
   This script performs the initial OCR extraction.

Configure: Open text_process.py and ensure the paths are set correctly.

Run:

python text_process.py

Output: This will create a raw text file (e.g., extract_text.txt).

2. Clean the Extracted Text
   This script cleans the raw text file using regular expressions.

Configure: Open clean_text.py and ensure the input and output file paths are correct.

Run:

python clean_text.py

Output: This will create a cleaned text file (e.g., cleaned_text.txt) in the main_data folder.

3. Create the Vector Database
   This script creates the searchable Chroma database from the cleaned text.

Run:

python create_db.py

Output: This will create a chroma folder containing the vector database.

4. Ask a Question
   This is the final step. Run the query script from your terminal, followed by your question in quotes.

Important: Make sure the Ollama application is running in the background.

Run:

python query.py "Your question about the document goes here"

Example:

python query.py "What were the main causes of World War I?"

Troubleshooting
'ollama' is not recognized...: This means Ollama is not installed or your terminal needs to be restarted after installation.

model requires more system memory...: The model you've chosen is too large for your computer's available RAM. Try using a smaller model (like tinyllama) or closing other applications.

OllamaEndpointNotFoundError or status code 404: This means the Ollama application is not running on your computer. Make sure it's running in the background before you run the query script.
