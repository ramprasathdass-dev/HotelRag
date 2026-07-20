from typing import List


class RecursiveChunker:
    def __init__(self, chunk_size: int = 250, overlap: int = 40):
        self.chunk_size = chunk_size
        self.overlap = overlap

    def chunk(self, text: str) -> List[str]:
        cleaned = " ".join(text.split())
        if not cleaned:
            return []
        words = cleaned.split()
        chunks: List[str] = []
        start = 0
        while start < len(words):
            end = min(len(words), start + self.chunk_size)
            chunk = " ".join(words[start:end])
            if chunk:
                chunks.append(chunk)
            if end == len(words):
                break
            start = max(0, end - self.overlap)
        return chunks
