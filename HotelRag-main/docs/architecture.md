# Architecture Notes

## Functional Requirements

- PDF ingestion and parsing
- Text chunking and embedding generation
- Vector search over hotel policies
- Reservation creation, viewing, and cancellation
- Intent routing between RAG and tool workflows
- PII masking and guardrails
- FastAPI endpoints and SQLite persistence

## Non-Functional Requirements

- Performance: low latency for local queries
- Reliability: graceful handling of missing documents and missing reservations
- Security: input validation, prompt injection blocking, PII masking
- Maintainability: clear separation of layers
- Scalability: modular design supports PostgreSQL and hosted vector stores later

## Assumptions

- The project is run locally and does not require external LLM APIs
- The PDF is small and can be indexed from disk
- SQLite is sufficient for a demo and interview-ready prototype
