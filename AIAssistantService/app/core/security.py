from fastapi import Header, HTTPException, status
from uuid import UUID

async def get_current_user_id(x_user_id: str = Header(None, alias="X-User-Id")) -> UUID:
    """
    Extracts the authenticated User's UUID from the 'X-User-Id' HTTP header.
    This header is injected by the YARP API Gateway after JWT validation.
    """
    if not x_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Mất thông tin danh tính. Vui lòng đăng nhập qua Gateway."
        )
    try:
        return UUID(x_user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Định dạng X-User-Id không hợp lệ."
        )
