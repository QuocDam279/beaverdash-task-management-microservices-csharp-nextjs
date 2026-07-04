import logging
from uuid import UUID
from sqlalchemy import delete
from sqlalchemy.dialects.postgresql import insert

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
            stmt = insert(User).values(
                id=user_id,
                email=email,
                display_name=display_name,
                avatar=avatar
            )
            
            update_dict = {
                "email": email,
                "display_name": display_name
            }
            if avatar is not None:
                update_dict["avatar"] = avatar
                
            stmt = stmt.on_conflict_do_update(
                index_elements=["id"],
                set_=update_dict
            )
            await db.execute(stmt)
            await db.commit()
            logger.info(f"Successfully registered or updated user {user_id} locally.")
        except Exception as ex:
            await db.rollback()
            logger.exception(f"Error handling database transaction for user {user_id}")


async def handle_project_created_or_updated(body: dict) -> None:
    """Xử lý event ProjectCreated/ProjectUpdated từ RabbitMQ."""
    message = body.get("message", body)
    
    project_id_str = message.get("projectId") or message.get("ProjectId")
    name = message.get("name") or message.get("Name")
    description = message.get("description") or message.get("Description")
    status = message.get("status") or message.get("Status")

    if not project_id_str or not name:
        logger.warning(f"Received project event with missing fields: {body}")
        return

    try:
        project_id = UUID(str(project_id_str))
    except ValueError:
        logger.error(f"Invalid project UUID in event: {project_id_str}")
        return

    async with AsyncSessionLocal() as db:
        try:
            stmt = insert(Project).values(
                id=project_id,
                name=name,
                description=description,
                status=status
            )
            stmt = stmt.on_conflict_do_update(
                index_elements=["id"],
                set_={
                    "name": name,
                    "description": description,
                    "status": status
                }
            )
            await db.execute(stmt)
            await db.commit()
            logger.info(f"Successfully created or updated project {project_id} from RabbitMQ event.")
        except Exception as ex:
            await db.rollback()
            logger.exception(f"Error handling project created/updated event for project {project_id}")


async def handle_project_members_synced(body: dict) -> None:
    """Xử lý event ProjectMembersSynced từ RabbitMQ."""
    message = body.get("message", body)
    
    project_id_str = message.get("projectId") or message.get("ProjectId")
    member_user_ids_str = message.get("memberUserIds") or message.get("MemberUserIds") or []

    if not project_id_str:
        logger.warning(f"Received members synced event with missing projectId: {body}")
        return

    try:
        project_id = UUID(str(project_id_str))
    except ValueError:
        logger.error(f"Invalid project UUID in members synced event: {project_id_str}")
        return

    async with AsyncSessionLocal() as db:
        try:
            # 1. Ensure project exists using ON CONFLICT DO NOTHING
            proj_stmt = insert(Project).values(
                id=project_id,
                name="Dự án đang đồng bộ...",
                description="Đang đồng bộ thông tin...",
                status="NotStarted"
            ).on_conflict_do_nothing(index_elements=["id"])
            await db.execute(proj_stmt)
            await db.flush()

            # 2. Clear old members of this project
            del_stmt = delete(ProjectMember).where(ProjectMember.project_id == project_id)
            await db.execute(del_stmt)
            await db.flush()

            # 3. Add new members
            for u_id_str in member_user_ids_str:
                try:
                    u_id = UUID(str(u_id_str))
                except ValueError:
                    logger.error(f"Invalid user UUID in members synced event: {u_id_str}")
                    continue

                # Ensure user exists using ON CONFLICT DO NOTHING
                user_stmt = insert(User).values(
                    id=u_id,
                    email=f"pending_sync_{u_id}@beaverdash.com",
                    display_name="Thành viên đang đồng bộ...",
                    avatar=None
                ).on_conflict_do_nothing(index_elements=["id"])
                await db.execute(user_stmt)
                await db.flush()

                member = ProjectMember(project_id=project_id, user_id=u_id)
                db.add(member)

            await db.commit()
            logger.info(f"Successfully synced {len(member_user_ids_str)} members for project {project_id}.")
        except Exception as ex:
            await db.rollback()
            logger.exception(f"Error handling project members synced event for project {project_id}")

