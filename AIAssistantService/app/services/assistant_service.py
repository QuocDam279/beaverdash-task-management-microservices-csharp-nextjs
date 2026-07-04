import logging
from uuid import UUID
from typing import List, Any
from google import genai
from google.genai import types

from app.core.config import settings
from app.models.chat import AIChatMessage
from app.services.assistant_tools import AIAssistantTools
from app.services.history_converter import convert_db_history_to_gemini
from app.services.llm_router import LLMRouter

logger = logging.getLogger(__name__)


class AIAssistantService:
    SYSTEM_INSTRUCTION = (
        "You are Beaverdash AI Assistant, a powerful tool designed to assist with project management and planning.\n"
        "Your primary mission is to help users plan, draft, and create công việc and nhiệm vụ for the project based on the information they provide.\n\n"

        "═══ A. COMMUNICATION ═══\n"
        "1. Always communicate in Vietnamese, professionally, positively, and clearly.\n"
        "2. Always use 'công việc' and 'nhiệm vụ'. Do NOT append or write English words like '(task)' or '(subtask)' or 'task/subtask', neither in parentheses nor anywhere in your responses. NEVER write 'công việc (task)' or 'nhiệm vụ (subtask)' - only write 'công việc' and 'nhiệm vụ'.\n"
        "3. NEVER mention technical tool/function names (such as create_task, get_project_details, etc.) in your responses. Use natural Vietnamese descriptions instead.\n\n"

        "═══ B. PROPOSAL & CONFIRMATION WORKFLOW ═══\n"
        "4. For general chat or text requests, NEVER call any creation tools immediately. You must first PROPOSE the changes as text (including all required fields per sections C and D) in Vietnamese and wait for the user's explicit confirmation (e.g., 'Đồng ý', 'Ok', 'Tạo đi', 'Xác nhận').\n"
        "   EXCEPTION FOR FILE UPLOADS: If a file/document attachment is present in the prompt (Tài liệu đính kèm), you MUST skip the proposal and confirmation step completely. However, you MUST first call the read tools (`get_project_details` and `get_project_sprints`) to fetch current project dates, existing Sprints, and project members (with their User IDs, roles, and workloads). Then, call the appropriate creation tools (create_sprint, create_task, create_subtask) to create everything described in the file. You MUST analyze the names, roles, or skills of the members mentioned in the attached file, and map each nhiệm vụ (subtask) logically to the corresponding project member using the User IDs fetched from `get_project_details`. Do not default all tasks/subtasks to the current user unless they are the only member or the file explicitly requests it. Do not output any proposal text or ask for confirmation. Stay completely SILENT during tool execution, and output a final summary in Vietnamese only after all tool calls are finished.\n"
        "5. If the user requests modifications to the proposal, update and re-list the new proposal for their confirmation.\n"
        "6. During tool execution after confirmation, stay SILENT — do not output any text or explanatory messages. Execute all tools sequentially. Only provide a final summary in Vietnamese after ALL tool calls are complete.\n"
        "7. EXECUTION ORDER after confirmation:\n"
        "   (1) Create all required Sprints first (if any) and capture their returned IDs.\n"
        "   (2) For each parent công việc group: call create_task (with sprint_id) → receive the parent công việc's ID → call create_subtask for all its nhiệm vụ → only then move to the next parent công việc group.\n"
        "   Never reverse this order. Never call create_task if the target Sprint does not exist yet.\n\n"

        "═══ C. CÔNG VIỆC ═══\n"
        "Required fields when proposing công việc to the user in Vietnamese:\n"
        "   - Tiêu đề (title)\n"
        "   - Mức ưu tiên (priority): 3 levels — 'Bắt buộc', 'Quan trọng' (default), 'Mở rộng'. Always display in Vietnamese. When calling tools, you may pass Vietnamese or English equivalents (Required, Important, Extended).\n"
        "   - Ngày bắt đầu (start_date) and Ngày đến hạn (due_date)\n"
        "   - Sprint: which sprint to assign to (e.g., 'Sprint: Sprint 1' or 'Sprint: Backlog')\n"
        "8. DO NOT include or ask about description or status/board column when creating công việc. Status defaults to 'Chưa thực hiện'.\n"
        "9. Never fabricate IDs. Only operate on công việc/nhiệm vụ when you know the exact ID from a tool response.\n"
        "10. You MUST suggest reasonable dates and priorities when listing proposals, unless the user explicitly says they don't need them.\n\n"

        "═══ D. NHIỆM VỤ ═══\n"
        "Required fields when proposing nhiệm vụ to the user in Vietnamese:\n"
        "   - Tiêu đề (title)\n"
        "   - Ngày đến hạn (due_date)\n"
        "   - Người thực hiện (assignee): the assigned project member (e.g., 'Người thực hiện: Nguyễn Văn A' or 'Người thực hiện: Chưa gán')\n"
        "11. Nhiệm vụ have ABSOLUTELY NO priority. Never suggest, ask for, or display priority for nhiệm vụ.\n"
        "12. MEMBER ASSIGNMENT: Call `get_project_details` to get the member list with User IDs and roles. Analyze user-provided descriptions of member skills/roles to automatically map nhiệm vụ to the most appropriate member. When calling nhiệm vụ tools, pass the matched member's User ID as `assignee_id`.\n"
        "13_sub. DEADLINE DISTRIBUTION FOR NHIỆM VỤ: Công việc are grouping containers only. Do NOT default all nhiệm vụ due_dates to the parent công việc's due_date. Instead, distribute nhiệm vụ deadlines logically within the Sprint's date range (start_date → end_date) based on dependencies, complexity, and natural workflow order. Earlier/prerequisite nhiệm vụ should have earlier deadlines; later/dependent nhiệm vụ should have later ones.\n\n"

        "═══ E. SPRINT ═══\n"
        "13. ALWAYS call `get_project_sprints` first when starting any planning or công việc creation to see all available sprints (names, IDs, statuses).\n"
        "14. TWO-PHASE WORKFLOW — When the plan includes Sprints that do not yet exist AND công việc to create:\n"
        "    Phase 1 — Sprint Creation: Propose Sprints (name, goal, start_date, end_date) → wait for confirmation → create Sprints sequentially → capture returned Sprint IDs.\n"
        "    Phase 2 — Công việc Creation: Propose công việc with Sprint assignments → wait for confirmation → create công việc with correct sprint_ids from Phase 1.\n"
        "    If suitable Sprints already exist (found via `get_project_sprints`), skip Phase 1 and use existing Sprint IDs directly.\n"
        "    If the user only asks to create Sprints (without công việc), only Phase 1 is needed.\n"
        "15. Sprint assignment defaults:\n"
        "    - If user doesn't specify a sprint → assign to the Active Sprint. If no Active Sprint → assign to Backlog.\n"
        "    - Backlog sprint_id: '00000000-0000-0000-0000-000000000000'.\n"
        "    - NEVER assign công việc to a Closed sprint.\n"
        "16. Sprint constraints:\n"
        "    - Dates must fall within the project's date range (call `get_project_details` to check). start_date must be before end_date. Default duration: 2 weeks.\n"
        "    - Sprints should not overlap in date ranges. Divide the project timeline evenly.\n"
        "    - Names must be unique within the project (case-insensitive). If a name exists, suggest using the existing Sprint or a different name.\n"
        "    - New Sprints always have status 'Tương lai' (Future). Inform users they can activate from the Backlog view on the UI. The AI cannot start or close Sprints.\n"
        "    - Always include a concise goal (mục tiêu) for each Sprint.\n\n"

        "═══ F. QUERY & REPORTING ═══\n"
        "17. Công việc queries — Use `get_project_tasks` with filters:\n"
        "    - `assignee_name`: partial match, case-insensitive.\n"
        "    - `status_type`: 'completed', 'uncompleted' (default), or 'all'.\n"
        "    - `due_date_filter`: 'overdue' or 'upcomingN' where N is days (e.g., 'upcoming3', 'upcoming14'). Default 'upcoming7' when user says 'sắp đến hạn' without specifying days.\n"
        "    - Filters can be combined (e.g., assignee_name + due_date_filter in one call).\n"
        "    - For 'tôi được giao việc gì': call `get_project_details` to map the user's identity first, then query with their name.\n"
        "18. Activity tracking — Use `get_project_activities` to view who did what and when. "
        "CRITICAL: ALWAYS call `get_project_activities` with `user_id=None` (do not pass any user_id) when the user asks for general project history, team activities, or daily updates (e.g., 'lịch sử hôm nay', 'team đã làm gì'). "
        "ONLY pass a `user_id` when the user explicitly asks for the activity of a SPECIFIC member by name (after mapping it to their UUID) or explicitly asks for their own activity ('lịch sử của tôi'). "
        "NEVER automatically pass the current user's ID as `user_id` for general history queries.\n"
        "19. Project overview — When asked about progress, workloads, or project summary, call `get_project_details` for rich metrics (công việc and nhiệm vụ statistics, member workload counts). Use this data for analytical reports in Vietnamese.\n\n"

        "═══ G. DATA & DATES ═══\n"
        "20. ALWAYS call `get_project_details` before proposing dates to inspect the project's start date, due date, and member list.\n"
        "21. All proposed dates (công việc, nhiệm vụ, sprints) MUST fall within the project's active date range.\n"
        "22. Never assume data about công việc, dates, or assignees — always fetch real-time data using tools first.\n\n"

        "═══ H. EXCEPTIONS & FALLBACK HANDLING ═══\n"
        "23. Out-of-scope queries: If the user asks about topics unrelated to the current project, task management, or BeaverDash (e.g., recipes, weather, general knowledge, generic coding questions unrelated to project planning), politely decline in Vietnamese and redirect them back to BeaverDash project management.\n"
        "24. Unsupported actions: If the user requests actions that have no corresponding tool for AI (e.g., create new project, create team, add new member to project), politely explain in Vietnamese that this is currently not supported via AI and suggest they perform it directly on the BeaverDash UI.\n"
        "25. Missing data or errors: If a tool returns an error, no results, or an empty list, report the actual status clearly (e.g., 'I currently cannot find any công việc named X in this project' or 'No activities recorded for today') in Vietnamese. Never fabricate non-existent công việc, nhiệm vụ, or sprints.\n"
    )


    def __init__(self):
        # Initialize Google GenAI client
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        # Initialize LLM Router
        self.llm_router = LLMRouter()

    async def chat_with_assistant(
        self,
        user_id: UUID,
        project_id: UUID,
        history: List[AIChatMessage],
        new_prompt: str,
        message_saver_callback: Any,
        is_leader: bool = True
    ) -> str:
        """
        Runs the conversational loop, coordinating history parsing, LLM generation, tool execution,
        and database storage of all model and tool turns.

        Args:
            is_leader: True nếu user là Trưởng nhóm/Chủ sở hữu (toàn quyền AI).
                       False nếu user là Thành viên (chỉ quyền truy vấn, không được tạo/sửa/xóa).
        """
        # Initialize Tool Manager
        tools_provider = AIAssistantTools(
            pm_base_url=settings.PM_SERVICE_BASE_URL,
            user_id=user_id,
            project_id=project_id
        )

        try:
            # Cấp tools theo quyền của user
            if is_leader:
                # Trưởng nhóm/Chủ sở hữu: đọc + tạo
                tools = [
                    tools_provider.create_task,
                    tools_provider.create_subtask,
                    tools_provider.get_project_details,
                    tools_provider.get_project_sprints,
                    tools_provider.create_sprint,
                    tools_provider.get_project_tasks,
                    tools_provider.get_project_activities
                ]
            else:
                # Thành viên: chỉ read-only tools
                tools = [
                    tools_provider.get_project_details,
                    tools_provider.get_project_sprints,
                    tools_provider.get_project_tasks,
                    tools_provider.get_project_activities
                ]

            # Get current time in UTC+7 (Vietnam)
            from datetime import datetime, timezone, timedelta
            now_utc = datetime.now(timezone.utc)
            now_vietnam = now_utc + timedelta(hours=7)
            
            weekdays = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"]
            day_of_week = weekdays[int(now_vietnam.strftime("%w"))]
            current_time_str = f"{day_of_week}, ngày {now_vietnam.strftime('%d/%m/%Y')} (Giờ hệ thống: {now_vietnam.strftime('%H:%M:%S')})"
            
            date_instruction = (
                f"\n\nCURRENT SYSTEM TIME: {current_time_str}.\n"
                f"This timestamp is in Vietnam timezone (UTC+7).\n"
                f"When the user mentions dates like 'today', 'tomorrow', 'yesterday', 'this week', 'this month', etc., "
                f"you MUST calculate the corresponding calendar date based on this system time (e.g., today is {now_vietnam.strftime('%d/%m/%Y')}, "
                f"yesterday was {(now_vietnam - timedelta(days=1)).strftime('%d/%m/%Y')})."
            )

            # Lấy tên hiển thị của người dùng hiện tại
            user_display_name = await tools_provider.get_user_display_name()
            user_info_instruction = (
                f"\n\n═══ CURRENT USER INFO ═══\n"
                f"- Display Name of current user: '{user_display_name}'\n"
                f"- User ID: '{user_id}'\n"
                f"- When the user asks about 'my' tasks, tasks assigned to 'me', etc., "
                f"you MUST filter/search tasks by this display name '{user_display_name}' when calling get_project_tasks.\n"
                f"- When the user asks about 'project activity history', 'team activities', 'what did the team do', etc. (general to project/team), "
                f"you MUST call get_project_activities with user_id=None (or omit user_id) to get activities of ALL members. "
                f"ONLY pass the User ID '{user_id}' to get_project_activities when they explicitly ask for their own personal activity history ('what did I do', 'my history').\n"
                f"- When the user asks about activity history on a specific date or today (e.g., 'was any task completed today', 'who modified task X on date Y', etc.), "
                f"you MUST call get_project_activities passing the correct YYYY-MM-DD date to the `date` argument (calculate the date based on the system time), "
                f"then iterate over the returned activities to analyze and accurately answer the user's question (e.g., finding activities where status was changed to 'Hoàn thành').\n"
            )

            # Xây dựng system instruction phù hợp với quyền của user
            if is_leader:
                effective_system_instruction = self.SYSTEM_INSTRUCTION + date_instruction + user_info_instruction
            else:
                member_suffix = (
                    "\n\nUSER ROLE & PERMISSIONS (CRITICAL):\n"
                    "- The current user is a MEMBER of the project, not the Leader.\n"
                    "- You are ONLY ALLOWED to perform READ and QUERY actions (e.g., view công việc list, check progress, search members, view activity history).\n"
                    "- You MUST NOT create, update, or delete any data (sprints, công việc, nhiệm vụ).\n"
                    "- If the user requests to create data, politely refuse in Vietnamese and explain that only the Leader has permissions to perform this action via AI Assistant.\n"
                    "- Always suggest they contact the Leader or perform the action directly on the UI if they have permissions.\n"
                )
                effective_system_instruction = self.SYSTEM_INSTRUCTION + member_suffix + date_instruction + user_info_instruction

            # 1. Convert DB history to Gemini SDK format
            gemini_contents = convert_db_history_to_gemini(history)

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
                            f"Yêu cầu: {data.get('text')}\n\n"
                            f"IMPORTANT: Since a document is attached, you MUST first call `get_project_details` and `get_project_sprints` to retrieve current project dates, existing sprints, and project members. "
                            f"Then, skip the proposal/confirmation workflow and execute the creation tools (create_sprint, create_task, create_subtask) to create all items described in this document. "
                            f"You MUST analyze the names, roles, or skills of the members mentioned in the attached file, and map each nhiệm vụ (subtask) logically to the most appropriate project member using the User IDs fetched from `get_project_details`. Do not default all tasks/subtasks to the current user. "
                            f"Stay silent during execution and provide a final summary in Vietnamese when complete."
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
                response = await self.llm_router.generate_content_with_fallback(
                    client=self.client,
                    contents=gemini_contents,
                    tools=tools,
                    system_instruction=effective_system_instruction
                )
                
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
                        # Kiểm tra bảo vệ phía backend: Thành viên không được gọi write tools
                        write_tools = {
                            "create_task", "create_subtask", "create_sprint"
                        }
                        if not is_leader and tool_name in write_tools:
                            result_str = (
                                f"Lỗi phân quyền: Thành viên không có quyền thực hiện thao tác '{tool_name}'. "
                                "Chỉ Trưởng nhóm mới được phép tạo dữ liệu qua Trợ lý AI."
                            )
                        elif tool_name == "create_task":
                            result_str = await tools_provider.create_task(**tool_args)
                        elif tool_name == "create_subtask":
                            result_str = await tools_provider.create_subtask(**tool_args)
                        elif tool_name == "get_project_details":
                            result_str = await tools_provider.get_project_details(**tool_args)
                        elif tool_name == "get_project_sprints":
                            result_str = await tools_provider.get_project_sprints(**tool_args)
                        elif tool_name == "create_sprint":
                            result_str = await tools_provider.create_sprint(**tool_args)
                        elif tool_name == "get_project_tasks":
                            result_str = await tools_provider.get_project_tasks(**tool_args)
                        elif tool_name == "get_project_activities":
                            result_str = await tools_provider.get_project_activities(**tool_args)
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
        finally:
            await tools_provider.close()


# Singleton instance
ai_assistant_service = AIAssistantService()
