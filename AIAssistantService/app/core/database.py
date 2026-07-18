from typing import AsyncGenerator
from sqlalchemy import MetaData
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from app.core.config import settings

# Create async database engine
engine = create_async_engine(
    settings.get_async_db_url(),
    echo=False,
    future=True,
    pool_pre_ping=True
)

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Declarative base class for models
metadata = MetaData(schema="ai_assistant")
Base = declarative_base(metadata=metadata)

# Dependency to get async DB session
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

# Auto-create all tables
async def init_db() -> None:
    # We must import all models here so that they are registered in Base.metadata
    from app.models.user import User
    from app.models.project import Project
    from app.models.project_member import ProjectMember
    from app.models.chat import AIChatSession, AIChatMessage
    import sqlalchemy as sa
    
    async with engine.begin() as conn:
        await conn.execute(sa.text("CREATE SCHEMA IF NOT EXISTS ai_assistant;"))
        await conn.run_sync(Base.metadata.create_all)
        await conn.execute(sa.text("ALTER TABLE ai_assistant.ai_chat_messages ADD COLUMN IF NOT EXISTS thought_signature VARCHAR;"))
