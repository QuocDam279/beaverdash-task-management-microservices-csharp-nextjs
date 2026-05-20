"""
Cấu hình ứng dụng DocumentIntelligence Service.

Sử dụng pydantic-settings để đọc biến môi trường từ file .env
tại thư mục gốc monorepo (../../.env so với thư mục service).
"""

from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


# Đường dẫn tới file .env ở thư mục gốc monorepo
# DocumentIntelligenceService/ -> Beaverdash/ -> .env
_ENV_FILE_PATH = Path(__file__).resolve().parent.parent.parent.parent / ".env"


class Settings(BaseSettings):
    """Cấu hình chung cho DocumentIntelligence Service."""

    model_config = SettingsConfigDict(
        env_file=str(_ENV_FILE_PATH),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # ── Database ──────────────────────────────────────────────────────────
    DOCINTEL_DB_CONNECTION: str = (
        "postgresql://postgres:password@localhost:5432/beaverdash_docintel_db"
    )

    # ── Ollama (embedding) ────────────────────────────────────────────────
    OLLAMA_BASE_URL: str = "http://localhost:11434"

    # ── LLM API Keys ─────────────────────────────────────────────────────
    GEMINI_API_KEY: str = ""
    GROQ_API_KEY: str = ""
    GITHUB_MODEL_TOKEN: str = ""

    # ── PM Service ────────────────────────────────────────────────────────
    PM_SERVICE_BASE_URL: str = "http://localhost:5002"

    # ── RabbitMQ ──────────────────────────────────────────────────────────
    RABBITMQ_USER: str = "guest"
    RABBITMQ_PASS: str = "guest"
    RABBITMQ_HOST: str = "localhost"


# Singleton – import trực tiếp từ module này
settings = Settings()
