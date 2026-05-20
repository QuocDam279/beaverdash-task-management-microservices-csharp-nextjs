"""
SQLAlchemy models cho bảng documents và document_chunks.

documents: lưu trữ metadata của tài liệu đã upload.
document_chunks: lưu trữ các đoạn văn bản đã được chia nhỏ và embedding.
"""

import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    String,
    Text,
    Integer,
    BigInteger,
    DateTime,
    Enum,
    ForeignKey,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from pgvector.sqlalchemy import Vector

from app.core.database import Base


class DocumentStatus(str, enum.Enum):
    """Trạng thái xử lý tài liệu."""

    pending = "pending"
    processing = "processing"
    completed = "completed"
    failed = "failed"


class Document(Base):
    """Model tài liệu – metadata của file đã upload."""

    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False,
    )
    project_id = Column(
        UUID(as_uuid=True),
        ForeignKey("projects.id"),
        nullable=False,
    )
    source_type = Column(String, nullable=True)
    file_name = Column(String, nullable=False)
    mime_type = Column(String, nullable=True)
    storage_uri = Column(String, nullable=False)
    file_size = Column(BigInteger, nullable=True)
    page_count = Column(Integer, nullable=True)
    checksum = Column(String, nullable=True)
    status = Column(
        Enum(DocumentStatus, name="document_status"),
        default=DocumentStatus.pending,
        nullable=False,
    )
    error_message = Column(Text, nullable=True)
    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    def __repr__(self) -> str:
        return f"<Document id={self.id} file_name={self.file_name} status={self.status}>"


class DocumentChunk(Base):
    """Model đoạn văn bản – chunk của tài liệu đã được embedding."""

    __tablename__ = "document_chunks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(
        UUID(as_uuid=True),
        ForeignKey("projects.id"),
        nullable=False,
    )
    document_id = Column(
        UUID(as_uuid=True),
        ForeignKey("documents.id", ondelete="CASCADE"),
        nullable=False,
    )
    chunk_index = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    token_count = Column(Integer, nullable=False)
    embedding = Column(Vector(1024))
    sparse_embedding = Column(JSONB, nullable=True)
    metadata_ = Column("metadata", JSONB, nullable=True)
    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    def __repr__(self) -> str:
        return (
            f"<DocumentChunk id={self.id} doc={self.document_id} "
            f"index={self.chunk_index}>"
        )
