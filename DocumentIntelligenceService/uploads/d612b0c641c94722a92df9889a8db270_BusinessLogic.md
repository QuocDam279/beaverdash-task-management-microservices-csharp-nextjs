# TÀI LIỆU NGHIỆP VỤ HỆ THỐNG (BUSINESS LOGIC)
**Dự án:** Hệ thống Quản lý Dự án Kanban (Beaverdash)

## 1. Tổ chức & Phân quyền (Teams & Users)
* **User:** Có thể tạo hoặc tham gia nhiều Nhóm.
* **Owner (Người tạo nhóm):** Toàn quyền quản trị (sửa/xóa nhóm, quản lý thành viên).
* **Member:** Có quyền mời người mới vào nhóm hoặc tự rời nhóm.

## 2. Quản lý Dự án (Projects)
* **Loại dự án & Sở hữu:**
    * **Dự án Nhóm:** Thuộc về 1 Nhóm cụ thể (`team_id != null`). Toàn bộ thành viên trong nhóm mặc định có quyền truy cập.
    * **Dự án Cá nhân:** Không thuộc về Nhóm nào (`team_id = null`). Chỉ duy nhất người tạo có quyền truy cập.
* **Quyền hạn hành vi:** Chỉ duy nhất Người tạo dự án (`created_by_user_id`) mới được quyền Sửa hoặc Xóa dự án.
* **Public Share Token:** Sinh mã Token để tạo link Read-only (không cần đăng nhập) phục vụ báo cáo Giảng viên hướng dẫn.

## 3. Quản lý Công việc (Kanban Board, Tasks & Sub-tasks)
* **Quyền làm việc:** Bình đẳng. Mọi thành viên hợp lệ của dự án đều có thể tạo, sửa, xóa và phân công Task chính cũng như Sub-task.
* **Cột trạng thái:** Cho phép cấu hình linh hoạt kèm giới hạn số lượng công việc tối đa (`wip_limit`).
* **Cơ chế phân tách Task & Sub-task:**
    * **Task chính (Tasks):** Các công việc lớn nằm trên Kanban Board. Sắp xếp vị trí theo kiểu số thực (`double precision`) để hỗ trợ kéo thả kéo thả mượt mà không cần đánh lại chỉ mục toàn bộ. Có thể được phân công cho 1 người thực hiện.
    * **Sub-task ( Checklist/Công việc phụ):** Thuộc về 1 Task chính nhất định. Có thể gán người phụ trách riêng biệt độc lập với Task chính.
* **Ràng buộc Hạn chót (Deadline Validation):**
    * Hạn chót hoàn thành (`dueDate`) của các Sub-task con tuyệt đối không được phép muộn hơn hạn chót hoàn thành của Task cha.
    * Ngược lại, khi cập nhật Task cha, hệ thống không cho phép dời hạn chót sớm hơn hạn chót của bất kỳ Sub-task con nào đang hoạt động.
* **Xóa mềm liên đới (Cascade Soft Delete):**
    * Khi thực hiện xóa mềm một Task chính, hệ thống sẽ tự động thực hiện cascade soft delete (đánh dấu xóa mềm) cho toàn bộ các Sub-task con trực thuộc Task đó.

## 4. Thảo luận & Đính kèm (Comments & Attachments)
* **Thảo luận trực tiếp trên Sub-task:** Luồng thảo luận (Comments) được chuyển dịch hoàn toàn để gắn trực tiếp vào từng **Sub-task con** thay vì gắn vào Task chính như trước đây. Mọi thành viên trong dự án đều có quyền thảo luận trong các Sub-task.
* **Đính kèm file:** File không đính kèm trực tiếp vào Task hay Sub-task. File bắt buộc phải gắn liền với một bản ghi Bình luận cụ thể của Sub-task con để tạo timeline lịch sử báo cáo.

## 5. Trợ lý AI (Document Intelligence)
* **Kho tri thức:** Cho phép thành viên upload tài liệu lên dự án. Hệ thống xử lý ngầm (Cắt nhỏ - Chunking, chuyển đổi thành Vector Embedding).
* **Phân quyền và bảo mật:** * Toàn bộ tài liệu được cô lập theo `project_id`. Người dùng chỉ được tương tác với tài liệu thuộc dự án họ tham gia.
    * Với **Dự án Cá nhân**, khi tạo dự án, hệ thống phải tự động đồng bộ tài khoản người tạo vào bảng thành viên tài liệu (`project_members`) để đảm bảo quyền truy cập.
* **RAG AI Chat:** Mỗi User có phiên chat riêng tư. AI chỉ được truy xuất dữ liệu trong kho tài liệu của chính dự án đó và bắt buộc phải lưu nguồn dẫn chứng (`used_documents`).

## 6. Kiểm toán (Activity Logs)
* **Phạm vi tracking:** Tự động ghi nhận log ngầm theo thời gian thực (Real-time) chỉ ở cấp Dự án (Ví dụ: Thao tác kéo thả chuyển cột trạng thái, phân công người làm, thay đổi hạn chót).

## 7. Thông báo (Notifications & Emails)
* **In-app Notification:** Đẩy thông báo real-time khi: Có task mới được tạo, bị người khác nhắc tên (`@mention`), hoặc có bình luận mới trong task mình đang phụ trách.
* **Deadline Job:** Quét tự động định kỳ và gửi thông báo nhắc nhở trước hạn chót (Mốc 24h và 48h).
* **Email Worker:** Background job quét các thông báo quan trọng chưa đọc (Unread) để gửi email dự phòng.