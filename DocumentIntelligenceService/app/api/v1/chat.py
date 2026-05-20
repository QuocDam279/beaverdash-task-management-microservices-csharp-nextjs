"""
Chat API - Quản lý AI Chat Sessions và gửi/nhận tin nhắn RAG + Agent.
"""
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user_id
from app.models.chat import AiChatSession
from app.models.project import ProjectMember
from app.schemas.chat_schema import (
    ChatMessageRequest,
    ChatMessageResponse,
    ChatSessionCreate,
    ChatSessionResponse,
)
from app.services import chat_service

router = APIRouter(prefix="/chat", tags=["AI Chat"])


def _check_project_access(user_id: uuid.UUID, project_id: uuid.UUID, db: Session):
    """Kiểm tra quyền truy cập dự án."""
    is_member = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == user_id
    ).first()
    if not is_member:
        raise HTTPException(status_code=403, detail="Bạn không có quyền truy cập dự án này.")


# =============================================================================
# Session Endpoints
# =============================================================================

@router.post("/sessions", response_model=ChatSessionResponse, status_code=201)
def create_chat_session(
    body: ChatSessionCreate,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Tạo phiên chat mới trong dự án."""
    _check_project_access(user_id, body.project_id, db)

    session = chat_service.create_session(
        user_id=user_id,
        project_id=body.project_id,
        title=body.title,
        db=db
    )

    return ChatSessionResponse(
        id=session.id,
        user_id=session.user_id,
        project_id=session.project_id,
        title=session.title,
        created_at=session.created_at,
        updated_at=session.updated_at
    )


@router.get("/sessions", response_model=list[ChatSessionResponse])
def list_chat_sessions(
    project_id: uuid.UUID,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Lấy danh sách phiên chat của user trong dự án."""
    _check_project_access(user_id, project_id, db)

    sessions = chat_service.get_sessions(user_id, project_id, db)

    return [
        ChatSessionResponse(
            id=s.id,
            user_id=s.user_id,
            project_id=s.project_id,
            title=s.title,
            created_at=s.created_at,
            updated_at=s.updated_at
        )
        for s in sessions
    ]


# =============================================================================
# Message Endpoints
# =============================================================================

@router.get("/sessions/{session_id}/messages", response_model=list[ChatMessageResponse])
def get_session_messages(
    session_id: uuid.UUID,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Lấy lịch sử tin nhắn trong phiên chat."""
    # Kiểm tra session thuộc về user
    session = db.query(AiChatSession).filter(
        AiChatSession.id == session_id,
        AiChatSession.user_id == user_id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Phiên chat không tồn tại.")

    messages = chat_service.get_messages(session_id, db)

    return [
        ChatMessageResponse(
            id=m.id,
            role=m.role,
            content=m.content,
            used_documents=m.used_documents,
            tool_calls=m.tool_calls,
            tool_results=m.tool_results,
            created_at=m.created_at
        )
        for m in messages
    ]


@router.post("/sessions/{session_id}/messages", response_model=ChatMessageResponse, status_code=201)
async def send_chat_message(
    session_id: uuid.UUID,
    body: ChatMessageRequest,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Gửi tin nhắn vào phiên chat.
    - Truy xuất RAG context từ kho tài liệu dự án
    - Gọi LLM (Fallback Priority Chain: Gemini → GPT-4o-mini → Groq)
    - Xử lý Agent Tool Calls (tạo task, phân công) nếu có
    - Trả về phản hồi AI kèm dẫn chứng tài liệu
    """
    # Kiểm tra session thuộc về user
    session = db.query(AiChatSession).filter(
        AiChatSession.id == session_id,
        AiChatSession.user_id == user_id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Phiên chat không tồn tại.")

    try:
        assistant_msg = await chat_service.send_message(
            session_id=session_id,
            user_message=body.content,
            user_id=user_id,
            project_id=session.project_id,
            db=db
        )
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Lỗi LLM: {str(e)}")

    return ChatMessageResponse(
        id=assistant_msg.id,
        role=assistant_msg.role,
        content=assistant_msg.content,
        used_documents=assistant_msg.used_documents,
        tool_calls=assistant_msg.tool_calls,
        tool_results=assistant_msg.tool_results,
        created_at=assistant_msg.created_at
    )
