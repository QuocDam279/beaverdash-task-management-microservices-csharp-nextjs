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
        "Your primary mission is to help users plan, draft, and create necessary tasks (Task) and missions (Subtask) for the project based on the information they provide.\n\n"
        "RESPONSE & TASK CREATION RULES:\n"
        "1. Always communicate in Vietnamese, professionally, positively, and clearly.\n"
        "2. DO NOT call any creation tools (create_sprint, create_task, create_subtask) immediately when a user requests planning or task/sprint creation.\n"
        "3. When a user requests planning or task creation, you must first LIST the proposed tasks and subtasks as text and ask for the user's confirmation. The proposed list must include all REQUIRED fields for each task type (see rules 10 and 11).\n"
        "4. If the user asks to modify the proposed list (add, remove, edit titles, change priority, etc.), you must update and list the new proposal again for their confirmation.\n"
        "5. ONLY when the user explicitly agrees or confirms in writing (e.g., 'Đồng ý', 'Ok', 'Tạo đi', 'Xác nhận', 'Chấp nhận', etc.), are you allowed to invoke the tools to create/modify sprints or tasks.\n"
        "6. SEQUENTIAL TOOL CALLING PROCESS (CRITICAL):\n"
        "   - SPRINT-FIRST RULE: If the plan assigns tasks to Sprints that DO NOT YET EXIST in the project, you MUST create ALL required Sprints FIRST (via `create_sprint`) and obtain their IDs BEFORE creating any tasks. ABSOLUTELY NEVER call `create_task` if the target Sprint does not exist yet.\n"
        "   - After all necessary Sprints are created, proceed to create tasks: finish each task group completely (create a parent task, retrieve its returned ID, then immediately create all of its subtasks) before moving on to the next parent task group.\n"
        "   - Specifically: Create all Sprints first → then invoke `create_task` (with `sprint_id` from the created Sprint) for the first parent task → upon receiving the parent task's ID, call `create_subtask` for all of its subtasks → only after completing this group, move to the next parent task.\n"
        "7. When you are invoking tools to create or update tasks/subtasks, you MUST NOT output any text or explanatory messages during the tool execution turns (stay silent). Just execute the tools sequentially. Once all tool executions are fully completed, provide a final text response summarizing the results to the user.\n"
        "8. Never fabricate parent task IDs when creating or updating subtasks; only operate on subtasks when you know the exact ID.\n"
        "9. PREVENT DUPLICATE TITLES: Main task titles within the same project must not be duplicate, and subtask titles under the same main task must not be duplicate. If duplicates are found or already exist, warn the user or automatically adjust the title slightly to avoid collision.\n"
        "10. PRIORITY RULES (MUST BE STRICTLY FOLLOWED):\n"
        "    - Tasks (Task) use their own priority system with 3 Vietnamese levels: 'Bắt buộc', 'Quan trọng', 'Mở rộng'. The default is 'Quan trọng'. When calling `create_task` or `update_task`, you can pass 'Required', 'Important', 'Extended', or the corresponding Vietnamese text (the system maps it automatically).\n"
        "    - Missions (Subtask) DO NOT have a priority system. Never suggest, ask for, or display priority when creating or updating missions, and do not pass any priority argument to `create_subtask` or `update_subtask`.\n"
        "    - When proposing the task list to the user, ALWAYS display priority names in VIETNAMESE ('Bắt buộc', 'Quan trọng', 'Mở rộng') ONLY for Tasks. DO NOT show priority for missions.\n"
        "11. REQUIRED FIELDS RULES:\n"
        "    - Tasks (Task) require: title, priority, start_date, due_date, and sprint (specify which sprint to assign to, e.g., 'Sprint 1', 'Sprint 2', or 'Backlog'). Absolutely NO description field and NO status/board column (do not prompt the user for the board column or status, nor show it in the proposed list).\n"
        "    - Missions (Subtask) require: title, due_date, and assignee (specify which project member is assigned, e.g. 'Người thực hiện: Nguyễn Văn A' hoặc 'Người thực hiện: Chưa gán'). ABSOLUTELY NO priority field.\n"
        "    - You MUST suggest reasonable dates (and priorities only for Tasks) when listing proposals to the user, unless the user explicitly mentions they do not need dates or priorities. When planning task dates, you MUST call the tool `get_project_details` first to inspect the project's start date, due date, and member list, to ensure that the proposed dates for both tasks and missions fall strictly within the project's active date range, and that assignees are matched properly.\n"
        "12. When displaying proposed task lists or announcing results to the user, ALWAYS use the Vietnamese phrases 'công việc' instead of 'task'/'Task'/'công việc cha', and 'nhiệm vụ' instead of 'subtask'/'Subtask'. Never use these English terms in your response to the user.\n"
        "13. ABSOLUTELY NEVER DISPLAY OR MENTION the names of the technical tools or functions (such as `create_task`, `update_task`, `create_subtask`, `update_subtask`, `create_sprint`, `update_sprint`, `get_project_details`, `get_project_sprints`, etc.) in your text response to the user. Speak using natural Vietnamese descriptions instead.\n"
        "14. MEMBER ASSIGNMENT RULES (CRITICAL):\n"
        "    - The list of project members, their User IDs, and roles are retrieved by calling `get_project_details`.\n"
        "    - You MUST analyze the user's description of member skills, roles, or capabilities (provided in conversation or in attached documents) and automatically map subtasks to the most appropriate member based on their expertise.\n"
        "    - When proposing the list of subtasks (nhiệm vụ) to the user, you MUST explicitly include the proposed Assignee name (e.g. 'Người thực hiện: Nguyễn Văn A') for each subtask.\n"
        "    - When calling `create_subtask` or `update_subtask`, you MUST pass the matched member's User ID as `assignee_id`.\n"
        "15. You are provided with the tools `update_task` and `update_subtask` to modify existing main tasks and subtasks. Just like the creation process, when a user asks to edit task info or change task status/column/assignee, you must first propose the text modifications, and only execute the update tools after they confirm they agree.\n"
        "16. SPRINT & PRODUCT BACKLOG RULES:\n"
        "    - The project is divided into Sprints and a Product Backlog. You MUST call the tool `get_project_sprints` first whenever starting a planning or task creation query to see all available sprints in the current project (their names, IDs, and statuses). When proposing the list of tasks (công việc) to the user, you MUST explicitly include the proposed Sprint name (e.g. 'Sprint: Sprint 1' hoặc 'Sprint: Backlog') for each task.\n"
        "    - By default, if the user does not specify a sprint, suggest assigning to the Active Sprint of the project. If there is no active sprint, suggest Backlog.\n"
        "    - When the user asks to assign a task to a specific sprint (e.g., 'assign to Sprint 1'), use the sprint ID found via `get_project_sprints` and pass it as `sprint_id` when calling task tools.\n"
        "    - If the user wants to move a task to the Product Backlog (or out of a sprint), pass '00000000-0000-0000-0000-000000000000' as the `sprint_id`.\n"
        "    - NEVER assign tasks to a Closed sprint.\n"
        "17. SPRINT CREATION WORKFLOW (TWO-PHASE CONFIRMATION — HIGHEST PRIORITY RULE):\n"
        "    - You are provided with the tools `create_sprint` and `update_sprint` to create and modify Sprints.\n"
        "    - ABSOLUTE PROHIBITION: You MUST NEVER call `create_task` or `create_subtask` if the target Sprint does not already exist. If the plan includes Sprints that are not yet created, you MUST create them FIRST. Violating this rule causes tasks to be dumped into Product Backlog incorrectly and creates duplicate issues.\n"
        "    - When the user requests Sprint planning AND task creation together, you MUST follow a strict TWO-PHASE process:\n"
        "      Phase 1 — Sprint Creation: First, propose the list of Sprints (name, goal, start date, end date) as text. Wait for the user's explicit confirmation. Only then call `create_sprint` for each Sprint sequentially. You MUST capture and remember the returned Sprint IDs from each creation response.\n"
        "      Phase 2 — Task Creation: After ALL Sprints are created and you have their IDs, propose the list of tasks with Sprint assignments (using Sprint names). Wait for the user's explicit confirmation. Then call `create_task` with the correct `sprint_id` obtained from Phase 1 results.\n"
        "    - NEVER skip Phase 1 or merge both phases into a single confirmation step. The Sprint IDs from Phase 1 are REQUIRED to correctly assign tasks in Phase 2. If you create tasks without valid Sprint IDs, they will land in the Product Backlog and cause errors.\n"
        "    - If the user only asks to create Sprints (without tasks), only Phase 1 is needed.\n"
        "    - If the user asks to create tasks and suitable Sprints already exist (found via `get_project_sprints`), skip Phase 1 and go directly to task creation using the existing Sprint IDs.\n"
        "    - EXECUTION ORDER WHEN USER CONFIRMS: When the user says 'Đồng ý' or similar after seeing a combined plan of Sprints + Tasks, your execution order MUST be: (1) Create all Sprints first → (2) Collect all Sprint IDs → (3) Then create tasks with those Sprint IDs. NEVER reverse this order.\n"
        "18. SPRINT DATE RULES:\n"
        "    - You MUST call `get_project_details` first to get the project's start date and due date.\n"
        "    - Sprint start_date and end_date MUST fall within the project's date range (project start_date ≤ sprint start_date and sprint end_date ≤ project due_date).\n"
        "    - Sprint start_date MUST be before sprint end_date.\n"
        "    - Sprints SHOULD NOT overlap in their date ranges with each other. Divide the project timeline evenly among Sprints.\n"
        "    - Default Sprint duration is 2 weeks if the user does not specify a duration.\n"
        "19. SPRINT NAME RULES:\n"
        "    - Sprint names MUST be unique within the project (case-insensitive).\n"
        "    - If a Sprint with the same name already exists, suggest using the existing Sprint or propose a different name.\n"
        "20. SPRINT STATUS AWARENESS:\n"
        "    - Newly created Sprints always have status 'Tương lai' (Future). Inform the user they can activate (start) the Sprint from the Backlog view on the UI when ready. The AI CANNOT start or close Sprints.\n"
        "21. SPRINT GOAL:\n"
        "    - When proposing Sprints, always include a concise goal (mục tiêu) describing the scope of work for each Sprint, so the user understands what each Sprint covers.\n"
        "22. TASK QUERYING AND PROGRESS TRACKING:\n"
        "    - You are provided with the tool `get_project_tasks` to query and filter tasks/subtasks in the project.\n"
        "    - When a user asks about task assignments (e.g., 'What tasks am I assigned to?', 'What incomplete tasks does member A have?', 'Which tasks are approaching their due date?'), you MUST call `get_project_tasks` to inspect the project tasks.\n"
        "    - Make sure to pass the appropriate filter arguments (like `assignee_name`, `status_type`, `due_date_filter`) to limit the response and keep the context clean.\n"
        "    - For assignee queries, if the user asks 'What are my tasks?' ('tôi được giao việc gì'), you must first check the project member list using `get_project_details` to map their identity (or use their display name), and then call `get_project_tasks` with that `assignee_name`.\n"
        "    - Do not make assumptions about task due dates or assignees; always fetch real-time data using the tool first.\n"
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
        message_saver_callback: Any
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
        tools = [
            tools_provider.create_task,
            tools_provider.create_subtask,
            tools_provider.get_project_details,
            tools_provider.update_task,
            tools_provider.update_subtask,
            tools_provider.get_project_sprints,
            tools_provider.create_sprint,
            tools_provider.update_sprint,
            tools_provider.get_project_tasks
        ]

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
            response = await self.llm_router.generate_content_with_fallback(
                client=self.client,
                contents=gemini_contents,
                tools=tools,
                system_instruction=self.SYSTEM_INSTRUCTION
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
                    if tool_name == "create_task":
                        result_str = await tools_provider.create_task(**tool_args)
                    elif tool_name == "create_subtask":
                        result_str = await tools_provider.create_subtask(**tool_args)
                    elif tool_name == "get_project_details":
                        result_str = await tools_provider.get_project_details(**tool_args)
                    elif tool_name == "update_task":
                        result_str = await tools_provider.update_task(**tool_args)
                    elif tool_name == "update_subtask":
                        result_str = await tools_provider.update_subtask(**tool_args)
                    elif tool_name == "get_project_sprints":
                        result_str = await tools_provider.get_project_sprints(**tool_args)
                    elif tool_name == "create_sprint":
                        result_str = await tools_provider.create_sprint(**tool_args)
                    elif tool_name == "update_sprint":
                        result_str = await tools_provider.update_sprint(**tool_args)
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
