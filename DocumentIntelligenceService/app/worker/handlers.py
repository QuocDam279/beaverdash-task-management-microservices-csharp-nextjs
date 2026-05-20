"""
Worker Handlers - Xử lý các sự kiện từ RabbitMQ.
Đồng bộ bảng users trong DocumentIntelligence DB.
"""
import uuid
import logging
from datetime import datetime, timezone

from sqlalchemy.orm import Session
from app.models.user import User

logger = logging.getLogger(__name__)


def handle_user_created(payload: dict, db: Session):
    """
    Xử lý sự kiện UserCreated từ Identity Service.
    Insert user mới hoặc bỏ qua nếu đã tồn tại.

    Payload MassTransit format:
    {
        "Id": "uuid-string",
        "Email": "user@example.com",
        "DisplayName": "Tên hiển thị",
        "Avatar": "url hoặc null"
    }
    """
    user_id = uuid.UUID(payload["Id"])

    existing = db.query(User).filter(User.id == user_id).first()
    if existing:
        logger.info(f"User {user_id} đã tồn tại, bỏ qua.")
        return

    user = User(
        id=user_id,
        email=payload["Email"],
        display_name=payload["DisplayName"],
        avatar=payload.get("Avatar")
    )
    db.add(user)
    logger.info(f"Tạo mới user {user_id}: {payload['Email']}")


def handle_user_updated(payload: dict, db: Session):
    """
    Xử lý sự kiện UserUpdated từ Identity Service.
    Cập nhật thông tin user (display_name, avatar, email).

    Payload MassTransit format:
    {
        "Id": "uuid-string",
        "Email": "user@example.com",
        "DisplayName": "Tên mới",
        "Avatar": "url mới hoặc null"
    }
    """
    user_id = uuid.UUID(payload["Id"])

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        # User chưa tồn tại → tạo mới (upsert)
        user = User(
            id=user_id,
            email=payload["Email"],
            display_name=payload["DisplayName"],
            avatar=payload.get("Avatar")
        )
        db.add(user)
        logger.info(f"User {user_id} chưa tồn tại, tạo mới từ UpdateEvent.")
        return

    # Cập nhật thông tin
    user.email = payload["Email"]
    user.display_name = payload["DisplayName"]
    user.avatar = payload.get("Avatar")
    logger.info(f"Cập nhật user {user_id}: {payload['Email']}")
