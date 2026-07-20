from pathlib import Path
from typing import List, Tuple

import faiss
import numpy as np


class FAISSVectorStore:
    def __init__(self, index_path: str = "vector_store/hotel.index"):
        self.index_path = Path(index_path)
        self.index_path.parent.mkdir(parents=True, exist_ok=True)
        self.index = None
        self.texts: List[str] = []

    def build(self, embeddings: np.ndarray, texts: List[str]) -> None:
        self.index = faiss.IndexFlatL2(embeddings.shape[1])
        self.index.add(embeddings)
        self.texts = texts
        faiss.write_index(self.index, str(self.index_path))

    def load(self) -> None:
        if self.index_path.exists():
            self.index = faiss.read_index(str(self.index_path))
            self.texts = []

    def search(self, embedding: np.ndarray, top_k: int = 3) -> List[Tuple[str, float]]:
        if self.index is None:
            return []
        distances, indices = self.index.search(embedding.reshape(1, -1), top_k)
        results = []
        for idx, distance in zip(indices[0], distances[0]):
            if idx < 0:
                continue
            results.append((self.texts[int(idx)], float(distance)))
        return results
