from fastapi import APIRouter, Depends, status, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete
from uuid import UUID
import logging

from app.core.database import get_db
from app.models.project import Project
from app.models.user import User
from app.models.project_member import ProjectMember
from app.schemas.event_schema import ProjectSyncSchema, ProjectMembersSyncSchema

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/projects", status_code=status.HTTP_200_OK)
async def sync_project(
    payload: ProjectSyncSchema,
    db: AsyncSession = Depends(get_db)
):
    """
    Webhook nhận thông tin dự án đồng bộ từ ProjectManagement Service.
    """
    logger.info(f"Received project sync webhook: {payload}")
    project_id = payload.id
    
    query = select(Project).where(Project.id == project_id)
    result = await db.execute(query)
    db_project = result.scalar_one_or_none()
    
    if db_project:
        db_project.name = payload.name
        db_project.description = payload.description
        db_project.status = payload.status
        logger.info(f"Updated project {project_id} in local database.")
    else:
        db_project = Project(
            id=project_id,
            name=payload.name,
            description=payload.description,
            status=payload.status
        )
        db.add(db_project)
        logger.info(f"Created new project {project_id} in local database.")
        
    await db.commit()
    return {"message": "Dự án đã được đồng bộ thành công."}

@router.post("/projects/{project_id}/members", status_code=status.HTTP_200_OK)
async def sync_project_members(
    project_id: UUID,
    payload: ProjectMembersSyncSchema,
    db: AsyncSession = Depends(get_db)
):
    """
    Webhook nhận danh sách thành viên dự án đồng bộ từ ProjectManagement Service.
    Xóa danh sách cũ của dự án này và ghi đè danh sách mới.
    """
    logger.info(f"Received project members sync webhook for project {project_id} with members {payload.member_user_ids}")
    
    # 1. Ensure project exists in local database first
    proj_query = select(Project).where(Project.id == project_id)
    proj_result = await db.execute(proj_query)
    if not proj_result.scalar_one_or_none():
        # Create placeholder project if it was not synced yet
        placeholder_proj = Project(
            id=project_id,
            name="Dự án đang đồng bộ...",
            description="Đang đồng bộ thông tin...",
            status="NotStarted"
        )
        db.add(placeholder_proj)
        await db.commit()
        logger.info(f"Created placeholder project {project_id} to satisfy constraint.")

    # 2. Clear old members of this project
    del_stmt = delete(ProjectMember).where(ProjectMember.project_id == project_id)
    await db.execute(del_stmt)
    await db.commit()
    
    # 3. Add new members (using defensive checking for foreign keys of users)
    for u_id in payload.member_user_ids:
        # Check if user exists locally
        user_query = select(User).where(User.id == u_id)
        user_res = await db.execute(user_query)
        if not user_res.scalar_one_or_none():
            # If user does not exist (RabbitMQ sync hasn't run or is delayed), insert a placeholder user
            placeholder_user = User(
                id=u_id,
                email=f"pending_sync_{u_id}@beaverdash.com",
                display_name="Thành viên đang đồng bộ...",
                avatar=None
            )
            db.add(placeholder_user)
            await db.commit()
            logger.info(f"Created placeholder user {u_id} to satisfy membership constraint.")
        
        # Add project member relation
        member = ProjectMember(project_id=project_id, user_id=u_id)
        db.add(member)
        
    await db.commit()
    logger.info(f"Successfully synced {len(payload.member_user_ids)} members for project {project_id}.")
    return {"message": f"Danh sách {len(payload.member_user_ids)} thành viên đã được đồng bộ."}
