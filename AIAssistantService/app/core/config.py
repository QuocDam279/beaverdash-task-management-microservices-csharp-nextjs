import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # API Configurations
    PROJECT_NAME: str = "AIAssistantService"
    API_V1_STR: str = "/api/v1"

    # Database
    ASSISTANT_DB_CONNECTION: str = "postgresql+asyncpg://postgres:password@localhost:5432/beaverdash_ai_assistant_db"

    # LLM Settings
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL_PRIMARY: str = "gemini-3.1-flash-lite"
    GEMINI_MODEL_SECONDARY: str = "gemini-2.5-flash"

    # OpenAI-compatible LLM Settings
    GITHUB_MODEL_TOKEN: str = ""
    GPT_MODEL: str = "gpt-4o-mini"
    GROQ_API_KEY: str = ""
    LLAMA_MODEL: str = "llama-3.1-8b-instant"

    # Service-to-service
    PM_SERVICE_BASE_URL: str = "http://localhost:5002"

    # RabbitMQ
    RABBITMQ_USER: str = "guest"
    RABBITMQ_PASS: str = "guest"
    RABBITMQ_HOST: str = "localhost"
    RABBITMQ_PORT: int = 5672

    class Config:
        env_file = "../.env"
        env_file_encoding = "utf-8"
        extra = "ignore"

    def get_async_db_url(self) -> str:
        url = self.ASSISTANT_DB_CONNECTION
        # SQLAlchemy requires postgresql+asyncpg:// for async pg driver
        if url.startswith("postgresql://"):
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        elif url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+asyncpg://", 1)
            
        # asyncpg does not support sslmode parameter, replace with ssl=true
        if "sslmode=" in url:
            import re
            url = re.sub(r'sslmode=[^&]+', 'ssl=true', url)
        return url

settings = Settings()
