import logging
from uuid import UUID
from sqlalchemy.future import select

from app.core.database import AsyncSessionLocal
from app.models.user import User

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
