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
