"""
SQLAlchemy model cho bảng users.

Bảng này được đồng bộ từ PM Service thông qua RabbitMQ events,
lưu trữ thông tin cơ bản của người dùng trong DocumentIntelligence Service.
"""

import uuid

from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class User(Base):
    """Model người dùng – đồng bộ từ PM Service."""

    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False)
    display_name = Column(String, nullable=False)
    avatar = Column(String, nullable=True)

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email}>"
