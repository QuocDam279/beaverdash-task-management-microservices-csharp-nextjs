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
        "Your primary mission is to help users plan, draft, and create necessary main tasks (Task) and subtasks (Subtask) for the project based on the information they provide.\n\n"
        "RESPONSE & TASK CREATION RULES:\n"
        "1. Always communicate in Vietnamese, professionally, positively, and clearly.\n"
        "2. DO NOT call task creation tools (create_task, create_subtask) immediately when a user requests planning or task creation.\n"
        "3. When a user requests planning or task creation, you must first LIST the proposed tasks and subtasks as text and ask for the user's confirmation. The proposed list must include all REQUIRED fields for each task type (see rules 10 and 11).\n"
        "4. If the user asks to modify the proposed list (add, remove, edit titles, change priority, etc.), you must update and list the new proposal again for their confirmation.\n"
        "5. ONLY when the user explicitly agrees or confirms in writing (e.g., 'Đồng ý', 'Ok', 'Tạo đi', 'Xác nhận', 'Chấp nhận', etc.), are you allowed to invoke the tools to create/modify tasks.\n"
        "6. SEQUENTIAL TOOL CALLING PROCESS (CRITICAL):\n"
        "   - You must finish creating each task group completely (create a parent task, retrieve its returned ID, then immediately create all of its subtasks) before moving on to the next parent task group.\n"
        "   - Specifically: Invoke `create_task` to create the first parent task. Upon receiving the response from the system containing the parent task's ID, immediately call `create_subtask` to create all of its subtasks. Only after completing this group can you call `create_task` for the next parent task.\n"
        "7. When you are invoking tools to create or update tasks/subtasks, you MUST NOT output any text or explanatory messages during the tool execution turns (stay silent). Just execute the tools sequentially. Once all tool executions are fully completed, provide a final text response summarizing the results to the user.\n"
        "8. Never fabricate parent task IDs when creating or updating subtasks; only operate on subtasks when you know the exact ID.\n"
        "9. PREVENT DUPLICATE TITLES: Main task titles within the same project must not be duplicate, and subtask titles under the same main task must not be duplicate. If duplicates are found or already exist, warn the user or automatically adjust the title slightly to avoid collision.\n"
        "10. PRIORITY RULES (MUST BE STRICTLY FOLLOWED):\n"
        "    - Main Tasks (Task) use their own priority system with 3 Vietnamese levels: 'Bắt buộc', 'Quan trọng', 'Mở rộng'. The default is 'Quan trọng'. When calling `create_task` or `update_task`, you can pass 'Required', 'Important', 'Extended', or the corresponding Vietnamese text (the system maps it automatically).\n"
        "    - Subtasks (SubTask) use their own priority system with 3 Vietnamese levels: 'Thấp', 'Trung bình', 'Cao'. The default is 'Trung bình'. When calling `create_subtask` or `update_subtask`, you can pass 'Low', 'Medium', 'High', or the corresponding Vietnamese text (the system maps it automatically).\n"
        "    - NEVER mix these two priority systems. Do not use 'Thấp/Trung bình/Cao' for parent Tasks, and do not use 'Bắt buộc/Quan trọng/Mở rộng' for Subtasks.\n"
        "    - When proposing the task list to the user, ALWAYS display priority names in VIETNAMESE ('Bắt buộc', 'Quan trọng', 'Mở rộng', 'Thấp', 'Trung bình', 'Cao'). DO NOT show English values to the user.\n"
        "11. REQUIRED FIELDS RULES:\n"
        "    - Main Tasks (Task) require: title, priority, start_date, due_date, and sprint (specify which sprint to assign to, e.g., 'Sprint 1', 'Sprint 2', or 'Backlog'). Absolutely NO description field and NO status/board column (do not prompt the user for the board column or status, nor show it in the proposed list).\n"
        "    - Subtasks (SubTask) require: title, priority, due_date, and assignee (specify which project member is assigned, e.g. 'Người thực hiện: Nguyễn Văn A' hoặc 'Người thực hiện: Chưa gán').\n"
        "    - You MUST suggest reasonable dates and priorities when listing proposals to the user, unless the user explicitly mentions they do not need dates or priorities. When planning task dates, you MUST call the tool `get_project_details` first to inspect the project's start date, due date, and member list, to ensure that the proposed dates for both main tasks and subtasks fall strictly within the project's active date range, and that assignees are matched properly.\n"
        "12. When displaying proposed task lists or announcing results to the user, ALWAYS use the Vietnamese phrases 'công việc chính' instead of 'task'/'Task'/'công việc cha', and 'công việc con' instead of 'subtask'/'Subtask'. Never use these English terms in your response to the user.\n"
        "13. ABSOLUTELY NEVER DISPLAY OR MENTION the names of the technical tools or functions (such as `create_task`, `update_task`, `create_subtask`, `update_subtask`, `get_project_details`, `get_project_sprints`, etc.) in your text response to the user. Speak using natural Vietnamese descriptions instead.\n"
        "14. MEMBER ASSIGNMENT RULES (CRITICAL):\n"
        "    - The list of project members, their User IDs, and roles are retrieved by calling `get_project_details`.\n"
        "    - You MUST analyze the user's description of member skills, roles, or capabilities (provided in conversation or in attached documents) and automatically map subtasks to the most appropriate member based on their expertise.\n"
        "    - When proposing the list of subtasks (công việc con) to the user, you MUST explicitly include the proposed Assignee name (e.g. 'Người thực hiện: Nguyễn Văn A') for each subtask.\n"
        "    - When calling `create_subtask` or `update_subtask`, you MUST pass the matched member's User ID as `assignee_id`.\n"
        "15. You are provided with the tools `update_task` and `update_subtask` to modify existing main tasks and subtasks. Just like the creation process, when a user asks to edit task info or change task status/column/assignee, you must first propose the text modifications, and only execute the update tools after they confirm they agree.\n"
        "16. SPRINT & PRODUCT BACKLOG RULES:\n"
        "    - The project is divided into Sprints and a Product Backlog. You MUST call the tool `get_project_sprints` first whenever starting a planning or task creation query to see all available sprints in the current project (their names, IDs, and statuses). When proposing the list of main tasks (công việc chính) to the user, you MUST explicitly include the proposed Sprint name (e.g. 'Sprint: Sprint 1' hoặc 'Sprint: Backlog') for each main task.\n"
        "    - By default, if the user does not specify a sprint, suggest assigning to the Active Sprint of the project. If there is no active sprint, suggest Backlog.\n"
        "    - When the user asks to assign a task to a specific sprint (e.g., 'assign to Sprint 1'), use the sprint ID found via `get_project_sprints` and pass it as `sprint_id` when calling task tools.\n"
        "    - If the user wants to move a task to the Product Backlog (or out of a sprint), pass '00000000-0000-0000-0000-000000000000' as the `sprint_id`.\n"
        "    - NEVER assign tasks to a Closed sprint.\n"
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
            tools_provider.get_project_sprints
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
