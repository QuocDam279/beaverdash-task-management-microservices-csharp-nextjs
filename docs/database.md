### 1. Identity Service

1. `users`
   - `id (uuid, pk)`
   - `google_id (varchar, unique, not null)`
   - `email (varchar, unique, not null)`
   - `display_name (varchar, not null)`
   - `avatar (varchar, nullable)`
   - `created_at (timestamp with time zone)`
   - `updated_at (timestamp with time zone)`

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
   - `owner_user_id (uuid, fk, not null)`
   - `created_at (timestamp with time zone)`
   - `updated_at (timestamp with time zone)`

4. `team_members`
   - `team_id (uuid, pk, fk)`
   - `user_id (uuid, pk, fk)`
   - `role (varchar, not null)`
   - `joined_at (timestamp with time zone, default now())`

5. `projects`
   - `id (uuid, pk)`
   - `team_id (uuid, fk, nullable)`
   - `name (varchar, not null)`
   - `description (text, nullable)`
   - `progress (integer, default 0)` -- Tiến độ dự án (0-100%) --
   - `start_date (timestamp with time zone, nullable)`
   - `due_date (timestamp with time zone, nullable)`
   - `is_public (boolean, default false)`
   - `share_token (varchar, nullable, unique)`
   - `created_by_user_id (uuid, fk, not null)`
   - `created_at (timestamp with time zone)`
   - `updated_at (timestamp with time zone)`

6. `board_columns`
   - `id (uuid, pk)`
   - `project_id (uuid, fk, not null)`
   - `name (varchar, not null)`
   - `position (integer, not null)`
   - `wip_limit (integer, nullable)`
   - `is_done (boolean, default false)`
   - `created_at (timestamp with time zone)`
   - `updated_at (timestamp with time zone)`

7. `tasks`
   - `id (uuid, pk)`
   - `board_column_id (uuid, fk, not null)`
   - `sprint_id (uuid, fk, nullable)`
   - `title (varchar, not null)`
   - `description (text, nullable)`
   - `priority (varchar, nullable)` -- Required (Bắt buộc), Important (Quan trọng), Extended (Mở rộng) --
   - `due_date (timestamp with time zone, nullable)`
   - `start_date (timestamp with time zone, nullable)`
   - `sort_order (double precision)`
   - `created_by_user_id (uuid, fk, not null)`
   - `completed_at (timestamp with time zone, nullable)`
   - `deleted_at (timestamp with time zone, nullable)`
   - `created_at (timestamp with time zone)`
   - `updated_at (timestamp with time zone)`

8. `sub_tasks`
   - `id (uuid, pk)`
   - `task_id (uuid, fk, not null)`
   - `assignee_user_id (uuid, fk, nullable)`
   - `title (varchar, not null)`
   - `is_completed (boolean, default false)`
   - `due_date (timestamp with time zone, nullable)`
   - `priority (varchar, nullable)` -- Low (Thấp), Medium (Trung bình), High (Cao) --
   - `sort_order (integer, nullable)`
   - `created_at (timestamp with time zone)`
   - `updated_at (timestamp with time zone)`
   - `deleted_at (timestamp with time zone, nullable)`

9. `comments`
   - `id (uuid, pk)`
   - `user_id (uuid, fk, not null)`
   - `sub_task_id (uuid, fk, not null)`
   - `content (text, not null)`
   - `created_at (timestamp with time zone)`
   - `updated_at (timestamp with time zone)`

10. `attachments`
    - `id (uuid, pk)`
    - `comment_id (uuid, fk, not null)`
    - `file_name (varchar, not null)`
    - `file_url (varchar, not null)`
    - `file_type (varchar, nullable)`
    - `file_size_bytes (bigint, nullable)`
    - `created_at (timestamp with time zone)`

11. `project_documents`
    - `id (uuid, pk)`
    - `project_id (uuid, fk, not null)`
    - `file_name (varchar, not null)`
    - `file_url (varchar, not null)`
    - `file_type (varchar, nullable)`
    - `file_size_bytes (bigint, nullable)`
    - `uploaded_by_user_id (uuid, fk, not null)`
    - `created_at (timestamp with time zone)`

12. `activity_log`
    - `id (uuid, pk)`
    - `project_id (uuid, fk, not null)`
    - `user_id (uuid, fk, not null)`
    - `entity_type (varchar, nullable)`
    - `entity_id (uuid, nullable)`
    - `action_type (varchar, nullable)`
    - `old_value (jsonb, nullable)`
    - `new_value (jsonb, nullable)`
    - `created_at (timestamp with time zone)`

13. `notifications`
    - `id (uuid, pk)`
    - `user_id (uuid, fk, not null)`
    - `actor_user_id (uuid, fk, not null)`
    - `type (varchar, nullable)`
    - `content (text, nullable)`
    - `action_url (varchar, nullable)`
    - `is_read (boolean, default false)`
    - `is_sent_via_email (boolean, default false)`
    - `email_sent_at (timestamp with time zone, nullable)`
    - `created_at (timestamp with time zone)`

14. `outbox_messages`
    - `id (uuid, pk)`
    - `type (varchar(255), not null)`
    - `content (text, not null)`
    - `occurred_on_utc (timestamp with time zone, not null)`
    - `processed_on_utc (timestamp with time zone, nullable)`
    - `error (text, nullable)`
    - `retry_count (integer, default 0)`

15. `project_shares`
    - `id (uuid, pk)`
    - `project_id (uuid, fk, not null)`
    - `recipient_email (varchar, not null)`
    - `shared_by_user_id (uuid, fk, not null)`
    - `created_at (timestamp with time zone)`
    - `updated_at (timestamp with time zone)`

16. `sprints`
    - `id (uuid, pk)`
    - `project_id (uuid, fk, not null)`
    - `name (varchar, not null)`
    - `goal (text, nullable)`
    - `status (varchar, not null)` -- Future (Chưa bắt đầu), Active (Đang hoạt động), Closed (Đã kết thúc) --
    - `start_date (timestamp with time zone)`
    - `end_date (timestamp with time zone)`
    - `created_at (timestamp with time zone)`
    - `updated_at (timestamp with time zone)`

17. `chat_messages`
    - `id (uuid, pk)`
    - `sender_id (uuid, fk, not null)`
    - `project_id (uuid, fk, nullable)`
    - `team_id (uuid, fk, nullable)`
    - `content (text, not null)`
    - `file_url (text, nullable)`
    - `file_name (text, nullable)`
    - `file_type (text, nullable)`
    - `file_size (bigint, nullable)`
    - `created_at (timestamp with time zone)`
    - `updated_at (timestamp with time zone)`

---

### 3. AIAssistant Service

18. `users`
    - `id (uuid, pk)`
    - `email (varchar, unique, not null)`
    - `display_name (varchar, not null)`
    - `avatar (varchar, nullable)`

19. `projects`
    - `id (uuid, pk)`
    - `name (varchar, not null)`
    - `description (text, nullable)`
    - `status (varchar, nullable)`

20. `project_members`
    - `project_id (uuid, pk, fk)`
    - `user_id (uuid, pk, fk)`

21. `ai_chat_sessions`
    - `id (uuid, pk)`
    - `user_id (uuid, fk, not null)`
    - `project_id (uuid, fk, not null)`
    - `title (varchar, nullable)`
    - `created_at (timestamp, default now())`
    - `updated_at (timestamp, default now())`

22. `ai_chat_messages`
    - `id (uuid, pk)`
    - `session_id (uuid, fk, not null)`
    - `role (varchar, not null)` -- 'user', 'assistant', 'system', 'tool' --
    - `content (text, nullable)`
    - `tool_calls (jsonb, nullable)`
    - `tool_results (jsonb, nullable)`
    - `thought_signature (varchar, nullable)`
    - `created_at (timestamp, default now())`