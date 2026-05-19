# Beaverdash API - Postman Sample Data

Tài liệu này cung cấp các payload JSON mẫu và hướng dẫn chi tiết để kiểm thử (End-to-End) toàn bộ các API đã xây dựng cho Project Management Service (`PM.API`).

*Lưu ý: `{{baseUrl}}` mặc định là `http://localhost:5002` (hoặc thông qua ApiGateway `http://localhost:5000/api`). Các GUID như `1111...` và `3333...` được dùng làm ví dụ cho User ID.*

---

## 1. Module Teams (Quản lý Đội ngũ)

### 1.1. Tạo Team mới
- **Method**: `POST`
- **URL**: `{{baseUrl}}/api/teams`
- **Body (JSON)**:
```json
{
  "name": "Backend Development Team",
  "description": "Nhóm chịu trách nhiệm phát triển core services",
  "createdByUserId": "6a08aa6f-49a1-4499-8602-5e3e3f5c1e79"
}
```
- **Expected Response**: `201 Created` (Trả về `{ "id": "..." }`)

### 1.2. Thêm thành viên vào Team
- **Method**: `POST`
- **URL**: `{{baseUrl}}/api/teams/{{teamId}}/members`
- **Body (JSON)**:
```json
{
  "userId": "22222222-2222-2222-2222-222222222222",
  "requestingUserId": "11111111-1111-1111-1111-111111111111"
}
```
- **Expected Response**: `204 No Content`

### 1.3. Cập nhật quyền (Role) của thành viên
- **Method**: `PUT`
- **URL**: `{{baseUrl}}/api/teams/{{teamId}}/members/22222222-2222-2222-2222-222222222222/role`
- **Body (JSON)**:
```json
{
  "newRole": "leader",
  "requestingUserId": "11111111-1111-1111-1111-111111111111"
}
```
- **Expected Response**: `204 No Content`

### 1.4. Lấy danh sách thành viên của Team
- **Method**: `GET`
- **URL**: `{{baseUrl}}/api/teams/{{teamId}}?requestingUserId=11111111-1111-1111-1111-111111111111`
- **Expected Response**: `200 OK` (Trả về danh sách members kèm user profile)

### 1.5. Xóa thành viên / Rời Team
- **Method**: `DELETE`
- **URL**: `{{baseUrl}}/api/teams/{{teamId}}/members/22222222-2222-2222-2222-222222222222`
- **Body (JSON)**:
```json
{
  "requestingUserId": "11111111-1111-1111-1111-111111111111"
}
```
- **Expected Response**: `204 No Content`

### 1.6. Cập nhật thông tin Team
- **Method**: `PUT`
- **URL**: `{{baseUrl}}/api/teams/{{teamId}}`
- **Body (JSON)**:
```json
{
  "name": "Backend Alpha Team",
  "description": "Đội Backend mới được update",
  "requestingUserId": "11111111-1111-1111-1111-111111111111"
}
```
- **Expected Response**: `204 No Content`

### 1.7. Xóa Team
- **Method**: `DELETE`
- **URL**: `{{baseUrl}}/api/teams/{{teamId}}`
- **Body (JSON)**:
```json
{
  "requestingUserId": "11111111-1111-1111-1111-111111111111"
}
```
- **Expected Response**: `204 No Content`

### 1.8. Lấy danh sách Dự án của Team
- **Method**: `GET`
- **URL**: `{{baseUrl}}/api/teams/{{teamId}}/projects`
- **Expected Response**: `200 OK` (Trả về danh sách dự án, sắp xếp mới nhất ở trên, bao gồm tên và avatar của người tạo).

---

## 2. Module Boards & Tasks

### 2.1. Tạo Dự án mới
- **Method**: `POST`
- **URL**: `{{baseUrl}}/api/projects`
- **Body (JSON)**:
```json
{
  "name": "E-Commerce Replatforming",
  "description": "Nâng cấp hệ thống core commerce",
  "teamId": "{{teamId}}",
  "ownerUserId": "11111111-1111-1111-1111-111111111111"
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
  "taskType": "Feature",
  "priority": "High",
  "assigneeUserId": null,
  "parentTaskId": null,
  "dueDate": "2026-05-25T17:00:00Z",
  "startDate": "2026-05-18T08:00:00Z",
  "sortOrder": null,
  "createdByUserId": "010d4d6a-5ec3-4674-9f79-bec93e52931c"
}
```
- **Expected Response**: `201 Created`

### 2.4. Di chuyển / Kéo thả Task (Sinh Activity Log ngầm)
- **Method**: `PUT`
- **URL**: `{{baseUrl}}/api/tasks/{{taskId}}/move`
- **Body (JSON)**:
```json
{
  "newBoardColumnId": "dc5f5679-39cc-4953-969a-28a2be354d4c",
  "newSortOrder": 0,
  "requestingUserId": "010d4d6a-5ec3-4674-9f79-bec93e52931c"
}
```
- **Expected Response**: `204 No Content`

### 2.5. Cập nhật chi tiết / Giao việc (Sinh Log & Gửi Thông báo Real-time)
- **Method**: `PATCH`
- **URL**: `{{baseUrl}}/api/tasks/{{taskId}}`
- **Body (JSON)**:
```json
{
  "assigneeUserId": "6a08aa6f-49a1-4499-8602-5e3e3f5c1e79",
  "dueDate": "2026-12-31T23:59:00Z",
  "priority": "Urgent",
  "requestingUserId": "010d4d6a-5ec3-4674-9f79-bec93e52931c"
}
```
- **Expected Response**: `204 No Content`

---

## 3. Module Collaboration (Bình luận & File)

### 3.1. Thêm bình luận (Sinh Log & Gửi Thông báo)
- **Method**: `POST`
- **URL**: `{{baseUrl}}/api/tasks/{{taskId}}/comments`
- **Body (JSON)**:
```json
{
  "content": "Tôi vừa xem qua tài liệu, thiết kế này khá ổn!",
  "requestingUserId": "010d4d6a-5ec3-4674-9f79-bec93e52931c"
}
```
- **Expected Response**: `201 Created`

### 3.2. Lấy danh sách bình luận
- **Method**: `GET`
- **URL**: `{{baseUrl}}/api/tasks/{{taskId}}/comments`
- **Expected Response**: `200 OK`

### 3.3. Xóa bình luận
- **Method**: `DELETE`
- **URL**: `{{baseUrl}}/api/tasks/{{taskId}}/comments/{{commentId}}`
- **Body (JSON)**:
```json
{
  "requestingUserId": "11111111-1111-1111-1111-111111111111"
}
```
- **Expected Response**: `204 No Content`

### 3.4. Upload File đính kèm vào bình luận
- **Method**: `POST`
- **URL**: `{{baseUrl}}/api/tasks/{{taskId}}/comments/{{commentId}}/attachments`
- **Body (Form-Data)**:
  - `file`: (Chọn 1 file ảnh hoặc tài liệu bất kỳ)
  - `requestingUserId`: `11111111-1111-1111-1111-111111111111`
- **Expected Response**: `201 Created`

---

## 4. Module Activities & Notifications

### 4.1. Lấy lịch sử hoạt động của Dự án (Timeline)
- **Method**: `GET`
- **URL**: `{{baseUrl}}/api/projects/{{projectId}}/activities`
- **Expected Response**: `200 OK` (Trả ra danh sách các hành động: tạo task mới, kéo thả, bình luận, giao việc mới nhất).

### 4.2. Lấy danh sách thông báo cá nhân
- **Method**: `GET`
- **URL**: `{{baseUrl}}/api/notifications?requestingUserId=33333333-3333-3333-3333-333333333333`
- **Expected Response**: `200 OK`

### 4.3. Đánh dấu thông báo đã đọc
- **Method**: `PATCH`
- **URL**: `{{baseUrl}}/api/notifications/{{notificationId}}/read`
- **Body (JSON)**:
```json
{
  "requestingUserId": "6a08aa6f-49a1-4499-8602-5e3e3f5c1e79"
}
```
- **Expected Response**: `204 No Content`

---

## 5. Hướng dẫn Test SignalR Real-time (Websocket)

Để quan sát cách hệ thống đẩy thông báo theo thời gian thực (Real-time) mà không cần tải lại trang, hãy làm theo các bước:

1. **Khởi tạo kết nối**: Mở Postman, chọn **New** -> **WebSocket Request**.
2. **Nhập URL**: `wss://localhost:5002/hubs/notifications` (hoặc dùng `ws://...` nếu bạn tắt HTTPS).
3. **Kết nối**: Bấm **Connect**.
4. *(Tùy chọn Bảo mật)*: Hiện tại class `NotificationHub` đã tạm tắt `[Authorize]` để dễ test. Nếu bạn bật lại, hãy sang tab **Headers** thêm Key: `Authorization` và Value: `Bearer <token_của_user_nhận>`.
5. **Kích hoạt sự kiện (Trigger)**:
   - Giữ tab Websocket đang mở.
   - Quay lại Postman mở tab REST (HTTP) mới.
   - Sử dụng API **PATCH Cập nhật chi tiết / Giao việc** (Mục 2.5) hoặc **POST Thêm bình luận** (Mục 3.1) dưới danh nghĩa là User số `11111111...` và gán cho User số `33333333...`.
   - Ngay lập tức mở lại tab Websocket, bạn sẽ thấy thông điệp dạng JSON với nhãn `ReceiveNotification` được đổ về từ máy chủ báo hiệu "Ai đó vừa giao việc cho bạn"!
