"""
Chat Service - Quản lý AI Chat Sessions với cơ chế:
1. LLM Fallback Priority Chain (Gemini → GPT-4o-mini → Llama 3.1 8B)
2. AI Agent Tool Calling (tạo Task, phân công công việc)
3. RAG Context Retrieval
"""
import json
import logging
import uuid
from datetime import datetime, timezone
from typing import Optional

import google.generativeai as genai
import httpx
from groq import Groq
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.chat import AiChatMessage, AiChatSession
from app.services import rag_service

logger = logging.getLogger(__name__)

# =============================================================================
# Cấu hình LLM Providers
# =============================================================================

# Ưu tiên 1: Gemini 3.1 Flash Lite
genai.configure(api_key=settings.GEMINI_API_KEY)

# Ưu tiên 3: Groq Llama 3.1 8B
groq_client = Groq(api_key=settings.GROQ_API_KEY)

# =============================================================================
# AI Agent Tool Definitions
# =============================================================================

TOOL_DEFINITIONS = [
    {
        "type": "function",
        "function": {
            "name": "create_task",
            "description": "Tạo một Task mới trên Kanban Board của dự án. Dùng khi người dùng yêu cầu tạo công việc mới.",
            "parameters": {
                "type": "object",
                "properties": {
                    "board_column_id": {
                        "type": "string",
                        "description": "UUID của cột Kanban Board mà task sẽ được đặt vào."
                    },
                    "title": {
                        "type": "string",
                        "description": "Tiêu đề của task."
                    },
                    "description": {
                        "type": "string",
                        "description": "Mô tả chi tiết của task (tùy chọn)."
                    },
                    "priority": {
                        "type": "string",
                        "enum": ["Low", "Medium", "High", "Critical"],
                        "description": "Mức độ ưu tiên của task."
                    },
                    "due_date": {
                        "type": "string",
                        "description": "Hạn chót hoàn thành (ISO 8601 format, ví dụ: 2025-12-31T23:59:59Z)."
                    }
                },
                "required": ["board_column_id", "title"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "assign_task",
            "description": "Phân công Task cho một thành viên trong dự án. Dùng khi người dùng yêu cầu giao việc.",
            "parameters": {
                "type": "object",
                "properties": {
                    "task_id": {
                        "type": "string",
                        "description": "UUID của task cần phân công."
                    },
                    "assignee_user_id": {
                        "type": "string",
                        "description": "UUID của thành viên được phân công."
                    }
                },
                "required": ["task_id", "assignee_user_id"]
            }
        }
    }
]


# =============================================================================
# Tool Execution
# =============================================================================

async def _execute_tool(tool_name: str, arguments: dict, user_id: uuid.UUID) -> dict:
    """Thực thi tool call bằng cách gọi API nội bộ PM Service."""
    base_url = settings.PM_SERVICE_BASE_URL
    headers = {"X-User-Id": str(user_id), "Content-Type": "application/json"}

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            if tool_name == "create_task":
                payload = {
                    "boardColumnId": arguments["board_column_id"],
                    "title": arguments["title"],
                    "description": arguments.get("description"),
                    "priority": arguments.get("priority"),
                    "dueDate": arguments.get("due_date")
                }
                resp = await client.post(f"{base_url}/api/tasks", json=payload, headers=headers)
                resp.raise_for_status()
                return {"success": True, "data": resp.json()}

            elif tool_name == "assign_task":
                task_id = arguments["task_id"]
                payload = {"assigneeUserId": arguments["assignee_user_id"]}
                resp = await client.patch(f"{base_url}/api/tasks/{task_id}", json=payload, headers=headers)
                resp.raise_for_status()
                return {"success": True, "data": resp.json()}

            else:
                return {"success": False, "error": f"Tool không xác định: {tool_name}"}

        except httpx.HTTPStatusError as e:
            return {"success": False, "error": f"HTTP {e.response.status_code}: {e.response.text}"}
        except Exception as e:
            return {"success": False, "error": str(e)}


# =============================================================================
# LLM Fallback Priority Chain
# =============================================================================

def _build_system_prompt(rag_context: list[dict]) -> str:
    """Xây dựng system prompt với ngữ cảnh RAG và hướng dẫn Agent."""
    context_text = ""
    if rag_context:
        context_text = "\n\n--- TÀI LIỆU THAM KHẢO ---\n"
        for i, chunk in enumerate(rag_context, 1):
            context_text += f"\n[{i}] File: {chunk['file_name']} (chunk {chunk['chunk_index']})\n{chunk['content']}\n"

    return f"""Bạn là trợ lý AI thông minh của hệ thống quản lý dự án Beaverdash. Bạn có khả năng:

1. **Trả lời câu hỏi** dựa trên kho tài liệu của dự án (RAG). Khi trả lời, hãy trích dẫn nguồn tài liệu cụ thể.
2. **Tạo công việc (Task)** trên Kanban Board khi người dùng yêu cầu.
3. **Phân công công việc** cho thành viên trong dự án khi được yêu cầu.

Quy tắc:
- Luôn trả lời bằng tiếng Việt trừ khi người dùng yêu cầu ngôn ngữ khác.
- Khi tạo task hoặc phân công, hãy xác nhận lại thông tin trước khi thực hiện.
- Nếu thiếu thông tin (ví dụ: board_column_id), hãy hỏi lại người dùng.
- Trích dẫn nguồn tài liệu bằng cách ghi [số thứ tự] khi sử dụng thông tin từ tài liệu.
{context_text}"""


async def _call_gemini(messages: list[dict], tools: Optional[list] = None) -> dict:
    """Ưu tiên 1: Gọi Gemini 3.1 Flash Lite với hỗ trợ Tool Calling."""
    gemini_tools = None
    if tools:
        gemini_tools = []
        for tool in tools:
            gemini_tools.append({
                "name": tool["function"]["name"],
                "description": tool["function"]["description"],
                "parameters": tool["function"]["parameters"]
            })

    # Chuyển đổi chat history sang định dạng API của Gemini
    gemini_contents = []
    system_instruction = None

    for msg in messages:
        role = msg["role"]
        if role == "system":
            system_instruction = msg["content"]
        elif role == "user":
            gemini_contents.append({"role": "user", "parts": [{"text": msg["content"]}]})
        elif role == "assistant":
            parts = []
            if msg.get("content"):
                parts.append({"text": msg["content"]})
            if msg.get("tool_calls"):
                for tc in msg["tool_calls"]:
                    args = tc["function"]["arguments"]
                    if isinstance(args, str):
                        args = json.loads(args)
                    parts.append({
                        "function_call": {
                            "name": tc["function"]["name"],
                            "args": args
                        }
                    })
            if parts:
                gemini_contents.append({"role": "model", "parts": parts})
        elif role == "tool":
            res_content = msg["content"]
            if isinstance(res_content, str):
                try:
                    res_content = json.loads(res_content)
                except Exception:
                    res_content = {"result": res_content}
            
            gemini_contents.append({
                "role": "user",
                "parts": [{
                    "function_response": {
                        "name": msg.get("function_name") or "tool_call",
                        "response": res_content
                    }
                }]
            })

    model = genai.GenerativeModel(
        "gemini-3.1-flash-lite",
        system_instruction=system_instruction,
        tools=gemini_tools
    )

    response = model.generate_content(contents=gemini_contents)

    content = ""
    tool_calls = []
    
    if response.candidates and response.candidates[0].content.parts:
        for part in response.candidates[0].content.parts:
            if hasattr(part, "text") and part.text:
                content += part.text
            elif hasattr(part, "function_call") and part.function_call:
                args = dict(part.function_call.args)
                tool_calls.append({
                    "id": f"call_{uuid.uuid4().hex[:12]}",
                    "type": "function",
                    "function": {
                        "name": part.function_call.name,
                        "arguments": args
                    }
                })

    return {
        "content": content if content else None,
        "tool_calls": tool_calls if tool_calls else None
    }


async def _call_gpt4o_mini(messages: list[dict], tools: Optional[list] = None) -> dict:
    """Ưu tiên 2: Gọi GPT-4o-mini qua GitHub Models (OpenAI-compatible)."""
    async with httpx.AsyncClient(timeout=30.0) as client:
        payload = {
            "model": "gpt-4o-mini",
            "messages": messages,
            "temperature": 0.7,
            "max_tokens": 2048
        }
        if tools:
            payload["tools"] = tools

        resp = await client.post(
            "https://models.inference.ai.azure.com/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.GITHUB_MODEL_TOKEN}",
                "Content-Type": "application/json"
            },
            json=payload
        )
        resp.raise_for_status()
        data = resp.json()

        choice = data["choices"][0]
        message = choice["message"]

        return {
            "content": message.get("content"),
            "tool_calls": message.get("tool_calls")
        }


async def _call_groq_llama(messages: list[dict], tools: Optional[list] = None) -> dict:
    """Ưu tiên 3: Gọi Llama 3.1 8B qua Groq."""
    kwargs = {
        "model": "llama-3.1-8b-instant",
        "messages": messages,
        "temperature": 0.7,
        "max_tokens": 2048
    }
    if tools:
        kwargs["tools"] = tools

    response = groq_client.chat.completions.create(**kwargs)
    choice = response.choices[0]

    tool_calls_data = None
    if choice.message.tool_calls:
        tool_calls_data = [
            {
                "id": tc.id,
                "type": "function",
                "function": {
                    "name": tc.function.name,
                    "arguments": tc.function.arguments
                }
            }
            for tc in choice.message.tool_calls
        ]

    return {
        "content": choice.message.content,
        "tool_calls": tool_calls_data
    }


async def call_llm(messages: list[dict], tools: Optional[list] = None) -> dict:
    """
    LLM Fallback Priority Chain:
    1. Gemini 3.1 Flash Lite (mặc định)
    2. GPT-4o-mini (dự phòng cấp 1)
    3. Llama 3.1 8B via Groq (dự phòng cấp 2)

    Nếu provider gặp lỗi (Quota, 5xx, Timeout), tự động chuyển sang provider tiếp theo.
    """
    providers = [
        ("Gemini 3.1 Flash Lite", _call_gemini),
        ("GPT-4o-mini", _call_gpt4o_mini),
        ("Llama 3.1 8B (Groq)", _call_groq_llama),
    ]

    last_error = None
    for name, call_fn in providers:
        try:
            logger.info(f"Đang gọi LLM: {name}")
            result = await call_fn(messages, tools)
            logger.info(f"LLM {name} phản hồi thành công.")
            return result
        except Exception as e:
            last_error = e
            logger.warning(f"LLM {name} thất bại: {e}. Chuyển sang provider tiếp theo...")
            continue

    # Tất cả providers đều thất bại
    raise Exception(f"Tất cả LLM providers đều thất bại. Lỗi cuối: {last_error}")


# =============================================================================
# Chat Session Management
# =============================================================================

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

    # 2. Truy xuất RAG context
    rag_context = await rag_service.retrieve_context(user_message, project_id, db, top_k=5)

    # 3. Xây dựng system prompt và chat history
    system_prompt = _build_system_prompt(rag_context)

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
            result = await _execute_tool(func_name, func_args, user_id)
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

    # 6. Tạo dẫn chứng tài liệu
    used_docs = None
    if rag_context:
        used_docs = [
            {
                "document_id": chunk["document_id"],
                "file_name": chunk["file_name"],
                "chunk_index": chunk["chunk_index"],
                "similarity_score": chunk["similarity_score"]
            }
            for chunk in rag_context
        ]

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

    # Cập nhật thời gian session
    session = db.query(AiChatSession).filter(AiChatSession.id == session_id).first()
    if session:
        session.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(assistant_msg)

    return assistant_msg
