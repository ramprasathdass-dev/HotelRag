from typing import List

import numpy as np

from app.rag.embedder import Embedder
from app.rag.vector_store import FAISSVectorStore


class Retriever:
    def __init__(self, vector_store: FAISSVectorStore, embedder: Embedder):
        self.vector_store = vector_store
        self.embedder = embedder

    def retrieve(self, query: str, top_k: int = 3) -> List[str]:
        if not self.vector_store.index:
            return []
        embedding = self.embedder.embed([query])[0]
        results = self.vector_store.search(embedding.reshape(1, -1), top_k=top_k)
        return [text for text, _ in results]
