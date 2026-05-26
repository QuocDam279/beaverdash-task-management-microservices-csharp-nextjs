import json
import logging
import uuid
from datetime import datetime, timezone
from typing import Optional

import httpx
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.chat import AiChatMessage, AiChatSession
from app.services import rag_service

from .casual_detector import is_casual_message
from .agent_tools import TOOL_DEFINITIONS, execute_tool
from .llm_client import build_system_prompt, call_llm

logger = logging.getLogger(__name__)


def create_session(
    user_id: uuid.UUID,
    project_id: uuid.UUID,
    title: Optional[str],
    db: Session
) -> AiChatSession:
    """Tạo phiên chat mới."""
    session = AiChatSession(
        id=uuid.uuid4(),
        user_id=user_id,
        project_id=project_id,
        title=title or "Cuộc trò chuyện mới",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


def get_sessions(user_id: uuid.UUID, project_id: uuid.UUID, db: Session) -> list[AiChatSession]:
    """Lấy danh sách phiên chat của user trong dự án."""
    return db.query(AiChatSession).filter(
        AiChatSession.user_id == user_id,
        AiChatSession.project_id == project_id
    ).order_by(AiChatSession.updated_at.desc()).all()


def get_messages(session_id: uuid.UUID, db: Session) -> list[AiChatMessage]:
    """Lấy lịch sử tin nhắn trong phiên chat."""
    return db.query(AiChatMessage).filter(
        AiChatMessage.session_id == session_id
    ).order_by(AiChatMessage.created_at.asc()).all()


async def send_message(
    session_id: uuid.UUID,
    user_message: str,
    user_id: uuid.UUID,
    project_id: uuid.UUID,
    db: Session
) -> AiChatMessage:
    """
    Xử lý tin nhắn chat:
    1. Lưu tin nhắn user
    2. Truy xuất RAG context
    3. Xây dựng prompt + chat history
    4. Gọi LLM (Fallback Chain)
    5. Xử lý tool calls (nếu có)
    6. Lưu và trả về response
    """
    # 1. Lưu tin nhắn user vào DB
    user_msg = AiChatMessage(
        id=uuid.uuid4(),
        session_id=session_id,
        role="user",
        content=user_message,
        created_at=datetime.now(timezone.utc)
    )
    db.add(user_msg)
    db.commit()

    # 2. Truy xuất RAG context (bỏ qua nếu tin nhắn là chào hỏi / chit-chat)
    if is_casual_message(user_message):
        logger.info(f"Bỏ qua RAG retrieval cho tin nhắn casual: '{user_message[:50]}'")
        rag_context = []
    else:
        rag_context = await rag_service.retrieve_context(user_message, project_id, db, top_k=3)

    # 3. Lấy thông tin các cột Kanban và thành viên dự án từ PM Service
    board_columns = []
    project_members = []
    base_url = settings.PM_SERVICE_BASE_URL
    headers = {"X-User-Id": str(user_id)}
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            resp = await client.get(f"{base_url}/api/projects/{project_id}/board", headers=headers)
            if resp.status_code == 200:
                board_data = resp.json()
                board_columns = board_data.get("boardColumns", [])
        except Exception as e:
            logger.error(f"Lỗi khi lấy thông tin bảng Kanban: {e}")

        try:
            resp_overview = await client.get(f"{base_url}/api/projects/{project_id}/overview", headers=headers)
            if resp_overview.status_code == 200:
                overview_data = resp_overview.json()
                project_members = overview_data.get("memberWorkloads", [])
        except Exception as e:
            logger.error(f"Lỗi khi lấy thông tin thành viên dự án: {e}")

    # Định dạng thông tin cột Kanban cho prompt
    columns_info = ""
    if board_columns:
        columns_info = "\n\n--- CÁC CỘT KANBAN CỦA DỰ ÁN ---\n"
        sorted_columns = sorted(board_columns, key=lambda x: x.get("position", 0))
        for col in sorted_columns:
            columns_info += f"- Cột: \"{col['name']}\" (ID: {col['id']}, Vị trí: {col.get('position', 0)})\n"

    # Định dạng danh sách thành viên dự án cho prompt
    members_info = ""
    if project_members:
        members_info = "\n\n--- THÀNH VIÊN TRONG DỰ ÁN ---\n"
        for m in project_members:
            members_info += f"- \"{m['displayName']}\" (Vai trò: {m['role']})\n"

    # 4. Xây dựng system prompt và chat history
    system_prompt = build_system_prompt(rag_context, columns_info, members_info)

    # Load chat history (giới hạn 20 tin nhắn gần nhất)
    history = db.query(AiChatMessage).filter(
        AiChatMessage.session_id == session_id
    ).order_by(AiChatMessage.created_at.asc()).limit(20).all()

    messages = [{"role": "system", "content": system_prompt}]
    for msg in history:
        if msg.role in ("user", "assistant"):
            messages.append({"role": msg.role, "content": msg.content or ""})

    # 4. Gọi LLM với Fallback Priority Chain
    llm_response = await call_llm(messages, tools=TOOL_DEFINITIONS)

    # 5. Xử lý Tool Calls (nếu LLM yêu cầu)
    tool_calls_data = None
    tool_results_data = None
    final_content = llm_response.get("content", "")

    if llm_response.get("tool_calls"):
        tool_calls_data = llm_response["tool_calls"]
        tool_results_data = []

        for tc in tool_calls_data:
            func_name = tc["function"]["name"]
            func_args = json.loads(tc["function"]["arguments"]) if isinstance(tc["function"]["arguments"], str) else tc["function"]["arguments"]

            logger.info(f"Thực thi tool: {func_name} với tham số: {func_args}")
            result = await execute_tool(func_name, func_args, user_id, project_id)
            tool_results_data.append({
                "tool_call_id": tc.get("id", ""),
                "function_name": func_name,
                "result": result
            })

        # Gọi lại LLM với kết quả tool để sinh câu trả lời cuối cùng
        messages.append({"role": "assistant", "content": None, "tool_calls": tool_calls_data})
        for tr in tool_results_data:
            messages.append({
                "role": "tool",
                "tool_call_id": tr["tool_call_id"],
                "content": json.dumps(tr["result"], ensure_ascii=False)
            })

        final_response = await call_llm(messages)
        final_content = final_response.get("content", "Đã thực hiện thao tác thành công.")

    # 6. Tạo dẫn chứng tài liệu (Chỉ trả về danh sách tài liệu liên quan có độ tương đồng tốt khi không phải gọi công cụ)
    used_docs = None
    if not tool_calls_data and rag_context:
        valid_chunks = [c for c in rag_context if c.get("similarity_score", 0) >= 0.45]
        if valid_chunks:
            seen_doc_ids = set()
            used_docs = []
            for chunk in valid_chunks:
                doc_id = chunk["document_id"]
                if doc_id not in seen_doc_ids:
                    seen_doc_ids.add(doc_id)
                    used_docs.append({
                        "document_id": doc_id,
                        "file_name": chunk["file_name"],
                        "chunk_index": chunk["chunk_index"],
                        "similarity_score": chunk["similarity_score"],
                        "content": chunk["content"]
                    })
            if not used_docs:
                used_docs = None

    # 7. Lưu response vào DB
    assistant_msg = AiChatMessage(
        id=uuid.uuid4(),
        session_id=session_id,
        role="assistant",
        content=final_content,
        used_documents=used_docs,
        tool_calls=tool_calls_data,
        tool_results=tool_results_data,
        created_at=datetime.now(timezone.utc)
    )
    db.add(assistant_msg)

    # Cập nhật thời gian session và tự động đổi tên nếu là tin nhắn đầu tiên
    session = db.query(AiChatSession).filter(AiChatSession.id == session_id).first()
    if session:
        session.updated_at = datetime.now(timezone.utc)
        # Nếu tiêu đề vẫn là mặc định "Cuộc trò chuyện mới", tự động đổi tên theo tin nhắn đầu tiên của user
        if session.title == "Cuộc trò chuyện mới" or not session.title:
            title_text = user_message.strip()
            if len(title_text) > 30:
                title_text = title_text[:27] + "..."
            session.title = title_text

    db.commit()
    db.refresh(assistant_msg)

    return assistant_msg
