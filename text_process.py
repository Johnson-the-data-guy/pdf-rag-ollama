import fitz  # from PyMuPDF
import pytesseract
from PIL import Image
import io

# --- VERY IMPORTANT TO ADD PYTESSERACT LOCATION IN PC---
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

PDF_PATH = "data/modern_history.pdf"

pdf_document = fitz.open(PDF_PATH)

print(f"The pdf has been opened with PyMuPDF-fitz and it has {len(pdf_document)} pages")

# Empty string where the loaded text from the pdf would be saved
full_text = ""

print(f"Looping through the pdf_document should start now!. This might take a while")
for page_num in range(len(pdf_document)):
    page = pdf_document.load_page(page_num)
    # ---First code converts each page loaded to an image then to bytes (second code)
    pix = page.get_pixmap(dpi=150)
    image_bytes = pix.tobytes("png")
    # ----converting bytes to pillow image object
    image = Image.open(io.BytesIO(image_bytes))

    text = pytesseract.image_to_string(image, lang="eng")
    # ----Updating the full_text variable to contain text from all the pages. Full_text would be accessible anywhere in the scope because it is declared first as a global variable
    full_text += text + "\n"

pdf_document.close()

with open("data/extract_text", "w", encoding="utf-8") as f:
    f.write(full_text)
print("Extracted data has been stored successfully")
