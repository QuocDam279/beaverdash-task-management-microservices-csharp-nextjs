"""
Pydantic v2 schemas cho Chat API.

Định nghĩa các schema request/response cho phiên chat AI
và tin nhắn chat.
"""

from datetime import datetime
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class ChatSessionCreate(BaseModel):
    """Request tạo phiên chat mới."""

    project_id: UUID
    title: Optional[str] = None


class ChatSessionUpdate(BaseModel):
    """Request cập nhật phiên chat."""

    title: str


class ChatSessionResponse(BaseModel):
    """Response thông tin phiên chat."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    project_id: UUID
    title: str | None = None
    created_at: datetime
    updated_at: datetime


class ChatMessageRequest(BaseModel):
    """Request gửi tin nhắn chat."""

    content: str


class ChatMessageResponse(BaseModel):
    """Response thông tin tin nhắn chat."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    role: str
    content: str | None = None
    used_documents: Any | None = None
    tool_calls: Any | None = None
    tool_results: Any | None = None
    created_at: datetime
