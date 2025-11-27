from langchain_community.document_loaders import DirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import OllamaEmbeddings
from tqdm import tqdm
import os
import shutil

# --- SETTINGS ---
DATA_PATH = "main_data/"
CHROMA_PATH = "chroma"
EMBEDDING_MODEL = "nomic-embed-text"


def load_split_document():
    """This function loads documents and splits them into chunks."""
    loader = DirectoryLoader(DATA_PATH)
    documents = loader.load()

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=3500, chunk_overlap=300, length_function=len, add_start_index=True
    )
    chunks = text_splitter.split_documents(documents=documents)
    return chunks


# --- SCRIPT LOGIC ---

# 1. Load and split the documents
chunks = load_split_document()
print(f"Split documents into {len(chunks)} chunks.")

# 2. Clear out any old database
if os.path.exists(CHROMA_PATH):
    shutil.rmtree(CHROMA_PATH)

# 3. Initialize the embedding function
embeddings = OllamaEmbeddings(model=EMBEDDING_MODEL)

# 4. Create an EMPTY Chroma vector store
db = Chroma(persist_directory=CHROMA_PATH, embedding_function=embeddings)

# 5. Add documents in batches with a progress bar
batch_size = 50  # Process 50 chunks at a time
for i in tqdm(range(0, len(chunks), batch_size), desc="Adding chunks to Chroma"):
    batch = chunks[i : i + batch_size]
    db.add_documents(batch)

print(f"Successfully saved {len(chunks)} chunks to {CHROMA_PATH}")

""" 
<-----------------------------Object Oriented programming style------------------------->
import os
import shutil
from langchain_community.document_loaders import DirectoryLoader
from langchain_text_splitters import RecursiveTextSplitter
from langchain_community.embeddings import OllamaEmbeddings
from langchain_vectorstores import Chroma
from tqsm import tqsm

class VectorDBProcessor:
     def __init__(self, data_path, chunk_size = 1000, chunk_overlap = 100, embedding_model, chroma_path):
        Initializes the processor with all necessary configurations

          self.data_path = data_path,
          self.embedding_model = embedding_model
          self.chroma_path = chroma_path
          self.chunk_size = chunk_size
          self.chunk_overlap = chunk_overlap
          self.chunks = [] # Will hold the split documents
    
    def _load_split_documents(self):
          loader = DirectoryLoader(self.data_path)
          document = loader.load()

          text_splitter = RecursiveTextSplitter(self.chunk_size, self.chunk_overlap, length_function = len,
          add_start_index = True)

          self.chunks = text_splitter.split_documents(documents = documents)
          return self.chunks

    def _create_database(self):
          if os.path.exists(self.chroma_path):
              shutil.rmtree(self.chroma_path)
            # If there was an exisiting chroma db, this deletes it to save the new vectors

          embeddings = OllamaEmbeddings(model = self.embedding_model)
          # Creating the vector db
          db = Chroma(persist_directory = self.chroma_path, embedding_function = embeddings)

          # saving vector batch-by-batch
          batch_size = 50
          for i in tqsm(range(0, len(self.chunks)), batch_size, desc = 'Adding chunks to chroma'):
               batch = [i : i + batch_size]
               db.add_documents(batch)
        print(f"Successfully saved {len(chunks)} chunks to {CHROMA_PATH}")

    def run(self):
           # The main public method to execute the entire process
           self._load_and_split_documents()
           self._create_database()
           print(f"\nSuccessfully saved {len(self.chunks)} chunks to {self.chroma_path} ✨")


# --- How to use the class ---
if __name__ == "__main__":
    # 1. Configure the settings

    DATA_PATH = "main_data/"
    CHROMA_PATH = "chroma"
    EMBEDDING_MODEL = "nomic-embed-text"

    # 2. Create an instance of the processor

    db_processor = VectorDBProcessor(
        data_path=DATA_PATH,
        chroma_path=CHROMA_PATH,
        embedding_model=EMBEDDING_MODEL
    )

    # 3. Run the process
    db_processor.run()
"""

''' 
<----------------------------Functional Programming Style--------------------------->
import os
import shutil
from langchain_community.document_loaders import DirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import OllamaEmbeddings
from tqdm import tqdm
from typing import List, Dict, Any

# Define type hints for clarity
Document = Dict[str, Any]

# --- Pure(ish) Functions for Data Transformation ---

def load_documents(path: str) -> List[Document]:
    """Loads all documents from a given directory."""
    print(f"Loading documents from '{path}'...")
    loader = DirectoryLoader(path)
    return loader.load()

def split_documents(documents: List[Document], chunk_size: int, chunk_overlap: int) -> List[Document]:
    """Splits a list of documents into smaller chunks."""
    print("Splitting documents...")
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
        add_start_index=True
    )
    chunks = text_splitter.split_documents(documents=documents)
    print(f"Split into {len(chunks)} chunks.")
    return chunks

def initialize_embeddings(model_name: str):
    """Initializes the embedding model."""
    print(f"Initializing embedding model: {model_name}")
    return OllamaEmbeddings(model=model_name)

# --- Functions with Side Effects (Isolated at the "edges") ---

def prepare_database_directory(path: str) -> None:
    """Clears out an existing database directory."""
    if os.path.exists(path):
        shutil.rmtree(path)
        print(f"Cleared old database at '{path}'.")

def create_and_persist_db(chunks: List[Document], db_path: str, embeddings) -> None:
    """Creates the Chroma DB and adds chunks to it in batches."""
    # Create an empty DB first
    db = Chroma(persist_directory=db_path, embedding_function=embeddings)
    
    # Add documents in batches with a progress bar
    batch_size = 50
    print("Adding chunks to Chroma database...")
    for i in tqdm(range(0, len(chunks), batch_size), desc="Embedding Chunks"):
        batch = chunks[i:i + batch_size]
        db.add_documents(batch)
    print(f"\nSuccessfully saved {len(chunks)} chunks to {db_path} ✨")


# --- Main execution pipeline ---
def main():
    """Orchestrates the data pipeline by composing the functions."""
    # 1. Configuration
    DATA_PATH = "main_data/"
    CHROMA_PATH = "chroma"
    EMBEDDING_MODEL = "nomic-embed-text"
    CHUNK_SIZE = 1000
    CHUNK_OVERLAP = 100

    # 2. Execute the pipeline
    prepare_database_directory(CHROMA_PATH)
    loaded_docs = load_documents(DATA_PATH)
    chunks = split_documents(loaded_docs, CHUNK_SIZE, CHUNK_OVERLAP)
    embeddings = initialize_embeddings(EMBEDDING_MODEL)
    create_and_persist_db(chunks, CHROMA_PATH, embeddings)

if __name__ == "__main__":
    main()







'''
