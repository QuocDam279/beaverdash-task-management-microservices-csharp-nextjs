"""
Xác thực người dùng thông qua header từ API Gateway.

API Gateway đã xác thực JWT và truyền user ID qua header X-User-Id.
Service chỉ cần đọc header này, không cần validate JWT.
"""

import uuid

from fastapi import Request, HTTPException, status


def get_current_user_id(request: Request) -> uuid.UUID:
    """
    FastAPI dependency – lấy user ID từ header X-User-Id.

    API Gateway chịu trách nhiệm xác thực JWT và đặt header này.
    Nếu header không tồn tại hoặc không hợp lệ, trả về 401.

    Args:
        request: FastAPI Request object.

    Returns:
        uuid.UUID: ID của người dùng hiện tại.

    Raises:
        HTTPException: 401 nếu header thiếu hoặc không hợp lệ.
    """
    user_id_str = request.headers.get("X-User-Id")

    if not user_id_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing X-User-Id header. Request must come through API Gateway.",
        )

    try:
        return uuid.UUID(user_id_str)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid X-User-Id header. Must be a valid UUID.",
        )
