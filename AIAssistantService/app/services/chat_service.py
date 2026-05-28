from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException, status
from uuid import UUID
from typing import List, Optional, Any
from app.models.chat import AIChatSession, AIChatMessage
from app.models.project_member import ProjectMember

class ChatService:
    @staticmethod
    async def verify_project_membership(db: AsyncSession, project_id: UUID, user_id: UUID) -> None:
        """
        Verify if user_id is a member of project_id.
        Raises 403 Forbidden if they are not.
        """
        query = select(ProjectMember).where(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == user_id
        )
        result = await db.execute(query)
        member = result.scalar_one_or_none()
        if not member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Bạn không có quyền truy cập dự án này."
            )

    @classmethod
    async def create_session(
        cls, db: AsyncSession, project_id: UUID, user_id: UUID, title: Optional[str] = None
    ) -> AIChatSession:
        # Verify user has access to the project
        await cls.verify_project_membership(db, project_id, user_id)
        
        session = AIChatSession(
            project_id=project_id,
            user_id=user_id,
            title=title or "Cuộc hội thoại mới"
        )
        db.add(session)
        await db.commit()
        await db.refresh(session)
        return session

    @classmethod
    async def get_sessions(
        cls, db: AsyncSession, project_id: UUID, user_id: UUID
    ) -> List[AIChatSession]:
        # Verify user has access to the project
        await cls.verify_project_membership(db, project_id, user_id)
        
        query = select(AIChatSession).where(
            AIChatSession.project_id == project_id,
            AIChatSession.user_id == user_id
        ).order_by(AIChatSession.updated_at.desc())
        
        result = await db.execute(query)
        return list(result.scalars().all())

    @classmethod
    async def get_session_with_messages(
        cls, db: AsyncSession, session_id: UUID, user_id: UUID
    ) -> AIChatSession:
        # Retrieve the session
        from sqlalchemy.orm import selectinload
        query = select(AIChatSession).where(AIChatSession.id == session_id).options(
            selectinload(AIChatSession.messages)
        )
        result = await db.execute(query)
        session = result.scalar_one_or_none()
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy phiên hội thoại này."
            )
            
        # Verify user is a member of the project connected to the session
        await cls.verify_project_membership(db, session.project_id, user_id)
        return session

    @classmethod
    async def create_message(
        cls,
        db: AsyncSession,
        session_id: UUID,
        role: str,
        content: Optional[str] = None,
        tool_calls: Optional[List[Any]] = None,
        tool_results: Optional[List[Any]] = None,
        thought_signature: Optional[str] = None
    ) -> AIChatMessage:
        message = AIChatMessage(
            session_id=session_id,
            role=role,
            content=content,
            tool_calls=tool_calls,
            tool_results=tool_results,
            thought_signature=thought_signature
        )
        db.add(message)
        
        # Touch session updated_at
        session_query = select(AIChatSession).where(AIChatSession.id == session_id)
        session_result = await db.execute(session_query)
        session = session_result.scalar_one_or_none()
        if session:
            session.title = session.title  # simple touch to trigger update triggers
            db.add(session)
            
        await db.commit()
        await db.refresh(message)
        return message

    @classmethod
    async def rename_session(
        cls, db: AsyncSession, session_id: UUID, user_id: UUID, title: str
    ) -> AIChatSession:
        # Retrieve the session
        query = select(AIChatSession).where(AIChatSession.id == session_id)
        result = await db.execute(query)
        session = result.scalar_one_or_none()
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy phiên hội thoại này."
            )
            
        # Verify user is a member of the project connected to the session
        await cls.verify_project_membership(db, session.project_id, user_id)
        
        session.title = title
        await db.commit()
        await db.refresh(session)
        return session

    @classmethod
    async def delete_session(
        cls, db: AsyncSession, session_id: UUID, user_id: UUID
    ) -> None:
        # Retrieve the session
        query = select(AIChatSession).where(AIChatSession.id == session_id)
        result = await db.execute(query)
        session = result.scalar_one_or_none()
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy phiên hội thoại này."
            )
            
        # Verify user is a member of the project connected to the session
        await cls.verify_project_membership(db, session.project_id, user_id)
        
        await db.delete(session)
        await db.commit()
