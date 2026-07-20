from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.api.routes import router as api_router
from app.db.database import init_db

app = FastAPI(title="Hotel RAG Assistant", version="1.0.0")
frontend_dir = Path(__file__).resolve().parent / "frontend"
assets_dir = frontend_dir / "assets"

if assets_dir.exists():
    app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")


@app.get("/")
def index():
    return FileResponse(frontend_dir / "index.html")


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "hotel-rag-assistant"}


app.include_router(api_router)

init_db()
