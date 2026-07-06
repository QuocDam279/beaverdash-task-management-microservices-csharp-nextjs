import httpx
import logging
import time
from uuid import UUID
from datetime import datetime, timezone, timedelta

logger = logging.getLogger(__name__)


class AIAssistantTools:
    """
    Python functions that act as tools for the Gemini model.
    The docstrings and type annotations will be inspected by the SDK to generate JSON schemas.
    """

    PRIORITY_MAP = {
        "bắt buộc": "Required", "bat buoc": "Required", "required": "Required",
        "quan trọng": "Important", "quan trong": "Important", "important": "Important",
        "mở rộng": "Extended", "mo rong": "Extended", "extended": "Extended",
    }

    def __init__(self, pm_base_url: str, user_id: UUID, project_id: UUID):
        self.pm_base_url = pm_base_url
        self.user_id_str = str(user_id)
        self.project_id_str = str(project_id)
        self.headers = {
            "X-User-Id": self.user_id_str,
            "Content-Type": "application/json"
        }
        self.client = httpx.AsyncClient(
            base_url=pm_base_url,
            headers=self.headers,
            timeout=httpx.Timeout(15.0, connect=5.0)
        )
        # Board data cache
        self._board_cache = None
        self._board_cache_time = 0.0
        self._board_cache_ttl = 10.0  # seconds

    def __deepcopy__(self, memo):
        cls = self.__class__
        result = cls.__new__(cls)
        memo[id(self)] = result
        result.pm_base_url = self.pm_base_url
        result.user_id_str = self.user_id_str
        result.project_id_str = self.project_id_str
        result.headers = self.headers.copy() if self.headers else None
        result.client = self.client
        result._board_cache = self._board_cache
        result._board_cache_time = self._board_cache_time
        result._board_cache_ttl = self._board_cache_ttl
        return result

    def __getstate__(self):
        state = self.__dict__.copy()
        state.pop("client", None)
        return state

    def __setstate__(self, state):
        self.__dict__.update(state)
        self.client = httpx.AsyncClient(
            base_url=self.pm_base_url,
            headers=self.headers,
            timeout=httpx.Timeout(15.0, connect=5.0)
        )

    async def close(self):
        """Close the shared HTTP client."""
        await self.client.aclose()

    async def __aenter__(self):
        return self

    async def __aexit__(self, *args):
        await self.close()

    # ── Private helper methods (not exposed as tools) ──────────────────

    async def _get_board_data(self):
        """Fetch board data with caching. Returns cached data if within TTL, otherwise fetches fresh."""
        now = time.monotonic()
        if self._board_cache is not None and (now - self._board_cache_time) < self._board_cache_ttl:
            return self._board_cache

        url = f"/api/Projects/{self.project_id_str}/board"
        logger.info(f"Fetching board data from: {url} with X-User-Id: {self.user_id_str}")
        response = await self.client.get(url)
        if response.status_code != 200:
            logger.warning(f"Failed to fetch board data: HTTP {response.status_code}")
            return None

        self._board_cache = response.json()
        self._board_cache_time = now
        return self._board_cache

    def _invalidate_board_cache(self):
        """Clear board cache after write operations that modify board state."""
        self._board_cache = None

    def _map_priority(self, priority):
        """Map Vietnamese/English priority string to backend enum value."""
        if not priority:
            return "Important"
        return self.PRIORITY_MAP.get(priority.strip().lower(), "Important")

    def _parse_datetime(self, dt_str):
        """Parse ISO 8601 datetime string to timezone-aware UTC datetime."""
        if not dt_str:
            return None
        try:
            # Strip fractional seconds (e.g., .1234567)
            clean = dt_str.split(".")[0]
            # Strip trailing Z
            if clean.endswith("Z"):
                clean = clean[:-1]
            # Normalize separator
            if "T" not in clean and " " in clean:
                clean = clean.replace(" ", "T", 1)
            # Parse and attach UTC timezone
            dt = datetime.strptime(clean, "%Y-%m-%dT%H:%M:%S")
            return dt.replace(tzinfo=timezone.utc)
        except (ValueError, AttributeError):
            return None

    def _format_local_date(self, dt_str: str) -> str:
        """Parse ISO 8601 UTC datetime string and convert it to UTC+7 timezone-aware formatted date (YYYY-MM-DD)."""
        if not dt_str:
            return "Không xác định"
        dt = self._parse_datetime(dt_str)
        if not dt:
            # Fallback if parsing fails
            return dt_str[:10] if len(dt_str) >= 10 else dt_str
        # Convert UTC to UTC+7
        dt_local = dt + timedelta(hours=7)
        return dt_local.strftime("%Y-%m-%d")

    # ── Tool methods (exposed to Gemini) ───────────────────────────────

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
        Tạo một công việc mới cho dự án hiện tại.

        Args:
            title: Tiêu đề công việc. Không được để trống.
            priority: Độ ưu tiên của công việc (CHỈ CHẤP NHẬN 3 giá trị tiếng Việt hoặc tiếng Anh tương ứng: Bắt buộc/Required, Quan trọng/Important, Mở rộng/Extended). Mặc định là 'Quan trọng'.
            start_date: Ngày bắt đầu công việc (Định dạng ISO 8601: YYYY-MM-DDTHH:MM:SSZ).
            due_date: Ngày hạn hoàn thành (Định dạng ISO 8601: YYYY-MM-DDTHH:MM:SSZ).
            status: Trạng thái/Cột muốn tạo công việc (ví dụ: 'Chưa thực hiện', 'Đang thực hiện', 'Hoàn thành').
            sprint_id: ID (UUID) của Sprint muốn gán công việc vào. Để đưa vào Product Backlog, hãy truyền chuỗi '00000000-0000-0000-0000-000000000000'. Nếu không truyền, hệ thống sẽ tự động gán vào Sprint đang hoạt động (Active Sprint) của dự án.
        """
        try:
            mapped_priority = self._map_priority(priority)

            # Fetch board data (cached) for duplicate check and column lookup
            board_data = await self._get_board_data()
            if board_data is None:
                return "Lỗi: Không lấy được thông tin cột của dự án."

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

            # Build payload and create task
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

            logger.info(f"Creating task via PM Service with payload: {task_payload}")
            response = await self.client.post("/api/Tasks", json=task_payload)

            if response.status_code == 201:
                result = response.json()
                task_id = result.get("id")
                self._invalidate_board_cache()
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
        due_date: str = None,
        assignee_id: str = None
    ) -> str:
        """
        Tạo một nhiệm vụ cho một công việc đã tồn tại.

        Args:
            task_id: ID (UUID) của công việc.
            title: Tiêu đề nhiệm vụ. Không được để trống.
            due_date: Hạn hoàn thành của nhiệm vụ (Định dạng ISO 8601: YYYY-MM-DDTHH:MM:SSZ).
            assignee_id: ID (UUID) của thành viên dự án được phân công thực hiện nhiệm vụ này. Nếu không phân công ai, hãy để trống hoặc truyền None.
        """
        try:
            # Check for duplicate subtask title under the same parent task (cached)
            board_data = await self._get_board_data()
            if board_data is not None:
                columns = board_data.get("boardColumns", [])
                for col in columns:
                    for task in col.get("taskItems", []):
                        if task.get("id") == task_id:
                            for st in task.get("subTasks", []):
                                if st.get("title", "").strip().lower() == title.strip().lower():
                                    subtask_id = st.get("id")
                                    return f"Thành công: Nhiệm vụ '{title}' đã tồn tại dưới công việc '{task.get('title')}' này (ID: {subtask_id}). Không cần tạo lại."

            # Create the subtask
            subtask_payload = {
                "TaskId": task_id,
                "Title": title,
                "DueDate": due_date
            }

            if assignee_id:
                subtask_payload["AssigneeUserId"] = assignee_id.strip()

            logger.info(f"Creating subtask via PM Service with payload: {subtask_payload}")
            response = await self.client.post("/api/SubTasks", json=subtask_payload)

            if response.status_code == 201:
                result = response.json()
                subtask_id = result.get("id")
                self._invalidate_board_cache()
                return f"Thành công: Đã tạo nhiệm vụ '{title}' (ID: {subtask_id}) cho công việc '{task_id}'."
            else:
                error_detail = response.text
                return f"Lỗi từ ProjectManagement Service: {response.status_code} - {error_detail}"

        except Exception as ex:
            logger.exception("Error executing create_subtask tool")
            return f"Lỗi ngoại lệ khi tạo nhiệm vụ: {str(ex)}"

    async def get_project_details(self) -> str:
        """
        Lấy thông tin chi tiết và tổng hợp (Overview) của dự án hiện tại bao gồm: Tên dự án, mô tả, ngày bắt đầu, ngày kết thúc, thống kê tiến độ các công việc/nhiệm vụ con, và chi tiết khối lượng công việc của từng thành viên.
        """
        try:
            overview_url = f"/api/Projects/{self.project_id_str}/overview"
            logger.info(f"Fetching project overview from: {overview_url} with X-User-Id: {self.user_id_str}")
            response = await self.client.get(overview_url)

            if response.status_code != 200:
                return f"Lỗi: Không lấy được thông tin chi tiết dự án (HTTP {response.status_code})."

            data = response.json()
            name = data.get("name")
            description = data.get("description") or "Không có mô tả"
            start_date = self._format_local_date(data.get("startDate")) if data.get("startDate") else "Không xác định"
            due_date = self._format_local_date(data.get("dueDate")) if data.get("dueDate") else "Không xác định"

            # Extract metrics (7 days)
            new_tasks = data.get("newTasksCount", 0)
            new_st_total = data.get("newTasksSubTasksTotal", 0)
            new_st_done = data.get("newTasksSubTasksDone", 0)

            completed_tasks = data.get("completedTasksCount", 0)
            completed_st_total = data.get("completedTasksSubTasksTotal", 0)
            completed_st_done = data.get("completedTasksSubTasksDone", 0)

            upcoming_tasks = data.get("upcomingDueTasksCount", 0)
            upcoming_st_total = data.get("upcomingDueTasksSubTasksTotal", 0)
            upcoming_st_done = data.get("upcomingDueTasksSubTasksDone", 0)

            # Subtask status counts
            todo_st = data.get("todoSubTasksCount", 0)
            inprogress_st = data.get("inProgressSubTasksCount", 0)
            done_st = data.get("doneSubTasksCount", 0)

            # Format project member workloads list
            members = data.get("memberWorkloads", [])
            member_lines = []
            for m in members:
                member_lines.append(
                    f"- Tên: {m.get('displayName')} | Vai trò: {m.get('role')} | "
                    f"ID người dùng: {m.get('userId')} | "
                    f"Nhiệm vụ được giao: {m.get('assignedTasksCount')} | "
                    f"Tỷ lệ khối lượng công việc: {m.get('workloadPercentage')}%"
                )
            members_str = "\n".join(member_lines) if member_lines else "Không có thành viên"

            res_str = (
                f"Thông tin dự án:\n"
                f"- Tên dự án: {name}\n"
                f"- Mô tả: {description}\n"
                f"- Ngày bắt đầu: {start_date}\n"
                f"- Ngày kết thúc/Hạn hoàn thành: {due_date}\n\n"
                f"Thống kê công việc trong 7 ngày qua:\n"
                f"- Mới tạo: {new_tasks} công việc (chứa {new_st_done}/{new_st_total} nhiệm vụ đã hoàn thành)\n"
                f"- Đã hoàn thành: {completed_tasks} công việc (chứa {completed_st_done}/{completed_st_total} nhiệm vụ đã hoàn thành)\n"
                f"- Sắp đến hạn (7 ngày tới): {upcoming_tasks} công việc (chứa {upcoming_st_done}/{upcoming_st_total} nhiệm vụ đã hoàn thành)\n\n"
                f"Thống kê nhiệm vụ hiện tại:\n"
                f"- Cần làm (Todo): {todo_st}\n"
                f"- Đang thực hiện (In Progress): {inprogress_st}\n"
                f"- Đã hoàn thành (Done): {done_st}\n\n"
                f"Danh sách thành viên & Khối lượng công việc:\n{members_str}"
            )
            return res_str
        except Exception as ex:
            logger.exception("Error executing get_project_details tool")
            return f"Lỗi ngoại lệ khi lấy thông tin dự án: {str(ex)}"


            # Build PATCH payload
            patch_payload = {
                "Title": final_title,
                "AssigneeUserId": final_assignee,
                "DueDate": final_due_date,
                "IsCompleted": final_completed
            }

            logger.info(f"Updating subtask details: /api/SubTasks/{subtask_id} with payload: {patch_payload}")
            response = await self.client.patch(f"/api/SubTasks/{subtask_id}", json=patch_payload)

            if response.status_code in [200, 204]:
                self._invalidate_board_cache()
                return f"Thành công: Đã cập nhật nhiệm vụ '{final_title}' (ID: {subtask_id})."
            else:
                return f"Lỗi từ ProjectManagement Service: {response.status_code} - {response.text}"

        except Exception as ex:
            logger.exception("Error executing update_subtask tool")
            return f"Lỗi ngoại lệ khi cập nhật nhiệm vụ: {str(ex)}"

    async def get_project_sprints(self) -> str:
        """
        Lấy danh sách tất cả các Sprint trong dự án hiện tại bao gồm tên, ID và trạng thái của từng Sprint (Active/Đang hoạt động, Future/Tương lai, Closed/Đã đóng).
        Dùng công cụ này để biết các Sprint hiện có để gán công việc vào hoặc xem thông tin các Sprint của dự án.
        """
        try:
            board_data = await self._get_board_data()
            if board_data is None:
                return "Lỗi: Không lấy được danh sách Sprint của dự án."

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

                goal = s.get("goal") or "Không có"
                start_str = self._format_local_date(s.get("startDate")) if s.get("startDate") else "Không xác định"
                end_str = self._format_local_date(s.get("endDate")) if s.get("endDate") else "Không xác định"

                res_lines.append(
                    f"- Tên Sprint: '{s.get('name')}' | ID: {s.get('id')} | Trạng thái: {status_vi} | "
                    f"Mục tiêu: {goal} | Bắt đầu: {start_str} | Kết thúc: {end_str}"
                )

            return "\n".join(res_lines)
        except Exception as ex:
            logger.exception("Error executing get_project_sprints tool")
            return f"Lỗi ngoại lệ khi lấy danh sách Sprint: {str(ex)}"

    async def create_sprint(
        self,
        name: str,
        goal: str = None,
        start_date: str = None,
        end_date: str = None
    ) -> str:
        """
        Tạo một Sprint mới cho dự án hiện tại. Sprint mới luôn ở trạng thái Tương lai (Future).

        Args:
            name: Tên Sprint (bắt buộc, phải duy nhất trong dự án). Ví dụ: 'Sprint 1', 'Sprint 2'.
            goal: Mục tiêu của Sprint, mô tả ngắn gọn phạm vi công việc trong Sprint này.
            start_date: Ngày bắt đầu Sprint (Định dạng ISO 8601: YYYY-MM-DDTHH:MM:SSZ). Phải nằm trong khoảng ngày bắt đầu và kết thúc của dự án.
            end_date: Ngày kết thúc Sprint (Định dạng ISO 8601: YYYY-MM-DDTHH:MM:SSZ). Phải sau start_date và nằm trong khoảng ngày dự án.
        """
        try:
            # Check existing sprints for duplicate name (cached)
            board_data = await self._get_board_data()
            if board_data is not None:
                existing_sprints = board_data.get("sprints", [])
                for s in existing_sprints:
                    if s.get("name", "").strip().lower() == name.strip().lower():
                        sprint_id = s.get("id")
                        return f"Thành công: Sprint '{name}' đã tồn tại trong dự án (ID: {sprint_id}). Không cần tạo lại."

            # Create sprint via PM API
            sprint_payload = {
                "ProjectId": self.project_id_str,
                "Name": name.strip()
            }
            if goal:
                sprint_payload["Goal"] = goal
            if start_date:
                sprint_payload["StartDate"] = start_date
            if end_date:
                sprint_payload["EndDate"] = end_date

            logger.info(f"Creating sprint via PM Service with payload: {sprint_payload}")
            response = await self.client.post("/api/Sprints", json=sprint_payload)

            if response.status_code == 201:
                result = response.json()
                sprint_id = result.get("id")
                self._invalidate_board_cache()
                return f"Thành công: Đã tạo Sprint '{name}' (ID: {sprint_id}) với trạng thái Tương lai (Future)."
            else:
                error_detail = response.text
                return f"Lỗi từ ProjectManagement Service: {response.status_code} - {error_detail}"

        except Exception as ex:
            logger.exception("Error executing create_sprint tool")
            return f"Lỗi ngoại lệ khi tạo Sprint: {str(ex)}"


    async def get_project_tasks(
        self,
        assignee_name: str = None,
        status_type: str = "uncompleted",
        due_date_filter: str = None
    ) -> str:
        """
        Lấy danh sách chi tiết các công việc và nhiệm vụ trong dự án hiện tại, hỗ trợ lọc thông tin.
        Dùng công cụ này để trả lời các câu hỏi như: "Tôi được giao những nhiệm vụ nào?",
        "Thành viên A còn những nhiệm vụ nào chưa hoàn thành?", "Các công việc/nhiệm vụ nào sắp đến hạn?",
        "Các nhiệm vụ của thành viên B sắp đến hạn trong 5 ngày tới?". Có thể kết hợp nhiều bộ lọc cùng lúc.

        Args:
            assignee_name: Tên của thành viên được giao (tùy chọn). Ví dụ: 'Nguyễn Văn A'. Nếu cung cấp, chỉ trả về các nhiệm vụ được giao cho người này. Có thể kết hợp với due_date_filter để lọc nhiệm vụ sắp đến hạn của một thành viên cụ thể.
            status_type: Trạng thái hoàn thành (tùy chọn). Chỉ chấp nhận 'completed' (đã hoàn thành), 'uncompleted' (chưa hoàn thành), hoặc 'all' (tất cả). Mặc định là 'uncompleted'.
            due_date_filter: Bộ lọc ngày hạn hoàn thành (tùy chọn). Chấp nhận 'overdue' (quá hạn - trước ngày hôm nay), hoặc 'upcomingN' với N là số ngày cụ thể (ví dụ: 'upcoming3' cho 3 ngày tới, 'upcoming7' cho 7 ngày tới, 'upcoming14' cho 14 ngày tới, 'upcoming30' cho 30 ngày tới). Nếu người dùng hỏi 'sắp đến hạn' mà không nói rõ số ngày, mặc định dùng 'upcoming7'. Để trống để lấy tất cả.
        """
        try:
            tasks_url = f"/api/Projects/{self.project_id_str}/tasks"
            logger.info(f"Fetching tasks from: {tasks_url} with X-User-Id: {self.user_id_str}")
            response = await self.client.get(tasks_url)

            if response.status_code != 200:
                return f"Lỗi: Không lấy được danh sách công việc của dự án (HTTP {response.status_code})."

            data = response.json()
            tasks = data.get("tasks", [])

            if not tasks:
                return "Dự án hiện tại chưa có công việc nào."

            # Calculate today and upcoming end in local (UTC+7) timezone
            now_local = datetime.now(timezone.utc) + timedelta(hours=7)
            today_local = now_local.date()

            # Parse dynamic upcoming days from due_date_filter (e.g., 'upcoming3', 'upcoming14')
            upcoming_days = 7  # default
            if due_date_filter and due_date_filter.startswith("upcoming"):
                try:
                    upcoming_days = int(due_date_filter.replace("upcoming", ""))
                except ValueError:
                    upcoming_days = 7  # fallback if no number provided
            upcoming_end_local = today_local + timedelta(days=upcoming_days)

            filtered_tasks = []
            for t in tasks:
                subtasks_matched = []

                # Filter subtasks
                for st in t.get("subTasks", []):
                    # 1. Filter by assignee
                    if assignee_name:
                        st_assignee = st.get("assigneeName") or ""
                        if assignee_name.strip().lower() not in st_assignee.lower():
                            continue

                    # 2. Filter by status
                    st_is_completed = st.get("isCompleted", False)
                    if status_type == "completed" and not st_is_completed:
                        continue
                    elif status_type == "uncompleted" and st_is_completed:
                        continue

                    # 3. Filter by due date
                    if due_date_filter:
                        st_due = self._parse_datetime(st.get("dueDate"))
                        if not st_due:
                            continue
                        st_due_local = (st_due + timedelta(hours=7)).date()
                        if due_date_filter == "overdue" and st_due_local >= today_local:
                            continue
                        elif due_date_filter.startswith("upcoming") and not (today_local <= st_due_local <= upcoming_end_local):
                            continue

                    subtasks_matched.append(st)

                # Parent task matching
                parent_matches = True
                if assignee_name:
                    # If filtering by assignee, parent task matches only if it has matching subtasks
                    if not subtasks_matched:
                        parent_matches = False
                else:
                    # Filter parent tasks without assignee
                    if status_type == "completed" and t.get("columnName") != "Hoàn thành":
                        parent_matches = False
                    elif status_type == "uncompleted" and t.get("columnName") == "Hoàn thành":
                        parent_matches = False

                    if due_date_filter:
                        t_due = self._parse_datetime(t.get("dueDate"))
                        if t_due:
                            t_due_local = (t_due + timedelta(hours=7)).date()
                            if due_date_filter == "overdue" and t_due_local >= today_local:
                                parent_matches = False
                            elif due_date_filter.startswith("upcoming") and not (today_local <= t_due_local <= upcoming_end_local):
                                parent_matches = False
                        else:
                            if not subtasks_matched:
                                parent_matches = False

                if parent_matches or subtasks_matched:
                    t_copy = dict(t)
                    t_copy["subTasks"] = subtasks_matched
                    filtered_tasks.append(t_copy)

            if not filtered_tasks:
                return "Không tìm thấy công việc hoặc nhiệm vụ nào khớp với bộ lọc."

            res_lines = ["Danh sách công việc và nhiệm vụ trong dự án (Đã lọc):"]
            for t in filtered_tasks:
                due_date_str = self._format_local_date(t.get("dueDate")) if t.get("dueDate") else "Không có hạn"

                res_lines.append(
                    f"\n[Công việc] '{t.get('title')}'\n"
                    f"  - ID: {t.get('id')}\n"
                    f"  - Độ ưu tiên: {t.get('priority') or 'Không có'}\n"
                    f"  - Cột trạng thái: '{t.get('columnName') or 'Không xác định'}'\n"
                    f"  - Sprint: {t.get('sprintName') or 'Backlog'}\n"
                    f"  - Hạn hoàn thành: {due_date_str}"
                )

                if t.get("subTasks"):
                    res_lines.append("  - Danh sách nhiệm vụ:")
                    for st in t.get("subTasks"):
                        st_due = self._format_local_date(st.get("dueDate")) if st.get("dueDate") else "Không có hạn"
                        st_status = "Đã hoàn thành" if st.get("isCompleted") else "Chưa hoàn thành"
                        st_assignee = st.get("assigneeName") or "Chưa gán"
                        res_lines.append(
                            f"    * '{st.get('title')}' (ID: {st.get('id')} | "
                            f"Người thực hiện: {st_assignee} | "
                            f"Trạng thái: {st_status} | "
                            f"Hạn hoàn thành: {st_due})"
                        )
            return "\n".join(res_lines)
        except Exception as ex:
            logger.exception("Error executing get_project_tasks tool")
            return f"Lỗi ngoại lệ khi lấy danh sách công việc: {str(ex)}"


    async def get_project_activities(
        self,
        page: int = 1,
        page_size: int = 50,
        user_id: str = None,
        date: str = None
    ) -> str:
        """
        Lấy lịch sử hoạt động/lịch sử thay đổi của dự án hiện tại (ai đã làm gì, lúc nào).

        Args:
            page: Số trang kết quả (mặc định là 1).
            page_size: Số lượng bản ghi mỗi trang (mặc định là 50).
            user_id: ID (UUID) của thành viên để lọc hoạt động của người đó (tùy chọn).
            date: Ngày để lọc hoạt động dạng YYYY-MM-DD (tùy chọn).
        """
        try:
            activities_url = f"/api/Projects/{self.project_id_str}/activities"
            params = {
                "page": page,
                "pageSize": page_size
            }
            if user_id:
                params["userId"] = user_id.strip()
            if date:
                params["date"] = date.strip()

            logger.info(f"Fetching project activities from: {activities_url} with params: {params}")
            response = await self.client.get(activities_url, params=params)

            if response.status_code != 200:
                return f"Lỗi: Không lấy được lịch sử hoạt động (HTTP {response.status_code})."

            activities = response.json()
            if not activities:
                return "Không tìm thấy hoạt động nào trong dự án khớp với bộ lọc."

            res_lines = ["Lịch sử hoạt động của dự án:"]
            for act in activities:
                created_at = act.get("createdAt", "Không rõ thời gian")
                if created_at != "Không rõ thời gian":
                    dt = self._parse_datetime(created_at)
                    if dt:
                        # Chuyển đổi từ UTC sang giờ Việt Nam (UTC+7)
                        dt_vietnam = dt + timedelta(hours=7)
                        created_at = dt_vietnam.strftime("%Y-%m-%d %H:%M")
                    elif len(created_at) > 16:
                        created_at = created_at.replace("T", " ")[:16]

                display_name = act.get("displayName") or "Hệ thống"
                action_type = act.get("actionType") or "Thao tác"
                entity_type = act.get("entityType") or "Đối tượng"
                old_value = act.get("oldValue")
                new_value = act.get("newValue")

                detail = ""
                if old_value and new_value:
                    detail = f" (Thay đổi: '{old_value}' -> '{new_value}')"
                elif new_value:
                    detail = f" (Giá trị: '{new_value}')"

                res_lines.append(f"- [{created_at}] {display_name}: {action_type} {entity_type}{detail}")

            return "\n".join(res_lines)
        except Exception as ex:
            logger.exception("Error executing get_project_activities tool")
            return f"Lỗi ngoại lệ khi lấy lịch sử hoạt động: {str(ex)}"

    async def get_user_display_name(self) -> str:
        """Lấy tên hiển thị của người dùng hiện tại từ danh sách thành viên dự án."""
        try:
            overview_url = f"/api/Projects/{self.project_id_str}/overview"
            logger.info(f"Fetching project overview for user display name mapping: {overview_url}")
            response = await self.client.get(overview_url)
            if response.status_code == 200:
                data = response.json()
                members = data.get("memberWorkloads", [])
                for m in members:
                    if m.get("userId") == self.user_id_str:
                        return m.get("displayName")
        except Exception:
            logger.exception("Failed to get user display name")
        return "Thành viên"

