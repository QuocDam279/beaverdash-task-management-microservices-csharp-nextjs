"""
Pydantic v2 schemas cho RabbitMQ event payloads.

Các schema này được dùng để parse dữ liệu từ events
đồng bộ từ PM Service qua RabbitMQ.
"""

from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class ProjectSyncPayload(BaseModel):
    """Payload đồng bộ thông tin dự án từ PM Service."""

    id: UUID
    name: str
    description: Optional[str] = None
    status: Optional[str] = None


class ProjectMembersSyncPayload(BaseModel):
    """Payload đồng bộ danh sách thành viên dự án."""

    member_user_ids: list[UUID]


class UserEventPayload(BaseModel):
    """Payload sự kiện người dùng từ PM Service."""

    id: UUID
    email: str
    display_name: str
    avatar: Optional[str] = None
