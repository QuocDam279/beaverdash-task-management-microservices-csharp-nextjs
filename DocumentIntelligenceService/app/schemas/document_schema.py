"""
Pydantic v2 schemas cho Document API.

Định nghĩa các schema request/response cho upload và list tài liệu.
"""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class DocumentUploadResponse(BaseModel):
    """Response sau khi upload tài liệu thành công."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    file_name: str
    status: str
    created_at: datetime


class DocumentListItem(BaseModel):
    """Thông tin tóm tắt của một tài liệu trong danh sách."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    file_name: str
    mime_type: str | None = None
    file_size: int | None = None
    status: str
    created_at: datetime


class DocumentListResponse(BaseModel):
    """Response chứa danh sách tài liệu."""

    documents: list[DocumentListItem]
