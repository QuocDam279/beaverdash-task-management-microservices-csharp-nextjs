# Kiến trúc Hệ thống Backend (Môi trường Phát triển - Local Development)

Hệ thống được thiết kế theo kiến trúc Microservices, bao gồm 3 service chính đảm nhận các nghiệp vụ riêng biệt. Giao tiếp giữa các client và các service được định tuyến qua API Gateway (YARP), trong khi các service giao tiếp bất đồng bộ với nhau thông qua RabbitMQ.

Để tối ưu hóa tài nguyên phần cứng máy tính và tăng tốc độ phát triển, hệ thống áp dụng mô hình **Hybrid Deployment**:
* **Hạ tầng nền tảng (Database, Message Queue):** Container hóa và chạy ngầm qua Docker để đảm bảo tính nhất quán và dễ quản lý.
* **Các Web Service & API Gateway:** Chạy trực tiếp trên máy host (Localhost) để tận dụng tính năng Hot Reload (`dotnet watch`, `uvicorn --reload`) và dễ dàng đặt Breakpoint Debug.

## 1. Thành phần hệ thống và Phân bổ Port

| Thành phần | Công nghệ | Port | Môi trường | Vai trò | Cơ sở dữ liệu (PostgreSQL) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Frontend Web** | Next.js (Tailwind CSS) | `3000` | Local Host | Giao diện người dùng (Dashboard, Task Management, AI Chat). | (Không có) |
| **API Gateway** | C# .NET 10 (YARP) | `5000` | Local Host | Entry point, routing, load balancing, SSL termination. | (Không có) |
| **Identity Service** | C# .NET 10 | `5001` | Local Host | Quản lý người dùng, xác thực, cấp phát token. | `beaverdash_identity_db` (Docker) |
| **ProjectManagement Service** | C# .NET 10 | `5002` | Local Host | Quản lý dự án, team, board, task, sub-task, comment và activity log. | `beaverdash_pm_db` (Docker) |
| **AIAssistant Service**| Python (FastAPI) | `5003` | Local Host | Trợ lý AI hỗ trợ tự động gợi ý và tạo công việc, công việc con trong dự án. | `beaverdash_ai_assistant_db` (Docker) |
| **Message Broker** | RabbitMQ | `5672`, `15672`| Docker | Quản lý Event Bus, truyền tải thông tin bất đồng bộ. | (Không có) |
| **Database Server** | PostgreSQL | `5432` | Docker | Lưu trữ dữ liệu tập trung cho cả 3 dịch vụ. | Gồm 3 DB nội bộ riêng biệt |

## 2. Giao tiếp (Communication)
- **Đồng bộ (Synchronous):** Client gọi HTTP/REST tới API Gateway tại `http://localhost:5000`. Tại đây, YARP Gateway sẽ forward request xuống các service tương ứng chạy tại local thông qua các địa chỉ:
  - Identity Service: `http://localhost:5001`
  - ProjectManagement Service: `http://localhost:5002`
  - AIAssistant Service: `http://localhost:5003`
- **Bất đồng bộ (Asynchronous):** Sử dụng **RabbitMQ** chạy trong môi trường Docker làm Event Bus. Các service chạy ở máy host kết nối vào địa chỉ `localhost:5672` để publish hoặc subscribe các sự kiện (Ví dụ: sự kiện `UserCreated` từ Identity Service).

---

# Cấu trúc thư mục (Monorepo)

Dưới đây là cấu trúc thư mục chi tiết, áp dụng **Clean Architecture chia làm 4 tầng kết hợp mẫu thiết kế CQRS (MediatR)** cho các service .NET và cấu trúc phân lớp chuẩn cho Python/FastAPI. Cấu trúc này giúp các AI Agent dễ dàng đọc hiểu, cô lập ngữ cảnh và sinh code chính xác cho từng chức năng độc lập.

```text
Beaverdash/
├── docker-compose.yml
├── .env                  # Biến môi trường thực (không commit lên Git)
├── .env.example          # Template env để chia sẻ với team
├── web/                  # Frontend Web Application (Next.js + Tailwind CSS)
├── BuildingBlocks/
│   └── EventBus.Messages/
│       └── Events/
├── ApiGateway/
│   ├── appsettings.json
│   ├── appsettings.Development.json
│   ├── Program.cs
│   ├── Extensions/
│   ├── Middlewares/
│   └── Transforms/
├── IdentityService/
│   └── src/
│       ├── Identity.Domain/
│       │   └── Entities/
│       │       └── User.cs
│       ├── Identity.Application/
│       │   └── Features/
│       │       └── Users/
│       ├── Identity.Infrastructure/
│       │   ├── Data/
│       │   └── Messaging/
│       └── Identity.API/
│           └── Controllers/
│               └── AuthController.cs
├── ProjectManagementService/
│   └── src/
│       ├── PM.Domain/
│       │   ├── Entities/
│       │   │   ├── User.cs
│       │   │   ├── Team.cs
│       │   │   ├── TeamMember.cs
│       │   │   ├── Project.cs
│       │   │   ├── BoardColumn.cs
│       │   │   ├── TaskItem.cs
│       │   │   ├── SubTask.cs
│       │   │   ├── Comment.cs
│       │   │   ├── Attachment.cs
│       │   │   ├── ActivityLog.cs
│       │   │   └── Notification.cs
│       │   └── Enums/
│       ├── PM.Application/
│       │   ├── Features/
│       │   │   ├── Projects/
│       │   │   │   ├── Project/
│       │   │   │   └── BoardColumn/
│       │   │   ├── Teams/
│       │   │   │   ├── Team/
│       │   │   │   └── TeamMember/
│       │   │   ├── Tasks/
│       │   │   │   ├── TaskItem/
│       │   │   │   ├── SubTask/
│       │   │   │   ├── Comment/
│       │   │   │   └── Attachment/
│       │   │   └── Notifications/
│       │   └── Contracts/
│       ├── PM.Infrastructure/
│       │   ├── Data/
│       │   ├── Repositories/
│       │   └── Messaging/
│       │       ├── Publisher/
│       │       └── Consumers/
│       └── PM.API/
│           ├── Controllers/
│           │   ├── ProjectsController.cs
│           │   ├── TeamsController.cs
│           │   ├── TasksController.cs
│           │   ├── SubTasksController.cs
│           │   └── NotificationsController.cs
│           └── Program.cs
└── AIAssistantService/
    ├── requirements.txt
    ├── Dockerfile
    └── app/
        ├── main.py
        ├── api/
        │   └── v1/
        │       ├── chat.py
        │       └── webhooks.py
        ├── core/
        │   ├── config.py
        │   ├── database.py
        │   └── security.py
        ├── models/
        │   ├── user.py
        │   ├── project.py
        │   ├── project_member.py
        │   └── chat.py
        ├── schemas/
        │   ├── chat_schema.py
        │   └── event_schema.py
        ├── services/
        │   ├── assistant_service.py
        │   └── chat_service.py
        └── worker/
            ├── consumer.py
            └── handlers.py