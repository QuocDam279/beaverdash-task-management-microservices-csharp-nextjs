"""
Embedding Service - Kết nối Ollama local để sinh vector embedding BGE-M3.
Ollama chạy trực tiếp trên máy host (KHÔNG Docker).
"""
import logging
import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)

OLLAMA_EMBED_URL = f"{settings.OLLAMA_BASE_URL}/api/embeddings"


async def get_embedding(text: str) -> list[float]:
    """Sinh vector embedding 1024 chiều từ Ollama BGE-M3 local."""
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            OLLAMA_EMBED_URL,
            json={"model": "bge-m3", "prompt": text}
        )
        response.raise_for_status()
        data = response.json()
        return data["embedding"]


async def get_embeddings_batch(texts: list[str]) -> list[list[float]]:
    """Sinh batch embeddings cho nhiều chunks cùng lúc."""
    results = []
    async with httpx.AsyncClient(timeout=120.0) as client:
        for i, text in enumerate(texts):
            try:
                response = await client.post(
                    OLLAMA_EMBED_URL,
                    json={"model": "bge-m3", "prompt": text}
                )
                response.raise_for_status()
                data = response.json()
                results.append(data["embedding"])
            except Exception as e:
                logger.error(f"Lỗi embedding chunk {i}: {e}")
                raise
    return results
