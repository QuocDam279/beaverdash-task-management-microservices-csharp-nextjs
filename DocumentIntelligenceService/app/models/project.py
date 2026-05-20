"""
SQLAlchemy models cho bảng projects và project_members.

Các bảng này được đồng bộ từ PM Service thông qua RabbitMQ events,
cho phép DocumentIntelligence Service biết cấu trúc dự án và thành viên.
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class Project(Base):
    """Model dự án – đồng bộ từ PM Service."""

    __tablename__ = "projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String, nullable=True)

    def __repr__(self) -> str:
        return f"<Project id={self.id} name={self.name}>"


class ProjectMember(Base):
    """Model thành viên dự án – composite primary key (project_id, user_id)."""

    __tablename__ = "project_members"

    project_id = Column(
        UUID(as_uuid=True),
        ForeignKey("projects.id", ondelete="CASCADE"),
        primary_key=True,
    )
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    )
    status = Column(String, nullable=True)
    joined_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    def __repr__(self) -> str:
        return f"<ProjectMember project={self.project_id} user={self.user_id}>"
