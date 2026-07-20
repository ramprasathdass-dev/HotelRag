# Interview Guide

## Architecture Questions

- Why separate the router, RAG layer, tool layer, and database layer?
- How would you evolve this into a multi-tenant system?

## RAG Questions

- What is the purpose of chunking?
- How does retrieval differ from generation?

## Security Questions

- Why mask PII before passing text to the model?
- How do guardrails reduce prompt injection risk?

## Tool Calling Questions

- Why should reservations be handled by tools instead of free-form text generation?
- How would you add authentication and authorization later?
