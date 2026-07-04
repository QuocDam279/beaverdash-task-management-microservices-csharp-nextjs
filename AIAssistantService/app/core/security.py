from fastapi import Header, HTTPException, status
from uuid import UUID
import httpx
import logging

logger = logging.getLogger(__name__)

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


async def get_project_member_role(user_id: UUID, project_id: UUID, pm_base_url: str) -> bool:
    """
    Kiểm tra xem user có phải là Leader/Owner trong project hay không.
    Gọi PM Service để lấy thông tin project và tìm role của user.

    Returns:
        True  — nếu user là Trưởng nhóm hoặc Chủ sở hữu (toàn quyền AI).
        False — nếu user là Thành viên thông thường (chỉ quyền đọc).
    """
    user_id_str = str(user_id)
    project_id_str = str(project_id)
    headers = {"X-User-Id": user_id_str}

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(
                f"{pm_base_url}/api/Projects/{project_id_str}/overview",
                headers=headers
            )

        if resp.status_code != 200:
            # Nếu không lấy được thông tin, mặc định cấp quyền Member (an toàn hơn)
            logger.warning(
                f"[RoleCheck] PM Service returned {resp.status_code} for project {project_id_str}. "
                f"Defaulting to Member (read-only) for user {user_id_str}."
            )
            return False

        data = resp.json()
        member_workloads = data.get("memberWorkloads", [])
        created_by = data.get("createdByUserId", "")
        team_id = data.get("teamId")

        # Dự án cá nhân (không có team): người tạo là Owner
        if not team_id and created_by == user_id_str:
            return True

        # Tìm role của user trong danh sách thành viên
        for member in member_workloads:
            if str(member.get("userId", "")) == user_id_str:
                role = member.get("role", "")
                if role in ("Trưởng nhóm", "Chủ sở hữu"):
                    return True
                return False

        # Không tìm thấy user trong dự án → mặc định Member
        return False

    except Exception as e:
        logger.error(f"[RoleCheck] Failed to check member role for user {user_id_str} in project {project_id_str}: {e}")
        # Nếu lỗi kết nối, mặc định cấp quyền Member
        return False
