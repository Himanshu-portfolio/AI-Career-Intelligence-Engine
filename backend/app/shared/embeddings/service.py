import numpy as np
import faiss
from sentence_transformers import SentenceTransformer
from app.core.config import get_settings

_model = None


def _get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        _model = SentenceTransformer(get_settings().embedding_model)
    return _model


def embed_texts(texts: list[str]) -> np.ndarray:
    return _get_model().encode(texts, normalize_embeddings=True).astype("float32")


def embed_single(text: str) -> np.ndarray:
    return embed_texts([text])[0]


def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    return float(np.dot(a, b))


class FAISSIndex:
    """Simple FAISS wrapper for similarity search."""

    def __init__(self, dimension: int = 384):
        self.index = faiss.IndexFlatIP(dimension)  # Inner product = cosine on normalized vectors
        self.metadata: list[dict] = []

    def add(self, texts: list[str], metadata: list[dict]):
        vectors = embed_texts(texts)
        self.index.add(vectors)
        self.metadata.extend(metadata)

    def search(self, query: str, top_k: int = 10) -> list[dict]:
        vec = embed_single(query).reshape(1, -1)
        scores, indices = self.index.search(vec, min(top_k, self.index.ntotal))
        return [
            {**self.metadata[i], "score": float(scores[0][rank])}
            for rank, i in enumerate(indices[0]) if i != -1
        ]

    def save(self, path: str):
        faiss.write_index(self.index, path)

    def load(self, path: str):
        self.index = faiss.read_index(path)
