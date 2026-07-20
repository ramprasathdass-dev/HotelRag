import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings:
    project_name: str = "hotel-rag-assistant"
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./hotel_assistant.db")
    embedding_model: str = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
    pdf_path: str = os.getenv("PDF_PATH", str(BASE_DIR / "data" / "hotel_policy.pdf"))

settings = Settings()
