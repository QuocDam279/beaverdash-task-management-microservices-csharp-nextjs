import httpx
import logging
from uuid import UUID

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
        status: str = None,
        sprint_id: str = None
    ) -> str:
        """
        Tạo một công việc (Task) chính mới cho dự án hiện tại.

        Args:
            title: Tiêu đề công việc. Không được để trống.
            priority: Độ ưu tiên của công việc cha (CHỈ CHẤP NHẬN 3 giá trị tiếng Việt hoặc tiếng Anh tương ứng: Bắt buộc/Required, Quan trọng/Important, Mở rộng/Extended). Mặc định là 'Quan trọng'.
            start_date: Ngày bắt đầu công việc (Định dạng ISO 8601: YYYY-MM-DDTHH:MM:SSZ).
            due_date: Ngày hạn hoàn thành (Định dạng ISO 8601: YYYY-MM-DDTHH:MM:SSZ).
            status: Trạng thái/Cột muốn tạo công việc (ví dụ: 'Chưa thực hiện', 'Đang thực hiện', 'Hoàn thành').
            sprint_id: ID (UUID) của Sprint muốn gán công việc vào. Để đưa vào Product Backlog, hãy truyền chuỗi '00000000-0000-0000-0000-000000000000'. Nếu không truyền, hệ thống sẽ tự động gán vào Sprint đang hoạt động (Active Sprint) của dự án.
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
                
                if sprint_id is not None:
                    s_id = sprint_id.strip()
                    if not s_id or s_id.lower() == "backlog":
                        s_id = "00000000-0000-0000-0000-000000000000"
                    task_payload["SprintId"] = s_id
                
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

    async def get_project_details(self) -> str:
        """
        Lấy thông tin chi tiết của dự án hiện tại bao gồm: Tên dự án, mô tả, trạng thái, ngày bắt đầu, ngày kết thúc và các cột trạng thái hiện tại.
        """
        try:
            overview_url = f"{self.pm_base_url}/api/Projects/{self.project_id_str}/overview"
            async with httpx.AsyncClient() as client:
                logger.info(f"Fetching project overview from: {overview_url} with X-User-Id: {self.user_id_str}")
                response = await client.get(overview_url, headers=self.headers, timeout=10.0)
                
                if response.status_code != 200:
                    return f"Lỗi: Không lấy được thông tin chi tiết dự án (HTTP {response.status_code})."
                
                data = response.json()
                name = data.get("name")
                description = data.get("description") or "Không có mô tả"
                status = data.get("status") or "Chưa bắt đầu"
                start_date = data.get("startDate") or "Không xác định"
                due_date = data.get("dueDate") or "Không xác định"
                
                # Format column list
                cols = data.get("columnStatusCounts", [])
                cols_str = ", ".join([f"'{c.get('columnName')}'" for c in cols])
                
                res_str = (
                    f"Thông tin dự án:\n"
                    f"- Tên dự án: {name}\n"
                    f"- Mô tả: {description}\n"
                    f"- Trạng thái: {status}\n"
                    f"- Ngày bắt đầu: {start_date}\n"
                    f"- Ngày kết thúc/Hạn hoàn thành: {due_date}\n"
                    f"- Các cột trạng thái trong dự án: {cols_str}"
                )
                return res_str
        except Exception as ex:
            logger.exception("Error executing get_project_details tool")
            return f"Lỗi ngoại lệ khi lấy thông tin dự án: {str(ex)}"

    async def update_task(
        self,
        task_id: str,
        title: str = None,
        priority: str = None,
        start_date: str = None,
        due_date: str = None,
        status: str = None,
        sprint_id: str = None
    ) -> str:
        """
        Cập nhật thông tin của một công việc chính (Task) đã tồn tại.

        Args:
            task_id: ID (UUID) của công việc chính cần cập nhật.
            title: Tiêu đề mới của công việc.
            priority: Độ ưu tiên mới (CHỈ CHẤP NHẬN 3 giá trị tiếng Việt hoặc tiếng Anh tương ứng: Bắt buộc/Required, Quan trọng/Important, Mở rộng/Extended).
            start_date: Ngày bắt đầu mới (Định dạng ISO 8601: YYYY-MM-DDTHH:MM:SSZ).
            due_date: Ngày hạn hoàn thành mới (Định dạng ISO 8601: YYYY-MM-DDTHH:MM:SSZ).
            status: Trạng thái/Cột trạng thái mới muốn chuyển công việc tới (ví dụ: 'Chưa thực hiện', 'Đang thực hiện', 'Hoàn thành').
            sprint_id: ID (UUID) của Sprint mới muốn di chuyển công việc vào. Để di chuyển vào Backlog, truyền chuỗi '00000000-0000-0000-0000-000000000000'.
        """
        try:
            async with httpx.AsyncClient() as client:
                # 1. Handle status update (Move task to another column)
                if status:
                    status_normalized = status.strip().lower()
                    
                    # Fetch board columns to find target column id
                    board_url = f"{self.pm_base_url}/api/Projects/{self.project_id_str}/board"
                    board_response = await client.get(board_url, headers=self.headers, timeout=10.0)
                    if board_response.status_code == 200:
                        board_data = board_response.json()
                        columns = board_data.get("boardColumns", [])
                        
                        target_col = None
                        for col in columns:
                            if col.get("name", "").lower() == status_normalized:
                                target_col = col
                                break
                        
                        if target_col:
                            column_id = target_col.get("id")
                            column_name = target_col.get("name")
                            # Count tasks in target column to decide SortOrder
                            new_sort_order = len(target_col.get("taskItems", [])) + 1
                            
                            move_url = f"{self.pm_base_url}/api/Tasks/{task_id}/move"
                            move_payload = {
                                "NewBoardColumnId": column_id,
                                "NewSortOrder": float(new_sort_order)
                            }
                            logger.info(f"Moving task {task_id} to column {column_name} (ID: {column_id})")
                            move_response = await client.put(move_url, json=move_payload, headers=self.headers, timeout=10.0)
                            if move_response.status_code not in [200, 204]:
                                return f"Lỗi: Không thể di chuyển công việc sang cột trạng thái '{status}' (HTTP {move_response.status_code})."
                        else:
                            return f"Lỗi: Không tìm thấy cột trạng thái '{status}' trong dự án hiện tại."
                    else:
                         return f"Lỗi: Không lấy được danh sách cột để cập nhật trạng thái (HTTP {board_response.status_code})."

                # 1.5. Handle sprint_id update (Move task to another sprint or backlog)
                if sprint_id is not None:
                    target_sprint_id = sprint_id.strip()
                    if not target_sprint_id or target_sprint_id.lower() == "backlog" or target_sprint_id == "00000000-0000-0000-0000-000000000000":
                        target_sprint_id = None
                    
                    move_sprint_payload = {
                        "TaskIds": [task_id],
                        "SprintId": target_sprint_id,
                        "ProjectId": self.project_id_str
                    }
                    move_sprint_url = f"{self.pm_base_url}/api/Sprints/move-tasks"
                    logger.info(f"Moving task {task_id} to sprint {target_sprint_id}")
                    move_response = await client.post(move_sprint_url, json=move_sprint_payload, headers=self.headers, timeout=10.0)
                    if move_response.status_code not in [200, 204]:
                        return f"Lỗi từ ProjectManagement Service khi di chuyển công việc sang Sprint mới: {move_response.status_code} - {move_response.text}"

                # 2. Map priority if provided
                mapped_priority = None
                if priority:
                    p_lower = priority.strip().lower()
                    if p_lower in ["bắt buộc", "bat buoc", "required"]:
                        mapped_priority = "Required"
                    elif p_lower in ["quan trọng", "quan trong", "important"]:
                        mapped_priority = "Important"
                    elif p_lower in ["mở rộng", "mo rong", "extended"]:
                        mapped_priority = "Extended"

                # 3. Handle detailed field updates (Title, Priority, StartDate, DueDate)
                patch_payload = {}
                if title is not None:
                    patch_payload["Title"] = title
                if mapped_priority is not None:
                    patch_payload["Priority"] = mapped_priority
                if start_date is not None:
                    patch_payload["StartDate"] = start_date
                if due_date is not None:
                    patch_payload["DueDate"] = due_date

                # If there are fields to update, call the PATCH API
                if patch_payload:
                    patch_url = f"{self.pm_base_url}/api/Tasks/{task_id}"
                    logger.info(f"Updating task details via PM Service: {patch_url} with payload: {patch_payload}")
                    response = await client.patch(patch_url, json=patch_payload, headers=self.headers, timeout=10.0)
                    if response.status_code not in [200, 204]:
                        return f"Lỗi từ ProjectManagement Service khi cập nhật chi tiết công việc: {response.status_code} - {response.text}"

                return f"Thành công: Đã cập nhật công việc chính (ID: {task_id})."
        except Exception as ex:
            logger.exception("Error executing update_task tool")
            return f"Lỗi ngoại lệ khi cập nhật công việc chính: {str(ex)}"

    async def update_subtask(
        self,
        subtask_id: str,
        title: str = None,
        priority: str = None,
        due_date: str = None,
        completed: bool = None
    ) -> str:
        """
        Cập nhật thông tin của một công việc con (Subtask) đã tồn tại.

        Args:
            subtask_id: ID (UUID) của công việc con cần cập nhật.
            title: Tiêu đề mới của công việc con.
            priority: Độ ưu tiên mới (CHỈ CHẤP NHẬN 3 giá trị tiếng Việt hoặc tiếng Anh tương ứng: Thấp/Low, Trung bình/Medium, Cao/High).
            due_date: Hạn hoàn thành mới (Định dạng ISO 8601: YYYY-MM-DDTHH:MM:SSZ).
            completed: Trạng thái hoàn thành (True nếu đã hoàn thành, False nếu chưa).
        """
        try:
            # 1. Fetch current board to get subtask's current state as fallback (required fields in DTO)
            board_url = f"{self.pm_base_url}/api/Projects/{self.project_id_str}/board"
            async with httpx.AsyncClient() as client:
                board_response = await client.get(board_url, headers=self.headers, timeout=10.0)
                if board_response.status_code != 200:
                    return f"Lỗi: Không thể lấy dữ liệu bảng để định cấu hình fallback cho công việc con (HTTP {board_response.status_code})."
                
                board_data = board_response.json()
                columns = board_data.get("boardColumns", [])
                
                target_subtask = None
                for col in columns:
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
                    return f"Lỗi: Không tìm thấy công việc con với ID '{subtask_id}' trong dự án."

                # Get fallback values from existing subtask
                current_title = target_subtask.get("title")
                current_completed = target_subtask.get("isCompleted", False)
                current_due_date = target_subtask.get("dueDate")
                current_priority = target_subtask.get("priority")
                current_assignee = target_subtask.get("assigneeUserId")

                # Map priority if provided
                mapped_priority = None
                if priority is not None:
                    p_lower = priority.strip().lower()
                    if p_lower in ["thấp", "thap", "low"]:
                        mapped_priority = "Low"
                    elif p_lower in ["trung bình", "trung binh", "medium"]:
                        mapped_priority = "Medium"
                    elif p_lower in ["cao", "high"]:
                        mapped_priority = "High"
                else:
                    mapped_priority = current_priority

                # Use fallbacks if parameters are not provided
                final_title = title if title is not None else current_title
                final_completed = completed if completed is not None else current_completed
                final_due_date = due_date if due_date is not None else current_due_date

                # Build PATCH payload
                patch_payload = {
                    "Title": final_title,
                    "AssigneeUserId": current_assignee, # Keep current assignee
                    "DueDate": final_due_date,
                    "IsCompleted": final_completed,
                    "Priority": mapped_priority
                }

                patch_url = f"{self.pm_base_url}/api/SubTasks/{subtask_id}"
                logger.info(f"Updating subtask details via PM Service: {patch_url} with payload: {patch_payload}")
                response = await client.patch(patch_url, json=patch_payload, headers=self.headers, timeout=10.0)
                
                if response.status_code in [200, 204]:
                    return f"Thành công: Đã cập nhật công việc con '{final_title}' (ID: {subtask_id})."
                else:
                    return f"Lỗi từ ProjectManagement Service: {response.status_code} - {response.text}"

        except Exception as ex:
            logger.exception("Error executing update_subtask tool")
            return f"Lỗi ngoại lệ khi cập nhật công việc con: {str(ex)}"

    async def get_project_sprints(self) -> str:
        """
        Lấy danh sách tất cả các Sprint trong dự án hiện tại bao gồm tên, ID và trạng thái của từng Sprint (Active/Đang hoạt động, Future/Tương lai, Closed/Đã đóng).
        Dùng công cụ này để biết các Sprint hiện có để gán công việc vào hoặc xem thông tin các Sprint của dự án.
        """
        try:
            board_url = f"{self.pm_base_url}/api/Projects/{self.project_id_str}/board"
            async with httpx.AsyncClient() as client:
                logger.info(f"Fetching board for sprints list from: {board_url} with X-User-Id: {self.user_id_str}")
                response = await client.get(board_url, headers=self.headers, timeout=10.0)
                
                if response.status_code != 200:
                    return f"Lỗi: Không lấy được danh sách Sprint của dự án (HTTP {response.status_code})."
                
                board_data = response.json()
                sprints = board_data.get("sprints", [])
                
                if not sprints:
                    return "Dự án hiện tại chưa có Sprint nào được tạo."
                
                res_lines = ["Danh sách Sprint trong dự án:"]
                for s in sprints:
                    status_raw = s.get("status")
                    if status_raw == "Active":
                        status_vi = "Đang hoạt động (Active)"
                    elif status_raw == "Future":
                        status_vi = "Tương lai (Future)"
                    elif status_raw == "Closed":
                        status_vi = "Đã đóng (Closed)"
                    else:
                        status_vi = status_raw
                    
                    res_lines.append(f"- Tên Sprint: '{s.get('name')}' | ID: {s.get('id')} | Trạng thái: {status_vi}")
                
                return "\n".join(res_lines)
        except Exception as ex:
            logger.exception("Error executing get_project_sprints tool")
            return f"Lỗi ngoại lệ khi lấy danh sách Sprint: {str(ex)}"


