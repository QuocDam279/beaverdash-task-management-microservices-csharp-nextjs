import json
import logging
import uuid
from typing import Optional

import google.generativeai as genai
import httpx
from groq import Groq

from app.core.config import settings

logger = logging.getLogger(__name__)

# Cấu hình Gemini & Groq
genai.configure(api_key=settings.GEMINI_API_KEY)
groq_client = Groq(api_key=settings.GROQ_API_KEY)


def _uppercase_types(d):
    """Đổi tất cả giá trị của key 'type' sang chữ hoa để tương thích với protobuf enum của google.generativeai."""
    if isinstance(d, dict):
        return {k: (v.upper() if k == "type" and isinstance(v, str) else _uppercase_types(v)) for k, v in d.items()}
    elif isinstance(d, list):
        return [_uppercase_types(item) for item in d]
    return d


def _clean_proto_value(val):
    """Đệ quy chuyển đổi các giá trị Protobuf MapComposite/RepeatedComposite về dict/list thuần Python."""
    if hasattr(val, "items"):
        return {k: _clean_proto_value(v) for k, v in val.items()}
    elif hasattr(val, "_values") or isinstance(val, (list, tuple)):
        return [_clean_proto_value(v) for v in val]
    elif hasattr(val, "__iter__") and not isinstance(val, (str, bytes)):
        return [_clean_proto_value(v) for v in val]
    return val


def build_system_prompt(rag_context: list[dict], columns_info: str, members_info: str) -> str:
    """Xây dựng system prompt với ngữ cảnh RAG và hướng dẫn Agent."""
    context_text = ""
    if rag_context:
        context_text = "\n\n--- TÀI LIỆU THAM KHẢO ---\n"
        for chunk in rag_context:
            context_text += f"\nFile: {chunk['file_name']}\n{chunk['content']}\n"

    return f"""Bạn là trợ lý AI thông minh của hệ thống quản lý dự án Beaverdash. Bạn có khả năng:

1. **Trả lời câu hỏi** dựa trên kho tài liệu của dự án (RAG) được cung cấp dưới đây.
2. **Đề xuất tạo công việc chính (Task) và công việc con (SubTask)** trên Kanban Board khi người dùng yêu cầu.
3. **Phân công công việc con (SubTask)** cho thành viên trong dự án.

Quy tắc nghiêm ngặt khi trả lời bằng tài liệu tham khảo (RAG) (chỉ áp dụng khi người dùng đặt câu hỏi tra cứu thông tin, KHÔNG áp dụng khi người dùng yêu cầu tạo/quản lý công việc):
- Chỉ sử dụng thông tin được cung cấp trực tiếp trong phần "TÀI LIỆU THAM KHẢO" ở trên. Không tự suy diễn hoặc dùng kiến thức bên ngoài nếu không có trong tài liệu.
- Nếu tài liệu không chứa câu trả lời hoặc không đủ thông tin, hãy trả lời rõ ràng: "Tôi không tìm thấy thông tin này trong tài liệu của dự án."
- Trả lời một cách tự nhiên dựa trên thông tin trong tài liệu. TUYỆT ĐỐI KHÔNG ĐƯỢC ghi các ký hiệu trích dẫn số thứ tự như [1], [2] hay ghi nguồn số thứ tự trong câu trả lời của bạn.

Quy tắc nghiêm ngặt về Quy trình tạo Task và SubTask:
- Việc tạo Task không bắt buộc phải đi kèm SubTasks (công việc con). 
- Khi nhận được yêu cầu tạo công việc (Task) từ người dùng:
  - Nếu người dùng cung cấp sẵn các công việc con (subtasks), hoặc bạn thấy việc đề xuất các công việc con là cần thiết/phù hợp cho một task phức tạp, hãy liệt kê chúng ra và hỏi người dùng xác nhận: "Bạn có đồng ý tạo danh sách công việc này không?".
  - Nếu người dùng KHÔNG cung cấp công việc con, hãy hỏi xem họ có muốn tạo thêm các công việc con hay không, hoặc đề xuất một vài subtasks mẫu và hỏi họ xem có muốn tạo kèm theo không. Nếu người dùng phản hồi không cần hoặc chỉ muốn tạo một task đơn giản, hãy tiến hành tạo task đó mà không có subtask.
  - Bạn KHÔNG ĐƯỢC tự động gọi công cụ `create_task` ngay lập tức khi nhận được yêu cầu. Phải luôn liệt kê thông tin công việc sẽ tạo (tiêu đề, cột, mức độ ưu tiên, ngày bắt đầu `start_date`, ngày hạn `due_date`, các subtask nếu có) dưới dạng danh sách thân thiện và hỏi người dùng xác nhận trước.
  - Chỉ khi người dùng phản hồi đồng ý/xác nhận ở lượt hội thoại tiếp theo, bạn mới được thực hiện gọi công cụ `create_task`.
  - Khi tạo mới một Task chính, bạn chỉ được phép gọi duy nhất một công cụ `create_task`. Nếu có subtasks đi kèm, hãy truyền chúng qua tham số `subtasks` của `create_task` để tạo cả hai trong cùng một lượt gọi. Tuyệt đối không gọi thêm các công cụ `create_subtask` riêng lẻ sau đó để tránh trùng lặp.
- Định dạng ngày tháng: Khi gọi công cụ, định dạng tất cả các ngày (ví dụ: `due_date`, `start_date` của task hoặc `due_date` của subtask) dưới dạng ISO 8601 (ví dụ: `2026-05-30T00:00:00Z`). Nếu người dùng chỉ nói ngày chung chung hoặc không đúng định dạng (như 30/05), hãy tự quy đổi sang ISO 8601 tương ứng.
- Khi phân công công việc (Ví dụ: "Giao việc X cho Nguyễn Văn A"), bạn phải dùng tên thành viên để gọi công cụ (ví dụ: `assignee_name: "Nguyễn Văn A"`). Hệ thống sẽ tự động tìm kiếm và ánh xạ tên sang UUID. Không bao giờ hỏi người dùng UUID hay hiển thị UUID trong câu trả lời.
- Đối chiếu tên thành viên từ danh sách "THÀNH VIÊN TRONG DỰ ÁN" bên dưới. Nếu người dùng yêu cầu "giao đều cho cả nhóm", bạn hãy phân bổ các SubTasks lần lượt cho các thành viên trong nhóm một cách công bằng (round-robin).
- Nếu người dùng muốn đặt công việc vào một cột Kanban cụ thể, hãy đối chiếu và lấy UUID tương ứng từ phần "CÁC CỘT KANBAN CỦA DỰ ÁN". Nếu không nói rõ cột nào, hãy chọn cột đầu tiên (vị trí nhỏ nhất).
- TUYỆT ĐỐI KHÔNG ĐƯỢC hiển thị bất kỳ UUID hoặc ID hệ thống nào (ví dụ: `a7714d45-...`) trong nội dung phản hồi gửi cho người dùng.

Luôn trả lời bằng tiếng Việt trừ khi người dùng yêu cầu ngôn ngữ khác.
{columns_info}
{members_info}
{context_text}"""


async def _call_gemini(messages: list[dict], tools: Optional[list] = None) -> dict:
    """Ưu tiên 1: Gọi Gemini 2.0 Flash với hỗ trợ Tool Calling."""
    gemini_tools = None
    if tools:
        gemini_tools = []
        for tool in tools:
            gemini_tools.append({
                "name": tool["function"]["name"],
                "description": tool["function"]["description"],
                "parameters": _uppercase_types(tool["function"]["parameters"])
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
        "gemini-2.0-flash",
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
                args = _clean_proto_value(part.function_call.args)
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
    1. Gemini 2.0 Flash (mặc định)
    2. GPT-4o-mini (dự phòng cấp 1)
    3. Llama 3.1 8B via Groq (dự phòng cấp 2)
    """
    providers = [
        ("Gemini 2.0 Flash", _call_gemini),
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
