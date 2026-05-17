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

## 3. Quản lý Công việc (Kanban Board & Tasks)
* **Quyền làm việc:** Bình đẳng. Mọi thành viên hợp lệ của dự án đều có thể tạo, sửa, xóa và phân công Task.
* **Cột trạng thái:** Cho phép cấu hình linh hoạt kèm giới hạn số lượng công việc tối đa (`wip_limit`).
* **Cấu trúc Task (Task Hierarchy):**
    * **Thẻ độc lập / Thẻ con:** Chỉ được phân công cho tối đa 1 người (`assignee_user_id` chỉ nhận 1 giá trị hoặc NULL).
    * **Thẻ cha:** Tuyệt đối không gán người thực hiện (`assignee_user_id` luôn luôn bằng NULL).
    * **Auto-Resolve:** Khi biến một thẻ đang có người phụ trách thành thẻ cha (bằng cách tạo thẻ con cho nó), hệ thống tự động gỡ người đó khỏi thẻ cha.

## 4. Thảo luận & Đính kèm (Comments & Attachments)
* **Tương tác:** Thành viên được quyền bình luận (Comment) chéo trên tất cả các Task thuộc dự án.
* **Đính kèm file:** File không đính kèm trực tiếp vào Task. File bắt buộc phải gắn liền với một bản ghi Bình luận cụ thể để tạo timeline lịch sử báo cáo.

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