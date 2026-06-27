import logging
from uuid import UUID
from sqlalchemy.future import select
from sqlalchemy import delete

from app.core.database import AsyncSessionLocal
from app.models.user import User
from app.models.project import Project
from app.models.project_member import ProjectMember

logger = logging.getLogger(__name__)

async def handle_user_created_or_updated(message_data: dict) -> None:
    """
    Parses user created/updated events from RabbitMQ and upserts them in the local database.
    Supports both MassTransit envelope formatting and direct JSON.
    """
    # MassTransit wraps published events under a 'message' object
    data = message_data.get("message", message_data)
    
    # Extract properties with support for multiple naming cases
    user_id_str = data.get("id") or data.get("Id") or data.get("sub") or data.get("userId")
    email = data.get("email") or data.get("Email")
    display_name = data.get("displayName") or data.get("DisplayName") or data.get("name") or data.get("Name")
    avatar = data.get("avatar") or data.get("Avatar")

    if not user_id_str or not email:
        logger.warning(f"RabbitMQ event skipped: missing user ID or email. Data: {data}")
        return

    try:
        user_id = UUID(str(user_id_str))
    except ValueError:
        logger.error(f"Invalid UUID received in user event: {user_id_str}")
        return

    async with AsyncSessionLocal() as db:
        try:
            query = select(User).where(User.id == user_id)
            result = await db.execute(query)
            db_user = result.scalar_one_or_none()

            if db_user:
                db_user.email = email
                db_user.display_name = display_name
                # Avoid resetting avatar if not provided in updates
                if avatar is not None:
                    db_user.avatar = avatar
                logger.info(f"Successfully updated user {user_id} locally.")
            else:
                db_user = User(
                    id=user_id,
                    email=email,
                    display_name=display_name,
                    avatar=avatar
                )
                db.add(db_user)
                logger.info(f"Successfully registered new user {user_id} locally.")
            
            await db.commit()
        except Exception as ex:
            await db.rollback()
            logger.exception(f"Error handling database transaction for user {user_id}")


async def handle_project_created_or_updated(body: dict) -> None:
    """Xử lý event ProjectCreated/ProjectUpdated từ RabbitMQ."""
    message = body.get("message", body)
    
    project_id = message.get("projectId")
    name = message.get("name")
    description = message.get("description")
    status = message.get("status")

    if not project_id or not name:
        logger.warning(f"Received project event with missing fields: {body}")
        return

    async with AsyncSessionLocal() as db:
        query = select(Project).where(Project.id == project_id)
        result = await db.execute(query)
        db_project = result.scalar_one_or_none()

        if db_project:
            db_project.name = name
            db_project.description = description
            db_project.status = status
            logger.info(f"Updated project {project_id} from RabbitMQ event.")
        else:
            db_project = Project(
                id=project_id,
                name=name,
                description=description,
                status=status
            )
            db.add(db_project)
            logger.info(f"Created project {project_id} from RabbitMQ event.")

        await db.commit()


async def handle_project_members_synced(body: dict) -> None:
    """Xử lý event ProjectMembersSynced từ RabbitMQ."""
    message = body.get("message", body)
    
    project_id = message.get("projectId")
    member_user_ids = message.get("memberUserIds", [])

    if not project_id:
        logger.warning(f"Received members synced event with missing projectId: {body}")
        return

    async with AsyncSessionLocal() as db:
        # 1. Ensure project exists
        proj_query = select(Project).where(Project.id == project_id)
        proj_result = await db.execute(proj_query)
        if not proj_result.scalar_one_or_none():
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

        # 3. Add new members
        for u_id in member_user_ids:
            # Check if user exists locally
            user_query = select(User).where(User.id == u_id)
            user_res = await db.execute(user_query)
            if not user_res.scalar_one_or_none():
                placeholder_user = User(
                    id=u_id,
                    email=f"pending_sync_{u_id}@beaverdash.com",
                    display_name="Thành viên đang đồng bộ...",
                    avatar=None
                )
                db.add(placeholder_user)
                await db.commit()
                logger.info(f"Created placeholder user {u_id} to satisfy membership constraint.")

            member = ProjectMember(project_id=project_id, user_id=u_id)
            db.add(member)

        await db.commit()
        logger.info(f"Synced {len(member_user_ids)} members for project {project_id} from RabbitMQ event.")
