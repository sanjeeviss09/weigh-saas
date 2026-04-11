import pdfplumber
import pytesseract
from pdf2image import convert_from_path

def process_pdf(file_path: str) -> str:
    """
    Extract text using pdfplumber; fallback to OCR if no text.
    """
    extracted_text = ""
    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    extracted_text += text + "\n"
    except Exception as e:
        print(f"pdfplumber exception on {file_path}: {e}")

    # Fallback to OCR
    if not extracted_text.strip():
        print("No text found natively. Attempting OCR...")
        try:
            images = convert_from_path(file_path)
            for img in images:
                extracted_text += pytesseract.image_to_string(img) + "\n"
        except Exception as e:
            print(f"OCR Exception on {file_path}: {e}")

    return extracted_text.strip()
