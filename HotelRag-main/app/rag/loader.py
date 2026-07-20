from pathlib import Path
from typing import List

from pypdf import PdfReader


class PDFLoader:
    def __init__(self, file_path: str):
        self.file_path = file_path

    def load(self) -> str:
        if not Path(self.file_path).exists():
            return ""
        reader = PdfReader(self.file_path)
        pages = [page.extract_text() or "" for page in reader.pages]
        return "\n".join(pages)
