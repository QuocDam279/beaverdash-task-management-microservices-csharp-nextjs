# Beaverdash API - Postman Sample Data

Tài liệu này cung cấp các payload JSON mẫu và hướng dẫn chi tiết để kiểm thử (End-to-End) toàn bộ các API đã xây dựng cho Project Management Service (`PM.API`).

*Lưu ý: `{{baseUrl}}` mặc định là `http://localhost:5002` (hoặc thông qua ApiGateway `http://localhost:5000/api`). Các API hiện tại đã được nâng cấp bảo mật và yêu cầu gửi kèm Header `Authorization: Bearer <TOKEN>` (hoặc cấu hình thông qua header `X-User-Id` nếu test trực tiếp nội bộ).*

---

## 1. Module Teams (Quản lý Đội ngũ)

### 1.1. Tạo Team mới
- **Method**: `POST`
- **URL**: `{{baseUrl}}/api/teams`
- **Body (JSON)**:
```json
{
  "name": "Backend Development Team",
  "description": "Nhóm chịu trách nhiệm phát triển core services"
}
```
- **Expected Response**: `201 Created` (Trả về `{ "id": "..." }`)

### 1.2. Thêm thành viên vào Team
- **Method**: `POST`
- **URL**: `{{baseUrl}}/api/teams/{{teamId}}/members`
- **Body (JSON)**:
```json
{
  "userId": "22222222-2222-2222-2222-222222222222"
}
```
- **Expected Response**: `204 No Content`

### 1.3. Cập nhật quyền (Role) của thành viên
- **Method**: `PUT`
- **URL**: `{{baseUrl}}/api/teams/{{teamId}}/members/22222222-2222-2222-2222-222222222222/role`
- **Body (JSON)**:
```json
{
  "newRole": "leader"
}
```
- **Expected Response**: `204 No Content`

### 1.4. Lấy danh sách thành viên của Team
- **Method**: `GET`
- **URL**: `{{baseUrl}}/api/teams/{{teamId}}`
- **Expected Response**: `200 OK` (Trả về danh sách members kèm user profile)

### 1.5. Xóa thành viên / Rời Team
- **Method**: `DELETE`
- **URL**: `{{baseUrl}}/api/teams/{{teamId}}/members/22222222-2222-2222-2222-222222222222`
- **Body (JSON)**:
```json
{}
```
- **Expected Response**: `204 No Content`

### 1.6. Cập nhật thông tin Team
- **Method**: `PUT`
- **URL**: `{{baseUrl}}/api/teams/{{teamId}}`
- **Body (JSON)**:
```json
{
  "name": "Backend Alpha Team",
  "description": "Đội Backend mới được update"
}
```
- **Expected Response**: `204 No Content`

### 1.7. Xóa Team
- **Method**: `DELETE`
- **URL**: `{{baseUrl}}/api/teams/{{teamId}}`
- **Body (JSON)**:
```json
{}
```
- **Expected Response**: `204 No Content`

### 1.8. Lấy danh sách Dự án của Team
- **Method**: `GET`
- **URL**: `{{baseUrl}}/api/teams/{{teamId}}/projects`
- **Expected Response**: `200 OK` (Trả về danh sách dự án, sắp xếp mới nhất ở trên, bao gồm tên và avatar của người tạo).

---

## 2. Module Boards & Tasks (Bảng công việc & Task chính)

### 2.1. Tạo Dự án mới
- **Method**: `POST`
- **URL**: `{{baseUrl}}/api/projects`
- **Body (JSON)**:
```json
{
  "name": "E-Commerce Replatforming",
  "description": "Nâng cấp hệ thống core commerce",
  "teamId": "{{teamId}}"
}
```
- **Expected Response**: `201 Created`

### 2.2. Tạo Cột (Board Column)
- **Method**: `POST`
- **URL**: `{{baseUrl}}/api/boardcolumns`
- **Body (JSON)**:
```json
{
  "projectId": "{{projectId}}",
  "name": "To Do",
  "position": 1,
  "wipLimit": 5
}
```
- **Expected Response**: `201 Created`

### 2.3. Tạo Task mới
- **Method**: `POST`
- **URL**: `{{baseUrl}}/api/tasks`
- **Body (JSON)**:
```json
{
  "boardColumnId": "97c40fdb-9b1a-4180-ab7a-327f21fdb09f",
  "title": "Thiết kế API thanh toán",
  "description": "Cần hoàn thành luồng kết nối VNPay",
  "priority": "High",
  "assigneeUserId": null,
  "dueDate": "2026-05-25T17:00:00Z",
  "startDate": "2026-05-18T08:00:00Z",
  "sortOrder": null
}
```
- **Expected Response**: `201 Created`

### 2.4. Di chuyển / Kéo thả Task (Dùng Double Sort Order)
- **Method**: `PUT`
- **URL**: `{{baseUrl}}/api/tasks/{{taskId}}/move`
- **Body (JSON)**:
```json
{
  "newBoardColumnId": "dc5f5679-39cc-4953-969a-28a2be354d4c",
  "newSortOrder": 0.5
}
```
- **Expected Response**: `204 No Content`

### 2.5. Cập nhật chi tiết / Giao việc
- **Method**: `PATCH`
- **URL**: `{{baseUrl}}/api/tasks/{{taskId}}`
- **Body (JSON)**:
```json
{
  "assigneeUserId": "6a08aa6f-49a1-4499-8602-5e3e3f5c1e79",
  "dueDate": "2026-12-31T23:59:00Z",
  "priority": "Urgent"
}
```
- **Expected Response**: `204 No Content`
- *Lưu ý: Hạn hoàn thành của Task không được nhỏ hơn hạn hoàn thành của bất kỳ Sub-task nào đang tồn tại.*

### 2.6. Xóa Task (Xóa mềm - Cascade Soft Delete)
- **Method**: `DELETE`
- **URL**: `{{baseUrl}}/api/tasks/{{taskId}}`
- **Expected Response**: `204 No Content`
- *Lưu ý: Xóa Task sẽ đồng thời tự động đánh dấu xóa mềm toàn bộ các Sub-task con của Task đó.*

---

## 3. Module SubTasks (Quản lý Công việc phụ / Checklist)

### 3.1. Tạo Sub-task mới
- **Method**: `POST`
- **URL**: `{{baseUrl}}/api/subtasks`
- **Body (JSON)**:
```json
{
  "taskId": "{{taskId}}",
  "title": "Thiết kế database schema cho VNPay",
  "assigneeUserId": "6a08aa6f-49a1-4499-8602-5e3e3f5c1e79",
  "startDate": "2026-05-18T08:00:00Z",
  "dueDate": "2026-05-20T17:00:00Z",
  "sortOrder": 1
}
```
- **Expected Response**: `201 Created`
- *Lưu ý: Hạn hoàn thành (dueDate) của Sub-task không được phép vượt quá hạn hoàn thành của Task cha.*

### 3.2. Cập nhật thông tin chi tiết Sub-task / Đánh dấu hoàn thành
- **Method**: `PATCH`
- **URL**: `{{baseUrl}}/api/subtasks/{{subTaskId}}`
- **Body (JSON)**:
```json
{
  "title": "Thiết kế database schema cho VNPay (Đã duyệt)",
  "assigneeUserId": "6a08aa6f-49a1-4499-8602-5e3e3f5c1e79",
  "startDate": "2026-05-18T08:00:00Z",
  "dueDate": "2026-05-21T17:00:00Z",
  "isCompleted": true
}
```
- **Expected Response**: `204 No Content`

### 3.3. Xóa Sub-task (Xóa mềm)
- **Method**: `DELETE`
- **URL**: `{{baseUrl}}/api/subtasks/{{subTaskId}}`
- **Expected Response**: `204 No Content`

---

## 4. Module Collaboration (Thảo luận & Đính kèm trên Sub-task)

### 4.1. Thêm bình luận vào Sub-task
- **Method**: `POST`
- **URL**: `{{baseUrl}}/api/subtasks/{{subTaskId}}/comments`
- **Body (JSON)**:
```json
{
  "content": "Tôi vừa xem qua bản thiết kế DB, trông rất tối ưu!"
}
```
- **Expected Response**: `201 Created`

### 4.2. Lấy danh sách bình luận của Sub-task
- **Method**: `GET`
- **URL**: `{{baseUrl}}/api/subtasks/{{subTaskId}}/comments`
- **Expected Response**: `200 OK`

### 4.3. Xóa bình luận
- **Method**: `DELETE`
- **URL**: `{{baseUrl}}/api/subtasks/{{subTaskId}}/comments/{{commentId}}`
- **Expected Response**: `204 No Content`

### 4.4. Upload File đính kèm vào bình luận
- **Method**: `POST`
- **URL**: `{{baseUrl}}/api/subtasks/{{subTaskId}}/comments/{{commentId}}/attachments`
- **Body (Form-Data)**:
  - `file`: (Chọn 1 file ảnh hoặc tài liệu bất kỳ)
- **Expected Response**: `201 Created`

---

## 5. Module Activities & Notifications

### 5.1. Lấy lịch sử hoạt động của Dự án (Timeline)
- **Method**: `GET`
- **URL**: `{{baseUrl}}/api/projects/{{projectId}}/activities`
- **Expected Response**: `200 OK`

### 5.2. Lấy danh sách thông báo cá nhân
- **Method**: `GET`
- **URL**: `{{baseUrl}}/api/notifications`
- **Expected Response**: `200 OK`

### 5.3. Đánh dấu thông báo đã đọc
- **Method**: `PATCH`
- **URL**: `{{baseUrl}}/api/notifications/{{notificationId}}/read`
- **Body (JSON)**:
```json
{}
```
- **Expected Response**: `204 No Content`

---

## 6. Hướng dẫn Test SignalR Real-time (Websocket)

Để quan sát cách hệ thống đẩy thông báo theo thời gian thực (Real-time) mà không cần tải lại trang, hãy làm theo các bước:

1. **Khởi tạo kết nối**: Mở Postman, chọn **New** -> **WebSocket Request**.
2. **Nhập URL**: `wss://localhost:5002/hubs/notifications` (hoặc dùng `ws://...` nếu bạn tắt HTTPS).
3. **Kết nối**: Bấm **Connect**.
4. *(Tùy chọn Bảo mật)*: Hiện tại class `NotificationHub` đã tạm tắt `[Authorize]` để dễ test. Nếu bạn bật lại, hãy sang tab **Headers** thêm Key: `Authorization` và Value: `Bearer <token_của_user_nhận>`.
5. **Kích hoạt sự kiện (Trigger)**:
   - Giữ tab Websocket đang mở.
   - Quay lại Postman mở tab REST (HTTP) mới.
   - Sử dụng API **PATCH Cập nhật chi tiết / Giao việc** (Mục 2.5) hoặc **POST Thêm bình luận** (Mục 4.1) dưới danh nghĩa là User số `11111111...` và gán cho User số `33333333...`.
   - Ngay lập tức mở lại tab Websocket, bạn sẽ thấy thông điệp dạng JSON với nhãn `ReceiveNotification` được đổ về từ máy chủ báo hiệu "Ai đó vừa giao việc cho bạn"!

---

## 7. Kịch bản kiểm thử mẫu cho Subtask (End-to-End Concrete Test Data)

Dưới đây là chuỗi dữ liệu thực tế mẫu để bạn có thể copy-paste trực tiếp khi test Postman:

### Bước 7.1. Tạo Dự án và Cột (Board Column)
*Lưu ý: Dùng `X-User-Id: 11111111-1111-1111-1111-111111111111` trong header.*
1. **Tạo Dự án**:
   - **POST** `http://localhost:5002/api/projects`
   - **Payload**:
     ```json
     {
       "name": "E-Commerce System",
       "description": "Dự án nâng cấp hệ thống",
       "teamId": null
     }
     ```
   - *Giả sử trả về ID dự án: `55555555-5555-5555-5555-555555555555`*

2. **Tạo Cột**:
   - **POST** `http://localhost:5002/api/boardcolumns`
   - **Payload**:
     ```json
     {
       "projectId": "55555555-5555-5555-5555-555555555555",
       "name": "In Progress",
       "position": 1,
       "wipLimit": 10
     }
     ```
   - *Giả sử trả về ID cột: `88888888-8888-8888-8888-888888888888`*

### Bước 7.2. Tạo Task cha (TaskItem)
*Thiết lập hạn hoàn thành của Task cha là ngày `2026-05-30`*
- **POST** `http://localhost:5002/api/tasks`
- **Payload**:
  ```json
  {
    "boardColumnId": "88888888-8888-8888-8888-888888888888",
    "title": "Nghiên cứu tích hợp VNPay API",
    "description": "Viết tài liệu tích hợp và thiết kế schema",
    "priority": "High",
    "assigneeUserId": "11111111-1111-1111-1111-111111111111",
    "dueDate": "2026-05-30T17:00:00Z",
    "startDate": "2026-05-20T08:00:00Z",
    "sortOrder": 1.0
  }
  ```
- *Giả sử API trả về ID task vừa tạo: `77777777-7777-7777-7777-777777777777`*

### Bước 7.3. Kiểm thử ràng buộc Deadline trên Sub-task

1. **Trường hợp lỗi (dueDate của SubTask vượt quá Task cha)**:
   - **POST** `http://localhost:5002/api/subtasks`
   - **Payload**:
     ```json
     {
       "taskId": "77777777-7777-7777-7777-777777777777",
       "title": "Thiết kế database cho Subtask",
       "assigneeUserId": "22222222-2222-2222-2222-222222222222",
       "startDate": "2026-05-21T08:00:00Z",
       "dueDate": "2026-06-05T17:00:00Z", 
       "sortOrder": 1
     }
     ```
     *(dueDate `2026-06-05` vượt quá `2026-05-30`)*
   - **Expected Status**: `400 Bad Request` hoặc `500 Internal Server Error` (với nội dung `"Hạn hoàn thành của SubTask không được vượt quá hạn hoàn thành của Task cha."`)

2. **Trường hợp thành công (dueDate hợp lệ)**:
   - **POST** `http://localhost:5002/api/subtasks`
   - **Payload**:
     ```json
     {
       "taskId": "77777777-7777-7777-7777-777777777777",
       "title": "Thiết kế database cho Subtask",
       "assigneeUserId": "22222222-2222-2222-2222-222222222222",
       "startDate": "2026-05-21T08:00:00Z",
       "dueDate": "2026-05-25T17:00:00Z", 
       "sortOrder": 1
     }
     ```
   - **Expected Status**: `201 Created` (Trả về ID Sub-task, giả sử là `99999999-9999-9999-9999-999999999999`)

### Bước 7.4. Kiểm thử cập nhật SubTask và Comments

1. **Cập nhật trạng thái hoàn thành SubTask**:
   - **PATCH** `http://localhost:5002/api/subtasks/99999999-9999-9999-9999-999999999999`
   - **Payload**:
     ```json
     {
       "title": "Thiết kế database cho Subtask (Đã hoàn thành)",
       "assigneeUserId": "22222222-2222-2222-2222-222222222222",
       "startDate": "2026-05-21T08:00:00Z",
       "dueDate": "2026-05-26T17:00:00Z",
       "isCompleted": true
     }
     ```
   - **Expected Status**: `204 No Content`

2. **Gửi Comment vào SubTask**:
   - **POST** `http://localhost:5002/api/subtasks/99999999-9999-9999-9999-999999999999/comments`
   - **Payload**:
     ```json
     {
       "content": "Database schema đã được duyệt bởi Leader."
     }
     ```
   - **Expected Status**: `201 Created` (Trả về Comment ID, giả sử là `cccccccc-cccc-cccc-cccc-cccccccccccc`)

3. **Lấy danh sách Comments của SubTask**:
   - **GET** `http://localhost:5002/api/subtasks/99999999-9999-9999-9999-999999999999/comments`
   - **Expected Status**: `200 OK` (Danh sách bao gồm comment `cccccccc...`)

### Bước 7.5. Kiểm thử Cascade Soft Delete

1. **Xóa mềm Task cha**:
   - **DELETE** `http://localhost:5002/api/tasks/77777777-7777-7777-7777-777777777777`
   - **Expected Status**: `204 No Content`

2. **Kiểm tra trạng thái**:
   - Khi query lại bảng dự án hoặc task list, Task `77777777...` và Sub-task `99999999...` cùng Comment `cccccccc...` sẽ không còn hiển thị ở client vì đã được kích hoạt Soft Delete thông qua Query Filter.

---

## 8. Module Document Intelligence (AI Chat, RAG & Agent)

Các API của Document Intelligence Service mặc định chạy ở cổng `http://localhost:5003` (hoặc thông qua Gateway `http://localhost:5000/api/v1/...`). Các yêu cầu của người dùng cần truyền kèm header `X-User-Id` để giả lập xác thực từ Gateway.

### 8.1. Đồng bộ Dự án (Webhook)
- **Method**: `POST`
- **URL**: `http://localhost:5003/api/v1/webhooks/projects`
- **Body (JSON)**:
```json
{
  "id": "55555555-5555-5555-5555-555555555555",
  "name": "E-Commerce System Test RAG",
  "description": "Project for RAG and AI Agent testing",
  "status": "active"
}
```
- **Expected Response**: `200 OK`

### 8.2. Đồng bộ Thành viên Dự án (Webhook)
- **Method**: `POST`
- **URL**: `http://localhost:5003/api/v1/webhooks/projects/55555555-5555-5555-5555-555555555555/members`
- **Body (JSON)**:
```json
{
  "member_user_ids": [
    "11111111-1111-1111-1111-111111111111"
  ]
}
```
- **Expected Response**: `200 OK`

### 8.3. Upload Tài liệu Dự án
- **Method**: `POST`
- **URL**: `http://localhost:5003/api/v1/documents`
- **Headers**:
  - `X-User-Id`: `11111111-1111-1111-1111-111111111111`
- **Body (Multipart Form-Data)**:
  - `file`: (Chọn file markdown, text, pdf hoặc docx ví dụ như `project_plan.md`)
  - `project_id`: `55555555-5555-5555-5555-555555555555`
- **Expected Response**: `201 Created` (Trả về thông tin tài liệu kèm trạng thái `"processing"` hoặc `"completed"`)

### 8.4. Lấy danh sách Tài liệu Dự án
- **Method**: `GET`
- **URL**: `http://localhost:5003/api/v1/documents?project_id=55555555-5555-5555-5555-555555555555`
- **Headers**:
  - `X-User-Id`: `11111111-1111-1111-1111-111111111111`
- **Expected Response**: `200 OK`

### 8.5. Tạo phiên AI Chat mới
- **Method**: `POST`
- **URL**: `http://localhost:5003/api/v1/chat/sessions`
- **Headers**:
  - `X-User-Id`: `11111111-1111-1111-1111-111111111111`
- **Body (JSON)**:
```json
{
  "project_id": "55555555-5555-5555-5555-555555555555",
  "title": "Project QA Session"
}
```
- **Expected Response**: `201 Created` (Trả về `{ "id": "{{sessionId}}" }`)

### 8.6. Hỏi đáp tìm kiếm tài liệu (RAG Chat)
- **Method**: `POST`
- **URL**: `http://localhost:5003/api/v1/chat/sessions/{{sessionId}}/messages`
- **Headers**:
  - `X-User-Id`: `11111111-1111-1111-1111-111111111111`
- **Body (JSON)**:
```json
{
  "content": "What technologies does Beaverdash use?"
}
```
- **Expected Response**: `201 Created` (Trả về câu trả lời kèm danh sách `used_documents` trích dẫn từ các chunk tài liệu tìm thấy)

### 8.7. Chat với AI Agent để tạo công việc mới (Tool Calling)
1. **Gửi yêu cầu tạo việc**:
   - **Method**: `POST`
   - **URL**: `http://localhost:5003/api/v1/chat/sessions/{{sessionId}}/messages`
   - **Headers**:
     - `X-User-Id`: `11111111-1111-1111-1111-111111111111`
   - **Body (JSON)**:
   ```json
   {
     "content": "Please create a task with title 'Integrate VNPay' in the column '88888888-8888-8888-8888-888888888888'."
   }
   ```
   - **Expected Response**: `201 Created` (AI phản hồi tóm tắt thông tin và hỏi xác nhận: *"Bạn có chắc chắn muốn tạo công việc...?"*)

2. **Gửi xác nhận để AI Agent thực thi gọi API**:
   - **Method**: `POST`
   - **URL**: `http://localhost:5003/api/v1/chat/sessions/{{sessionId}}/messages`
   - **Headers**:
     - `X-User-Id`: `11111111-1111-1111-1111-111111111111`
   - **Body (JSON)**:
   ```json
   {
     "content": "Yes, please proceed."
   }
   ```
   - **Expected Response**: `201 Created` (Trả về câu trả lời kết quả, kèm thuộc tính `tool_calls` và `tool_results` chứa log thực thi gọi API sang Project Management Service)

