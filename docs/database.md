### 1. Identity Service

1. `users`
   - `id (uuid, pk)`
   - `google_id (varchar, unique, not null)`
   - `email (varchar, unique, not null)`
   - `display_name (varchar, not null)`
   - `avatar (varchar, nullable)`
   - `created_at (timestamp)`
   - `updated_at (timestamp)`

---

### 2. ProjectManagement Service

2. `users`
   - `id (uuid, pk)`
   - `email (varchar, unique, not null)`
   - `display_name (varchar, not null)`
   - `avatar (varchar, nullable)`

3. `teams`
   - `id (uuid, pk)`
   - `name (varchar, not null)`
   - `description (text, nullable)`
   - `owner_user_id (uuid, fk)`
   - `created_at (timestamp)`
   - `updated_at (timestamp)`

4. `team_members`
   - `team_id (uuid, pk, fk)`
   - `user_id (uuid, pk, fk)`
   - `role (varchar, not null)`
   - `joined_at (timestamp, default now())`

5. `projects`
   - `id (uuid, pk)`
   - `team_id (uuid, fk, nullable)`
   - `name (varchar, not null)`
   - `description (text, nullable)`
   - `status (varchar)` -- Chưa bắt đầu, Đang thực hiện, Tạm dừng, Đã hoàn thành --
   - `start_date (timestamp, nullable)`
   - `due_date (timestamp, nullable)`
   - `is_public (boolean, default false)`
   - `share_token (varchar, nullable, unique)`
   - `created_by_user_id (uuid, fk)`
   - `created_at (timestamp)`
   - `updated_at (timestamp)`

6. `board_columns`
   - `id (uuid, pk)`
   - `project_id (uuid, fk)`
   - `name (varchar, not null)` -- Mặc định: Chưa thực hiện, Đang thực hiện, Đã hoàn thành
   - `position (integer, not null)`
   - `wip_limit (integer, nullable)`
   - `created_at (timestamp)`
   - `updated_at (timestamp)`

7. `tasks`
   - `id (uuid, pk)`
   - `board_column_id (uuid, fk)`
   - `assignee_user_id (uuid, fk, nullable)`
   - `title (varchar, not null)`
   - `description (text, nullable)`
   - `priority (varchar)` -- Thấp, Trung bình, Cao, Khẩn cấp
   - `due_date (timestamp, nullable)`
   - `start_date (timestamp, nullable)`
   - `sort_order (double precision)`
   - `completed_at (timestamp, nullable)`
   - `deleted_at (timestamp, nullable)`
   - `created_by_user_id (uuid, fk)`
   - `assigned_at (timestamp, nullable)`
   - `created_at (timestamp)`
   - `updated_at (timestamp)`

8. `sub_tasks`
   - `id (uuid, pk)`
   - `task_id (uuid, fk, not null)`
   - `assignee_user_id (uuid, fk, nullable)`
   - `title (varchar, not null)`
   - `is_completed (boolean, default false)`
   - `start_date (timestamp, nullable)`
   - `due_date (timestamp, nullable)`
   - `sort_order (integer)`
   - `created_at (timestamp)`
   - `updated_at (timestamp)`
   - `deleted_at (timestamp, nullable)`

9. `comments`
   - `id (uuid, pk)`
   - `user_id (uuid, fk)`
   - `sub_task_id (uuid, fk)`
   - `content (text, not null)`
   - `created_at (timestamp)`
   - `updated_at (timestamp)`

10. `attachments`
    - `id (uuid, pk)`
    - `comment_id (uuid, fk)`
    - `file_name (varchar, not null)`
    - `file_url (varchar, not null)`
    - `file_type (varchar)`
    - `file_size_bytes (bigint)`
    - `created_at (timestamp)`

11. `activity_log`
    - `id (uuid, pk)`
    - `project_id (uuid, fk)`
    - `user_id (uuid, fk)`
    - `entity_type (varchar)`
    - `entity_id (uuid)`
    - `action_type (varchar)`
    - `old_value (jsonb, nullable)`
    - `new_value (jsonb, nullable)`
    - `created_at (timestamp)`

12. `notifications`
    - `id (uuid, pk)`
    - `user_id (uuid, fk)`
    - `actor_user_id (uuid, fk)`
    - `type (varchar)`
    - `content (text)`
    - `action_url (varchar, nullable)`
    - `is_read (boolean, default false)`
    - `is_sent_via_email (boolean, default false)`
    - `email_sent_at (timestamp, nullable)`
    - `created_at (timestamp)`

---

### 3. DocumentIntelligence Service

13. `users`
    - `id (uuid, pk)`
    - `email (varchar, unique, not null)`
    - `display_name (varchar, not null)`
    - `avatar (varchar, nullable)`

14. `projects`
    - `id (uuid, pk)`
    - `name (varchar, not null)`
    - `description (text, nullable)`
    - `status (varchar)`

15. `project_members`
    - `project_id (uuid, pk, fk)`
    - `user_id (uuid, pk, fk)`
    - `status (varchar)`
    - `joined_at (timestamp, default now())`

16. `documents`
   - `id (uuid, pk)`
   - `user_id (uuid, fk)`
   - `project_id (uuid, fk)`
   - `source_type (varchar)`
   - `file_name (varchar, not null)`
   - `mime_type (varchar)`
   - `storage_uri (varchar, not null)`
   - `file_size (bigint, nullable)` -- Thêm mới để validate dung lượng file và quota hệ thống
   - `page_count (integer, nullable)` -- Thêm mới để đếm số trang (PDF/DOCX) phục vụ tracking
   - `checksum (varchar, nullable)` -- Thêm mới mã hash SHA-256 để kiểm soát cơ chế Checksum Guard (chặn re-chunking trùng lặp)
   - `status (document_status, enum)` -- Chuyển từ varchar sang ENUM ('pending', 'processing', 'completed', 'failed') để tránh lỗi typo
   - `error_message (text, nullable)` -- Thêm mới để lưu vết lý do cụ thể khi xử lý file thất bại
   - `created_at (timestamp)`
   - `updated_at (timestamp)`

17. `document_chunks`
   - `id (uuid, pk)`
   - `project_id (uuid, fk)`
   - `document_id (uuid, fk, ON DELETE CASCADE)` -- Bổ sung khóa ngoại kèm ràng buộc xóa tự động (Cascade Delete) để tránh rác DB
   - `chunk_index (integer)`
   - `content (text, not null)`
   - `token_count (integer, not null)` -- Thêm mới để biết trước số token, tối ưu hóa việc tính toán context window lúc compose prompt chat
   - `embedding (vector)` -- Kiểu dữ liệu vector lưu dense embedding (Cấu hình kích thước tùy theo model BGE-M3)
   - `sparse_embedding (jsonb, nullable)`
   - `metadata (jsonb, nullable)`
   - `created_at (timestamp)`
   - `updated_at (timestamp)` -- Thêm mới để hỗ trợ kiểm toán (audit) hoặc debug khi tiến hành cập nhật/nạp lại phân mảnh

18. `ai_chat_sessions`
    - `id (uuid, pk)`
    - `user_id (uuid, fk)`
    - `project_id (uuid, fk)`
    - `title (varchar, nullable)`
    - `created_at (timestamp)`
    - `updated_at (timestamp)`

19. `ai_chat_messages`
    - `id (uuid, pk)`
    - `session_id (uuid, fk)`
    - `role (varchar)`
    - `content (text)`
    - `used_documents (jsonb, nullable)`
    - `tool_calls (jsonb, nullable)`
    - `tool_results (jsonb, nullable)`
    - `created_at (timestamp)`