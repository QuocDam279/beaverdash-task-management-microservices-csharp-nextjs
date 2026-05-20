"""
SQLAlchemy models cho bảng ai_chat_sessions và ai_chat_messages.

ai_chat_sessions: phiên chat AI trong ngữ cảnh một dự án.
ai_chat_messages: từng tin nhắn trong phiên chat (user, assistant, system, tool).
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB

from app.core.database import Base


class AiChatSession(Base):
    """Model phiên chat AI – liên kết với user và project."""

    __tablename__ = "ai_chat_sessions"

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
    title = Column(String, nullable=True)
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
        return f"<AiChatSession id={self.id} title={self.title}>"


class AiChatMessage(Base):
    """Model tin nhắn chat AI – thuộc một phiên chat."""

    __tablename__ = "ai_chat_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(
        UUID(as_uuid=True),
        ForeignKey("ai_chat_sessions.id", ondelete="CASCADE"),
        nullable=False,
    )
    role = Column(String, nullable=False)  # 'user', 'assistant', 'system', 'tool'
    content = Column(Text, nullable=True)
    used_documents = Column(JSONB, nullable=True)
    tool_calls = Column(JSONB, nullable=True)
    tool_results = Column(JSONB, nullable=True)
    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    def __repr__(self) -> str:
        return f"<AiChatMessage id={self.id} role={self.role}>"
