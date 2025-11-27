import re

INPUT_FILE = "data/extract_text"
OUTPUT_FILE = "main_data/cleaned_text.txt"


def clean_ocr_text(text: str) -> str:
    """A comprehensive cleaning pipeline for OCR'd text to make it RAG-ready."""
    print("Starting the cleaning pipeline...")

    try:
        _, text = re.split(r"Welcome to Modern World History!", text, 1)
        # Add the header back in for context
        text = "Introduction\n\nWelcome to Modern World History!" + text
        print("  - Stage 0: Removed front matter (title, contents, etc.).")
    except ValueError:
        print(
            "  - Stage 0: Start of main content not found. Skipping front matter removal."
        )
    # ------------------------------------

    # 1. Pre-Cleaning: Remove large, irrelevant sections
    text = re.split(r"Appendix A:", text, 1)[0]
    text = re.sub(r"Primary Source Supplement.*?(?=\n\n|\Z)", "", text, flags=re.DOTALL)
    text = re.sub(r"Media Attributions.*?(?=\n\n|\Z)", "", text, flags=re.DOTALL)
    text = re.sub(
        r"Questions for Discussion\n.*?(?=\n\n|\Z)", "", text, flags=re.DOTALL
    )
    print("  - Stage 1: Removed appendices and other non-content sections.")

    # 2. Structural Repair: Fix hyphenation and paragraphs
    text = re.sub(r"-\n", "", text)
    text = re.sub(r"(?<!\n)\n(?!\n)", " ", text)
    print("  - Stage 2: Repaired hyphenation and paragraphs.")

    # 3. Artifact Removal: Headers, footers, and other noise
    text = re.sub(
        r"^(Modern World History\s+\d+|\d+\s+Dan Allosso and Tom Williford)\s*$",
        "",
        text,
        flags=re.MULTILINE,
    )
    text = re.sub(r"^\s*\d+\s*$", "", text, flags=re.MULTILINE)
    text = re.sub(r"\[\s*(source:)?\s*\d+\s*\]", "", text)
    print("  - Stage 3: Removed page artifacts and OCR noise.")

    # 4. Character and Whitespace Normalization
    replacements = {
        "’": "'",
        "‘": "'",
        "“": '"',
        "”": '"',
        "—": "-",
        "–": "-",
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    text = re.sub(r" {2,}", " ", text)
    text = re.sub(r"\s+([,.!?;:])", r"\1", text)
    print("  - Stage 4: Normalized characters and whitespace.")

    # 5. Final Polish
    text = re.sub(r"\n{3,}", "\n\n", text)
    print("  - Stage 5: Final polishing complete.")

    return text.strip()


# --- Main script logic ---
try:
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        raw_text = f.read()

    cleaned_text = clean_ocr_text(raw_text)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write(cleaned_text)

    print(f"\nSuccessfully cleaned the text and saved it to '{OUTPUT_FILE}' 🧹")

except FileNotFoundError:
    print(
        f"Error: The input file '{INPUT_FILE}' was not found. Please make sure it's in the same folder."
    )
