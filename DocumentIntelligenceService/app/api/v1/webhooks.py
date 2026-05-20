"""
Webhooks API - Nhận dữ liệu đồng bộ từ ProjectManagement Service.
Endpoints này KHÔNG yêu cầu xác thực JWT (giao tiếp nội bộ microservices).
"""
import uuid
import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.project import Project, ProjectMember
from app.models.user import User
from app.schemas.event_schema import ProjectMembersSyncPayload, ProjectSyncPayload

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/webhooks", tags=["Webhooks"])


@router.post("/projects", status_code=200)
def sync_project(
    payload: ProjectSyncPayload,
    db: Session = Depends(get_db)
):
    """
    Đồng bộ/tạo dự án từ PM Service.
    Nếu project đã tồn tại → cập nhật, chưa tồn tại → tạo mới.
    """
    existing = db.query(Project).filter(Project.id == payload.id).first()

    if existing:
        existing.name = payload.name
        existing.description = payload.description
        existing.status = payload.status
        logger.info(f"Cập nhật dự án {payload.id}: {payload.name}")
    else:
        project = Project(
            id=payload.id,
            name=payload.name,
            description=payload.description,
            status=payload.status
        )
        db.add(project)
        logger.info(f"Tạo mới dự án {payload.id}: {payload.name}")

    db.commit()
    return {"message": "Đồng bộ dự án thành công.", "project_id": str(payload.id)}


@router.post("/projects/{project_id}/members", status_code=200)
def sync_project_members(
    project_id: uuid.UUID,
    payload: ProjectMembersSyncPayload,
    db: Session = Depends(get_db)
):
    """
    Đồng bộ danh sách thành viên dự án từ PM Service.
    Cơ chế Replace: Xóa toàn bộ thành viên cũ → thêm lại danh sách mới.
    """
    # Kiểm tra project tồn tại
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail=f"Dự án {project_id} không tồn tại.")

    # Xóa toàn bộ thành viên cũ
    db.query(ProjectMember).filter(ProjectMember.project_id == project_id).delete()

    # Thêm lại danh sách thành viên mới
    for user_id in payload.member_user_ids:
        # Kiểm tra và tạo placeholder user nếu user chưa tồn tại
        user_exists = db.query(User).filter(User.id == user_id).first()
        if not user_exists:
            placeholder_user = User(
                id=user_id,
                email=f"placeholder_{str(user_id)[:8]}@beaverdash.com",
                display_name=f"Placeholder {str(user_id)[:8]}"
            )
            db.add(placeholder_user)
            db.flush()

        member = ProjectMember(
            project_id=project_id,
            user_id=user_id,
            status="active",
            joined_at=datetime.now(timezone.utc)
        )
        db.add(member)

    db.commit()
    logger.info(f"Đồng bộ {len(payload.member_user_ids)} thành viên cho dự án {project_id}")

    return {
        "message": "Đồng bộ thành viên dự án thành công.",
        "project_id": str(project_id),
        "member_count": len(payload.member_user_ids)
    }
