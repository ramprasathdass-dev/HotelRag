# Hotel RAG + Reservation Assistant

This project is a production-inspired assistant that combines:

- RAG-based question answering over a hotel policy PDF
- Reservation management tools
- PII protection and security guardrails
- FastAPI-based backend and SQLite persistence

## Architecture

```text
User
  -> FastAPI API Layer
  -> Guardrails / PII checks
  -> Intent Router
  -> RAG Engine or Reservation Tools
  -> SQLite Database
  -> Response Layer
```

## Features

- PDF ingestion and chunking
- Embedding-based retrieval using sentence-transformers + FAISS
- Reservation create/view/cancel operations
- Downloadable booking receipt from the frontend experience
- PII masking and prompt injection guardrails
- API endpoints for chat and reservation workflows
- Interactive hotel landing page with assistant, booking, and secure reservation management

## Setup

```bash
python -m pip install -r requirements.txt
```

## Run locally

```bash
python -m uvicorn app.main:app --reload
```

Then open `http://127.0.0.1:8000` for the interactive frontend.

## Testing

```bash
python -m pytest -q
```

## API examples

### Chat

```bash
curl -X POST http://127.0.0.1:8000/chat -H "Content-Type: application/json" -d '{"message":"What is the cancellation policy?"}'
```

### Create reservation

```bash
curl -X POST http://127.0.0.1:8000/reservation/create -H "Content-Type: application/json" -d '{"guest_name":"Ada Lovelace","email":"ada@example.com","room_type":"deluxe","check_in":"2026-08-01","check_out":"2026-08-03"}'
```
