import uuid
import httpx
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

# =============================================================================
# AI Agent Tool Definitions
# =============================================================================

TOOL_DEFINITIONS = [
    {
        "type": "function",
        "function": {
            "name": "create_task",
            "description": "Tạo một Task mới kèm theo danh sách các công việc con (subtasks) trên Kanban Board của dự án. Dùng khi người dùng đồng ý tạo công việc mới.",
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
                        "description": "Hạn chót hoàn thành của task (ISO 8601 format, ví dụ: 2025-12-31T23:59:59Z)."
                    },
                    "start_date": {
                        "type": "string",
                        "description": "Ngày bắt đầu của task (ISO 8601 format, ví dụ: 2025-12-01T00:00:00Z)."
                    },
                    "subtasks": {
                        "type": "array",
                        "description": "Danh sách các subtasks (công việc con) thuộc về task này (tùy chọn). Có thể để trống hoặc không gửi nếu người dùng không yêu cầu subtasks.",
                        "items": {
                            "type": "object",
                            "properties": {
                                "title": {
                                    "type": "string",
                                    "description": "Tiêu đề của subtask."
                                },
                                "assignee_name": {
                                    "type": "string",
                                    "description": "Tên hiển thị của thành viên được phân công (ví dụ: 'Nguyễn Văn A'). Để trống hoặc ghi 'Chưa phân công' nếu chưa giao."
                                },
                                "due_date": {
                                    "type": "string",
                                    "description": "Hạn hoàn thành của subtask (ISO 8601 format, ví dụ: 2025-12-31T23:59:59Z)."
                                }
                            },
                            "required": ["title"]
                        }
                    }
                },
                "required": ["board_column_id", "title"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "create_subtask",
            "description": "Tạo một công việc con (subtask) mới dưới một Task cha đã tồn tại.",
            "parameters": {
                "type": "object",
                "properties": {
                    "task_id": {
                        "type": "string",
                        "description": "UUID của task cha."
                    },
                    "title": {
                        "type": "string",
                        "description": "Tiêu đề của subtask."
                    },
                    "assignee_name": {
                        "type": "string",
                        "description": "Tên hiển thị của thành viên được phân công (ví dụ: 'Nguyễn Văn A')."
                    },
                    "due_date": {
                        "type": "string",
                        "description": "Hạn hoàn thành của subtask (ISO 8601 format)."
                    }
                },
                "required": ["task_id", "title"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "assign_subtask",
            "description": "Phân công người phụ trách (assignee) cho một công việc con (subtask) đã tồn tại.",
            "parameters": {
                "type": "object",
                "properties": {
                    "subtask_id": {
                        "type": "string",
                        "description": "UUID của subtask."
                    },
                    "assignee_name": {
                        "type": "string",
                        "description": "Tên hiển thị của thành viên dự án được phân công."
                    }
                },
                "required": ["subtask_id", "assignee_name"]
            }
        }
    }
]


async def execute_tool(tool_name: str, arguments: dict, user_id: uuid.UUID, project_id: uuid.UUID) -> dict:
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
                    "dueDate": arguments.get("due_date"),
                    "startDate": arguments.get("start_date")
                }
                resp = await client.post(f"{base_url}/api/tasks", json=payload, headers=headers)
                resp.raise_for_status()
                task_data = resp.json()
                task_id = task_data.get("id") or task_data.get("Id")

                subtasks_created = []
                subtasks = arguments.get("subtasks", [])
                if subtasks and task_id:
                    # Lấy danh sách thành viên dự án để giải quyết tên
                    members = []
                    try:
                        resp_overview = await client.get(f"{base_url}/api/projects/{project_id}/overview", headers=headers)
                        if resp_overview.status_code == 200:
                            members = resp_overview.json().get("memberWorkloads", [])
                    except Exception as e:
                        logger.error(f"Lỗi khi lấy danh sách thành viên trong create_task: {e}")

                    for st in subtasks:
                        st_title = st.get("title")
                        if not st_title:
                            continue
                        st_assignee_name = st.get("assignee_name")
                        st_due_date = st.get("due_date")

                        st_assignee_id = None
                        if st_assignee_name and st_assignee_name.strip() and st_assignee_name.lower() != "chưa phân công":
                            for m in members:
                                if st_assignee_name.lower() in m["displayName"].lower() or m["displayName"].lower() in st_assignee_name.lower():
                                    st_assignee_id = m["userId"]
                                    break

                        st_payload = {
                            "taskId": task_id,
                            "title": st_title,
                            "assigneeUserId": st_assignee_id,
                            "dueDate": st_due_date
                        }
                        try:
                            resp_st = await client.post(f"{base_url}/api/subtasks", json=st_payload, headers=headers)
                            resp_st.raise_for_status()
                            subtasks_created.append(resp_st.json())
                        except Exception as e:
                            logger.error(f"Lỗi khi tạo subtask '{st_title}': {e}")

                return {
                    "success": True, 
                    "data": {
                        "task": task_data,
                        "subtasks": subtasks_created
                    }
                }

            elif tool_name == "create_subtask":
                task_id = arguments["task_id"]
                title = arguments["title"]
                assignee_name = arguments.get("assignee_name")
                due_date = arguments.get("due_date")

                assignee_user_id = None
                if assignee_name and assignee_name.strip() and assignee_name.lower() != "chưa phân công":
                    resp_overview = await client.get(f"{base_url}/api/projects/{project_id}/overview", headers=headers)
                    resp_overview.raise_for_status()
                    overview_data = resp_overview.json()
                    members = overview_data.get("memberWorkloads", [])

                    for m in members:
                        if assignee_name.lower() in m["displayName"].lower() or m["displayName"].lower() in assignee_name.lower():
                            assignee_user_id = m["userId"]
                            break

                    if not assignee_user_id:
                        return {"success": False, "error": f"Không tìm thấy thành viên '{assignee_name}' trong dự án."}

                payload = {
                    "taskId": task_id,
                    "title": title,
                    "assigneeUserId": assignee_user_id,
                    "dueDate": due_date
                }
                resp = await client.post(f"{base_url}/api/subtasks", json=payload, headers=headers)
                resp.raise_for_status()
                return {"success": True, "data": resp.json()}

            elif tool_name == "assign_subtask":
                subtask_id = arguments["subtask_id"]
                assignee_name = arguments["assignee_name"]

                # 1. Tìm subtask trong board để lấy title, isCompleted, dueDate
                resp_board = await client.get(f"{base_url}/api/projects/{project_id}/board", headers=headers)
                resp_board.raise_for_status()
                board_data = resp_board.json()

                target_subtask = None
                for col in board_data.get("boardColumns", []):
                    for task in col.get("taskItems", []):
                        for st in task.get("subTasks", []):
                            if st.get("id") == subtask_id:
                                target_subtask = st
                                break
                        if target_subtask:
                            break
                    if target_subtask:
                        break

                if not target_subtask:
                    return {"success": False, "error": f"Không tìm thấy subtask với ID: {subtask_id}"}

                # 2. Tìm assignee_user_id từ assignee_name
                assignee_user_id = None
                if assignee_name and assignee_name.strip() and assignee_name.lower() != "chưa phân công":
                    resp_overview = await client.get(f"{base_url}/api/projects/{project_id}/overview", headers=headers)
                    resp_overview.raise_for_status()
                    overview_data = resp_overview.json()
                    members = overview_data.get("memberWorkloads", [])

                    for m in members:
                        if assignee_name.lower() in m["displayName"].lower() or m["displayName"].lower() in assignee_name.lower():
                            assignee_user_id = m["userId"]
                            break

                    if not assignee_user_id:
                        return {"success": False, "error": f"Không tìm thấy thành viên '{assignee_name}' trong dự án."}

                # 3. Cập nhật subtask
                payload = {
                    "title": target_subtask["title"],
                    "isCompleted": target_subtask["isCompleted"],
                    "assigneeUserId": assignee_user_id,
                    "dueDate": target_subtask.get("dueDate")
                }
                resp = await client.patch(f"{base_url}/api/subtasks/{subtask_id}", json=payload, headers=headers)
                resp.raise_for_status()
                return {"success": True, "data": {"subtask_id": subtask_id, "assignee_name": assignee_name, "assignee_user_id": assignee_user_id}}

            else:
                return {"success": False, "error": f"Tool không xác định: {tool_name}"}

        except httpx.HTTPStatusError as e:
            return {"success": False, "error": f"HTTP {e.response.status_code}: {e.response.text}"}
        except Exception as e:
            return {"success": False, "error": str(e)}
