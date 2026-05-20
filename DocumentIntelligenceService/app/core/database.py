"""
Cấu hình kết nối cơ sở dữ liệu PostgreSQL với pgvector.

Tạo SQLAlchemy engine, session factory và Base declarative.
Tự động bật extension pgvector khi module được import.
"""

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from typing import Generator

from app.core.config import settings


# ── Engine & Session ──────────────────────────────────────────────────────
engine = create_engine(
    settings.DOCINTEL_DB_CONNECTION,
    pool_pre_ping=True,
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ── Declarative Base ──────────────────────────────────────────────────────
Base = declarative_base()

# ── Bật pgvector extension khi module được load ──────────────────────────
with engine.connect() as conn:
    conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
    conn.commit()


def get_db() -> Generator:
    """
    Dependency generator cho FastAPI.

    Tạo một database session cho mỗi request,
    tự động đóng khi request kết thúc.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
