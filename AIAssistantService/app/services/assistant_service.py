import httpx
import logging
import asyncio
from uuid import UUID
from typing import List, Dict, Any, Optional
from google import genai
from google.genai import types

from app.core.config import settings
from app.models.chat import AIChatMessage

logger = logging.getLogger(__name__)

class AIAssistantTools:
    """
    Python functions that act as tools for the Gemini model.
    The docstrings and type annotations will be inspected by the SDK to generate JSON schemas.
    """
    def __init__(self, pm_base_url: str, user_id: UUID, project_id: UUID):
        self.pm_base_url = pm_base_url
        self.user_id_str = str(user_id)
        self.project_id_str = str(project_id)
        self.headers = {
            "X-User-Id": self.user_id_str,
            "Content-Type": "application/json"
        }

    async def create_task(
        self,
        title: str,
        priority: str = "Important",
        start_date: str = None,
        due_date: str = None,
        status: str = None
    ) -> str:
        """
        Tạo một công việc (Task) chính mới cho dự án hiện tại.

        Args:
            title: Tiêu đề công việc. Không được để trống.
            priority: Độ ưu tiên của công việc cha (CHỈ CHẤP NHẬN 3 giá trị tiếng Việt hoặc tiếng Anh tương ứng: Bắt buộc/Required, Quan trọng/Important, Mở rộng/Extended). Mặc định là 'Quan trọng'.
            start_date: Ngày bắt đầu công việc (Định dạng ISO 8601: YYYY-MM-DDTHH:MM:SSZ).
            due_date: Ngày hạn hoàn thành (Định dạng ISO 8601: YYYY-MM-DDTHH:MM:SSZ).
            status: Trạng thái/Cột muốn tạo công việc (ví dụ: 'Chưa thực hiện', 'Đang thực hiện', 'Hoàn thành').
        """
        try:
            # Map priority from Vietnamese/English to backend enum
            p_lower = priority.strip().lower() if priority else "important"
            if p_lower in ["bắt buộc", "bat buoc", "required"]:
                mapped_priority = "Required"
            elif p_lower in ["quan trọng", "quan trong", "important"]:
                mapped_priority = "Important"
            elif p_lower in ["mở rộng", "mo rong", "extended"]:
                mapped_priority = "Extended"
            else:
                mapped_priority = "Important"

            # Step 1: Fetch board columns of the project to find the target column
            board_url = f"{self.pm_base_url}/api/Projects/{self.project_id_str}/board"
            async with httpx.AsyncClient() as client:
                logger.info(f"Fetching board columns from: {board_url} with X-User-Id: {self.user_id_str}")
                board_response = await client.get(board_url, headers=self.headers, timeout=10.0)
                
                if board_response.status_code != 200:
                    return f"Lỗi: Không lấy được thông tin cột của dự án (HTTP {board_response.status_code})."
                
                board_data = board_response.json()
                columns = board_data.get("boardColumns", [])
                
                # Check for duplicate parent task title (case-insensitive)
                for col in columns:
                    for task in col.get("taskItems", []):
                        if task.get("title", "").strip().lower() == title.strip().lower():
                            task_id = task.get("id")
                            return f"Thành công: Công việc '{title}' đã tồn tại trong dự án này (ID: {task_id}). Không cần tạo lại."
                
                if not columns:
                    return "Lỗi: Dự án hiện tại không có cột bảng nào để tạo công việc."
                
                # Find column by name or select fallback
                target_col = None
                if status:
                    status_normalized = status.strip().lower()
                    for col in columns:
                        if col.get("name", "").lower() == status_normalized:
                            target_col = col
                            break
                
                if not target_col:
                    for col in columns:
                        if col.get("name", "").lower() == "chưa thực hiện":
                            target_col = col
                            break
                
                if not target_col:
                    # Fallback to column with lowest position
                    sorted_cols = sorted(columns, key=lambda c: c.get("position", 0))
                    target_col = sorted_cols[0]
                
                column_id = target_col.get("id")
                column_name = target_col.get("name")
                
                # Step 2: Post to PM API to create the task
                task_payload = {
                    "BoardColumnId": column_id,
                    "Title": title,
                    "Priority": mapped_priority,
                    "DueDate": due_date,
                    "StartDate": start_date
                }
                
                create_url = f"{self.pm_base_url}/api/Tasks"
                logger.info(f"Creating task via PM Service: {create_url} with payload: {task_payload}")
                response = await client.post(create_url, json=task_payload, headers=self.headers, timeout=10.0)
                
                if response.status_code == 201:
                    result = response.json()
                    task_id = result.get("id")
                    return f"Thành công: Đã tạo công việc '{title}' (ID: {task_id}) trong cột '{column_name}'."
                else:
                    error_detail = response.text
                    return f"Lỗi từ ProjectManagement Service: {response.status_code} - {error_detail}"
                    
        except Exception as ex:
            logger.exception("Error executing create_task tool")
            return f"Lỗi ngoại lệ khi tạo công việc: {str(ex)}"

    async def create_subtask(
        self,
        task_id: str,
        title: str,
        priority: str = "Medium",
        due_date: str = None
    ) -> str:
        """
        Tạo một công việc con (Subtask) cho một công việc cha đã tồn tại.

        Args:
            task_id: ID (UUID) của công việc cha.
            title: Tiêu đề công việc con. Không được để trống.
            priority: Độ ưu tiên của công việc con (CHỈ CHẤP NHẬN 3 giá trị tiếng Việt hoặc tiếng Anh tương ứng: Thấp/Low, Trung bình/Medium, Cao/High). Mặc định là 'Trung bình'.
            due_date: Hạn hoàn thành của công việc con (Định dạng ISO 8601: YYYY-MM-DDTHH:MM:SSZ).
        """
        try:
            # Map priority from Vietnamese/English to backend enum
            p_lower = priority.strip().lower() if priority else "medium"
            if p_lower in ["thấp", "thap", "low"]:
                mapped_priority = "Low"
            elif p_lower in ["trung bình", "trung binh", "medium"]:
                mapped_priority = "Medium"
            elif p_lower in ["cao", "high"]:
                mapped_priority = "High"
            else:
                mapped_priority = "Medium"

            # Step 1: Fetch board to check for duplicate subtask title under the same parent task
            board_url = f"{self.pm_base_url}/api/Projects/{self.project_id_str}/board"
            async with httpx.AsyncClient() as client:
                logger.info(f"Fetching board from: {board_url} with X-User-Id: {self.user_id_str}")
                board_response = await client.get(board_url, headers=self.headers, timeout=10.0)
                
                if board_response.status_code == 200:
                    board_data = board_response.json()
                    columns = board_data.get("boardColumns", [])
                    
                    # Find parent task
                    parent_task = None
                    for col in columns:
                        for task in col.get("taskItems", []):
                            if task.get("id") == task_id:
                                parent_task = task
                                break
                        if parent_task:
                            break
                    
                    if parent_task:
                        # Check for duplicate subtask title under the same parent task
                        for st in parent_task.get("subTasks", []):
                            if st.get("title", "").strip().lower() == title.strip().lower():
                                subtask_id = st.get("id")
                                return f"Thành công: Công việc con '{title}' đã tồn tại dưới công việc cha '{parent_task.get('title')}' này (ID: {subtask_id}). Không cần tạo lại."
            
            # Step 2: Post to PM API to create the subtask
            subtask_payload = {
                "TaskId": task_id,
                "Title": title,
                "DueDate": due_date,
                "Priority": mapped_priority
            }
            
            create_url = f"{self.pm_base_url}/api/SubTasks"
            async with httpx.AsyncClient() as client:
                logger.info(f"Creating subtask via PM Service: {create_url} with payload: {subtask_payload}")
                response = await client.post(create_url, json=subtask_payload, headers=self.headers, timeout=10.0)
                
                if response.status_code == 201:
                    result = response.json()
                    subtask_id = result.get("id")
                    return f"Thành công: Đã tạo công việc con '{title}' (ID: {subtask_id}) cho công việc cha '{task_id}'."
                else:
                    error_detail = response.text
                    return f"Lỗi từ ProjectManagement Service: {response.status_code} - {error_detail}"
                    
        except Exception as ex:
            logger.exception("Error executing create_subtask tool")
            return f"Lỗi ngoại lệ khi tạo công việc con: {str(ex)}"


class AIAssistantService:
    SYSTEM_INSTRUCTION = (
        "Bạn là Trợ lý AI Beaverdash - một công cụ đắc lực hỗ trợ quản lý dự án và lập kế hoạch.\n"
        "Nhiệm vụ chính của bạn là hỗ trợ người dùng lên kế hoạch, lập ra những công việc (Task) và công việc con (Subtask) cần thiết và phù hợp cho dự án theo thông tin người dùng cung cấp.\n\n"
        "QUY TẮC PHẢN HỒI & TẠO CÔNG VIỆC:\n"
        "1. Luôn giao tiếp bằng Tiếng Việt một cách chuyên nghiệp, tích cực và rõ ràng.\n"
        "2. KHÔNG ĐƯỢC tự ý gọi công cụ tạo công việc (create_task, create_subtask) ngay lập tức khi người dùng đưa ra yêu cầu lập kế hoạch hoặc tạo công việc.\n"
        "3. Khi người dùng yêu cầu lập kế hoạch hoặc tạo công việc, trước hết bạn phải LIỆT KÊ danh sách các công việc đề xuất dưới dạng văn bản và hỏi ý kiến xác nhận của người dùng. Danh sách phải bao gồm đầy đủ các thông tin BẮT BUỘC cho mỗi loại công việc (xem quy tắc 10 và 11).\n"
        "4. Nếu người dùng yêu cầu chỉnh sửa danh sách công việc đề xuất (thêm, bớt, sửa tiêu đề, đổi độ ưu tiên, v.v.), bạn phải cập nhật và liệt kê lại danh sách mới để họ xác nhận.\n"
        "5. CHỈ KHI người dùng phản hồi đồng ý hoặc xác nhận bằng văn bản (ví dụ: 'Đồng ý', 'Ok', 'Tạo đi', 'Xác nhận', 'Chấp nhận', v.v.), bạn mới được phép gọi các công cụ để tạo công việc.\n"
        "6. QUY TRÌNH GỌI CÔNG CỤ TUẦN TỰ (RẤT QUAN TRỌNG):\n"
        "   - Bạn phải hoàn thành việc tạo trọn vẹn từng nhóm công việc (tạo xong công việc cha, sau đó tạo ngay toàn bộ các công việc con của nó) rồi mới được chuyển sang tạo công việc cha tiếp theo.\n"
        "   - Cụ thể: Hãy gọi công cụ `create_task` để tạo công việc cha thứ nhất. Sau khi nhận được kết quả trả về từ hệ thống chứa ID của công việc cha đó, hãy lập tức gọi tiếp công cụ `create_subtask` để tạo toàn bộ các công việc con của nó. Chỉ sau khi đã hoàn thành xong nhóm này, bạn mới được phép gọi công cụ `create_task` cho công việc cha tiếp theo.\n"
        "7. Khi bạn đang trong giai đoạn gọi các công cụ để tạo công việc, bạn TUYỆT ĐỐI KHÔNG ĐƯỢC in ra bất kỳ đoạn văn bản hay giải thích phụ nào trong các lượt gọi công cụ (không thông báo gì ra hết). Hãy chỉ thực thi các công cụ liên tục. Sau khi đã tạo xong toàn bộ tất cả công việc qua công cụ, bạn mới đưa ra phản hồi văn bản cuối cùng thông báo danh sách công việc đã tạo thành công cho người dùng.\n"
        "8. Tuyệt đối không tự bịa ra ID công việc cha khi tạo công việc con, chỉ tạo công việc con khi đã biết chính xác ID của công việc cha.\n"
        "9. ĐẢM BẢO KHÔNG TRÙNG LẶP TIÊU ĐỀ: Tên của các công việc cha trong cùng dự án không được trùng nhau, và tên của các công việc con trong cùng một công việc cha cũng không được trùng nhau. Nếu phát hiện trùng lặp hoặc đã tồn tại trong dự án, hãy thông báo cảnh báo cho người dùng hoặc tự động điều chỉnh nhẹ tiêu đề để tránh trùng.\n"
        "10. QUY TẮC VỀ ĐỘ ƯU TIÊN (CỰC KỲ QUAN TRỌNG - PHẢI TUÂN THỦ CHÍNH XÁC):\n"
        "   - Công việc cha (Task) sử dụng hệ thống ưu tiên RIÊNG với 3 mức độ bằng tiếng Việt: 'Bắt buộc', 'Quan trọng', 'Mở rộng'. Mặc định là 'Quan trọng'. Khi gọi công cụ create_task, bạn có thể truyền 'Required', 'Important', 'Extended' hoặc truyền tiếng Việt tương ứng (hệ thống sẽ tự động ánh xạ).\n"
        "   - Công việc con (SubTask) sử dụng hệ thống ưu tiên RIÊNG với 3 mức độ bằng tiếng Việt: 'Thấp', 'Trung bình', 'Cao'. Mặc định là 'Trung bình'. Khi gọi công cụ create_subtask, bạn có thể truyền 'Low', 'Medium', 'High' hoặc truyền tiếng Việt tương ứng (hệ thống sẽ tự động ánh xạ).\n"
        "   - TUYỆT ĐỐI KHÔNG nhầm lẫn giữa hai hệ thống ưu tiên này. Không được dùng 'Thấp/Trung bình/Cao' cho Task cha, và không được dùng 'Bắt buộc/Quan trọng/Mở rộng' cho SubTask.\n"
        "   - Khi đề xuất danh sách công việc cho người dùng, LUÔN LUÔN hiển thị tên độ ưu tiên bằng TIẾNG VIỆT (ví dụ: 'Bắt buộc', 'Quan trọng', 'Mở rộng', 'Thấp', 'Trung bình', 'Cao'). KHÔNG hiển thị giá trị tiếng Anh cho người dùng.\n"
        "11. QUY TẮC VỀ CÁC TRƯỜNG BẮT BUỘC (CỰC KỲ QUAN TRỌNG):\n"
        "   - Công việc cha (Task) chỉ cần: tiêu đề (title), trạng thái (status / board column), độ ưu tiên (priority), ngày bắt đầu (start_date), ngày kết thúc (due_date). Tuyệt đối KHÔNG có mô tả (description).\n"
        "   - Công việc con (SubTask) chỉ cần: tiêu đề (title), độ ưu tiên (priority), ngày kết thúc (due_date) (không có ngày bắt đầu, không có mô tả).\n"
        "   - Bạn PHẢI tự đề xuất các giá trị hợp lý cho tất cả các trường trên khi liệt kê đề xuất cho người dùng (tự đề xuất ngày bắt đầu, ngày kết thúc và độ ưu tiên). Chỉ bỏ qua hoặc không điền các trường này nếu người dùng NÓI RÕ RÀNG rằng không cần (ví dụ: 'không cần ngày', 'không cần độ ưu tiên').\n"
        "12. Khi hiển thị danh sách công việc đề xuất hoặc thông báo kết quả cho người dùng, LUÔN LUÔN sử dụng cụm từ tiếng Việt 'công việc chính' thay cho 'task'/'Task'/'công việc cha', và 'công việc con' thay cho 'subtask'/'Subtask'. Tuyệt đối không sử dụng các từ tiếng Anh này trong câu trả lời cho người dùng.\n"
    )

    def __init__(self):
        # Initialize Google GenAI client
        # It automatically loads GEMINI_API_KEY from environment, but we pass it explicitly from settings
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)

    def _convert_db_history_to_gemini(self, history: List[AIChatMessage]) -> List[types.Content]:
        """
        Converts internal database chat messages into google-genai SDK Content structures.
        """
        gemini_contents = []
        for msg in history:
            role = msg.role
            # Map 'assistant' to 'model' for Gemini SDK
            if role == "assistant":
                gemini_role = "model"
            else:
                gemini_role = role

            parts = []
            
            # Decode thought_signature from base64 if present
            thought_sig_bytes = None
            if getattr(msg, "thought_signature", None):
                import base64
                try:
                    thought_sig_bytes = base64.b64decode(msg.thought_signature)
                except Exception:
                    pass
            
            # 1. Handle Text Content
            if msg.content:
                text_content = msg.content
                if text_content.startswith("{") and text_content.endswith("}"):
                    import json
                    try:
                        data = json.loads(text_content)
                        if "attachment" in data:
                            att = data["attachment"]
                            text_content = (
                                f"[Tài liệu đính kèm: {att.get('fileName')}]\n"
                                f"Nội dung tài liệu:\n{att.get('content')}\n"
                                f"---\n"
                                f"Yêu cầu: {data.get('text')}"
                            )
                    except Exception:
                        pass
                parts.append(types.Part(text=text_content, thought_signature=thought_sig_bytes))
                
            # 2. Handle Tool Calls (from assistant)
            if msg.tool_calls:
                for tc in msg.tool_calls:
                    fc = types.FunctionCall(name=tc["name"], args=tc["args"])
                    part = types.Part(function_call=fc, thought_signature=thought_sig_bytes)
                    parts.append(part)
            
            # 3. Handle Tool Results (from tool execution)
            if msg.tool_results:
                for tr in msg.tool_results:
                    parts.append(
                        types.Part.from_function_response(
                            name=tr["name"],
                            response={"result": tr["result"]}
                        )
                    )

            if parts:
                gemini_contents.append(
                    types.Content(
                        role=gemini_role,
                        parts=parts
                    )
                )
                
        return gemini_contents

    async def _generate_content_with_fallback(
        self,
        contents: List[types.Content],
        tools: List[Any]
    ) -> Any:
        """
        Calls Gemini API using Primary model (Gemini 3.1 Flash Lite) first.
        Falls back to Secondary model (Gemini 2.5 Flash) on rate limits, token exhaustion, or connection errors.
        Retries with a delay if both fail.
        """
        config = types.GenerateContentConfig(
            system_instruction=self.SYSTEM_INSTRUCTION,
            tools=tools,
            temperature=0.2,
        )

        max_retries = 20
        retry_delay = 10  # seconds
        
        for attempt in range(1, max_retries + 1):
            try:
                model = settings.GEMINI_MODEL_PRIMARY
                logger.info(f"Calling primary model: {model} (Attempt {attempt}/{max_retries})")
                response = await self.client.aio.models.generate_content(
                    model=model,
                    contents=contents,
                    config=config
                )
                return response
            except Exception as e:
                logger.warning(
                    f"Primary model ({settings.GEMINI_MODEL_PRIMARY}) failed on attempt {attempt}: {e}. "
                    f"Attempting fallback to secondary model: {settings.GEMINI_MODEL_SECONDARY}"
                )
                
                try:
                    model = settings.GEMINI_MODEL_SECONDARY
                    logger.info(f"Calling fallback model: {model} (Attempt {attempt}/{max_retries})")
                    response = await self.client.aio.models.generate_content(
                        model=model,
                        contents=contents,
                        config=config
                    )
                    return response
                except Exception as fe:
                    logger.error(f"Fallback model also failed on attempt {attempt}: {fe}")
                    
                    if attempt == max_retries:
                        raise fe
                    
                    logger.info(f"Both models failed. Resource might be exhausted or rate limited. Sleeping {retry_delay}s before retry...")
                    await asyncio.sleep(retry_delay)

    async def chat_with_assistant(
        self,
        user_id: UUID,
        project_id: UUID,
        history: List[AIChatMessage],
        new_prompt: str,
        message_saver_callback: Any # Callback function to write messages to DB in real-time
    ) -> str:
        """
        Runs the conversational loop, coordinating history parsing, LLM generation, tool execution,
        and database storage of all model and tool turns.
        """
        # Initialize Tool Manager
        tools_provider = AIAssistantTools(
            pm_base_url=settings.PM_SERVICE_BASE_URL,
            user_id=user_id,
            project_id=project_id
        )
        
        # Tools exposed to Gemini SDK
        tools = [tools_provider.create_task, tools_provider.create_subtask]

        # 1. Convert DB history to Gemini SDK format
        gemini_contents = self._convert_db_history_to_gemini(history)
        
        # 2. Append new user prompt (parse if JSON)
        user_prompt_text = new_prompt
        if user_prompt_text.startswith("{") and user_prompt_text.endswith("}"):
            import json
            try:
                data = json.loads(user_prompt_text)
                if "attachment" in data:
                    att = data["attachment"]
                    user_prompt_text = (
                        f"[Tài liệu đính kèm: {att.get('fileName')}]\n"
                        f"Nội dung tài liệu:\n{att.get('content')}\n"
                        f"---\n"
                        f"Yêu cầu: {data.get('text')}"
                    )
            except Exception:
                pass

        gemini_contents.append(
            types.Content(
                role="user",
                parts=[types.Part.from_text(text=user_prompt_text)]
            )
        )
        
        # Save user message to database
        await message_saver_callback(role="user", content=new_prompt)

        # Loop to handle LLM execution and potential multi-turn Tool Calls
        loop_count = 0
        max_loops = 20
        final_text_response = "Đã xảy ra lỗi khi trao đổi với AI."

        while loop_count < max_loops:
            loop_count += 1
            
            # Call Gemini with fallback
            response = await self._generate_content_with_fallback(gemini_contents, tools)
            
            # Parse responses
            text_part = response.text
            function_calls = response.function_calls

            # Extract thought_signature if present
            thought_signature_b64 = None
            thought_sig_bytes = None
            if response.candidates:
                for p in response.candidates[0].content.parts:
                    if p.thought_signature:
                        thought_sig_bytes = p.thought_signature
                        import base64
                        thought_signature_b64 = base64.b64encode(thought_sig_bytes).decode("utf-8")
                        break

            # Store this assistant model response
            db_tool_calls = None
            if function_calls:
                db_tool_calls = [
                    {"name": fc.name, "args": fc.args} for fc in function_calls
                ]
            
            # Save Assistant output to DB
            await message_saver_callback(
                role="assistant",
                content=text_part,
                tool_calls=db_tool_calls,
                thought_signature=thought_signature_b64
            )

            # Update loop history
            model_parts = []
            if text_part:
                model_parts.append(types.Part(text=text_part, thought_signature=thought_sig_bytes))
            if function_calls:
                for fc in function_calls:
                    part = types.Part(function_call=types.FunctionCall(name=fc.name, args=fc.args), thought_signature=thought_sig_bytes)
                    model_parts.append(part)
            
            gemini_contents.append(
                types.Content(role="model", parts=model_parts)
            )

            # Check if Gemini requested tool executions
            if function_calls:
                tool_results_list = []
                tool_parts = []
                
                # Execute each tool requested
                for fc in function_calls:
                    tool_name = fc.name
                    tool_args = fc.args
                    
                    logger.info(f"Executing tool {tool_name} with arguments: {tool_args}")
                    
                    result_str = ""
                    if tool_name == "create_task":
                        result_str = await tools_provider.create_task(**tool_args)
                    elif tool_name == "create_subtask":
                        result_str = await tools_provider.create_subtask(**tool_args)
                    else:
                        result_str = f"Lỗi: Không tìm thấy công cụ '{tool_name}'."
                    
                    logger.info(f"Tool {tool_name} result: {result_str}")
                    
                    tool_results_list.append({"name": tool_name, "result": result_str})
                    tool_parts.append(
                        types.Part.from_function_response(
                            name=tool_name,
                            response={"result": result_str}
                        )
                    )
                
                # Save Tool Responses to DB
                await message_saver_callback(
                    role="tool",
                    tool_results=tool_results_list
                )
                
                # Update loop history with tool response
                gemini_contents.append(
                    types.Content(role="tool", parts=tool_parts)
                )
                
                # Continue loop to let Gemini digest the tool results and reply
                continue
            else:
                # No tool calls, we received final text response
                if text_part:
                    final_text_response = text_part
                break

        return final_text_response

# Singleton instance
ai_assistant_service = AIAssistantService()
