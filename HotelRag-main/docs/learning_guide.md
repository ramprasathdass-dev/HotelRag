# Learning Guide

## Mental model

1. The API receives a message.
2. A guardrail layer inspects the input.
3. An intent router decides whether to use RAG or reservation tools.
4. The service calls the appropriate engine.
5. The response is masked and returned to the user.

## How to extend the project

- Add authentication and role-based access control.
- Replace SQLite with PostgreSQL.
- Swap the local embedding model for a hosted service.
- Add room inventory management and payment flows.
