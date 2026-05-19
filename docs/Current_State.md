# Cập nhật Trạng thái Dự án: Beaverdash Monorepo
*(Tài liệu này tổng hợp mã nguồn hiện tại đã được implement, dùng để làm Context cho các session tiếp theo)*

## 1. Môi trường & Infrastructure
- **Framework**: .NET 10.0
- **Kiến trúc**: Clean Architecture, CQRS (MediatR), Event-driven Microservices (RabbitMQ).
- **Docker**: `docker-compose.yml` đang chạy PostgreSQL (5432) và RabbitMQ (5672/15672).
- **Thư viện chính**: `MediatR`, `EF Core PostgreSQL`, `MassTransit` (đang **chốt ở ver 8.3.0** để tránh dính lỗi License của v9), `System.IdentityModel.Tokens.Jwt`, `YARP`, `SignalR`.
- **Database**: Đã chạy thành công EF Core Migrations (`InitialIdentityCreate`, `InitialPMCreate`) và tạo đủ bảng dưới Postgres.

## 2. API Gateway (`ApiGateway`)
- **Port**: `5000`
- Chạy bằng `YARP Reverse Proxy`.
- Đã cấu hình `appsettings.Development.json` định tuyến các route:
  - `/api/auth/**`, `/api/users/**` -> `identity-cluster` (5001)
  - `/api/projects/**`, `/api/teams/**`, `/api/tasks/**`, `/api/boardcolumns/**`, `/api/notifications/**`, `/hubs/**` -> `pm-cluster` (5002)

## 3. Building Blocks (`EventBus.Messages`)
- Chứa các class giao tiếp liên Service.
- Các event đã được tạo (Standard class/record tránh property hiding): `IntegrationBaseEvent`, `UserCreatedEvent`, `UserUpdatedEvent`.

## 4. Identity Service (`IdentityService`)
- **Port**: `5001`
- **Domain**: Entity `User` (pure POCO).
- **Application & Infrastructure**:
  - Tách Interface `IIdentityDbContext` để tránh Circular Dependency.
  - Cấu hình EF Core Fluent API cho Postgres (ưu tiên column types `uuid`, `timestamp with time zone`).
  - Triển khai `JwtTokenGenerator`.
  - Khai báo MassTransit RabbitMQ (Producer).
- **API (Controllers)**:
  - `AuthController`: Nhận `POST /api/auth/login` (CQRS `LoginQuery`). Trả về JWT.
  - `UsersController`: Nhận `POST /api/users` (CQRS `CreateUserCommand`). Lưu User vào Identity DB + Publish `UserCreatedEvent` lên RabbitMQ.

## 5. Project Management Service (`ProjectManagementService`)
- **Port**: `5002`
- **Domain**: 10 Entities (`User`, `Team`, `TeamMember`, `Project`, `BoardColumn`, `TaskItem`, `Comment`, `Attachment`, `ActivityLog`, `Notification`). Tất cả các Entity chính đã được kế thừa từ `BaseEntity` để hỗ trợ cơ chế **Domain Events**.
- **Application & Infrastructure**:
  - `IPMDbContext`: Override `SaveChangesAsync` để tự động Publish Domain Events trước khi lưu.
  - `SignalRNotificationService`: Được đóng gói theo chuẩn Clean Architecture thông qua interface `INotificationService` nằm ở tầng Application.
  - Tích hợp thành công `MediatR.Contracts` vào tầng Domain. Cập nhật `Microsoft.AspNetCore.App` FrameworkReference cho Application layer.
- **Nghiệp vụ đã hoàn thành (Controllers)**:
  - **Teams Module**: `POST` (Tạo team tự nhận leader), `POST` (Thêm member), `PUT` (Đổi role member), `DELETE` (Xóa member, chặn xóa leader cuối), `GET` (Chi tiết team kèm User), `PUT` (Cập nhật thông tin team), `DELETE` (Xóa team, chặn xóa nếu có Project).
  - **Projects Module**: `POST` tạo dự án, `GET` lấy Board Kanban, `GET` lịch sử hoạt động (Timeline).
  - **Tasks Module**: 
    - Kéo thả Task (`PUT /move`) - tự tính toán lại Sort Order & check WIP Limit. Tự động sinh Log.
    - Cập nhật nâng cao (`PATCH`) - cập nhật các field tùy chọn. Tự động sinh Log và Bắn Thông báo nếu đổi người gán.
  - **Collaboration Module**: `POST/GET/DELETE` Text Comments. `POST` Attachment file đính kèm (sử dụng IFormFile, lưu vật lý, gen tên unique).
  - **Domain Events & Side Effects**: 
    - Đã cài đặt `CommentAddedEvent`, `TaskAssignedEvent`, `TaskMovedEvent`.
    - Sinh tự động `ActivityLog` (ghi lịch sử hành động) và lưu DB `Notifications` một cách ngầm định (background).
    - Tích hợp thành công **SignalR Real-time Notification**: Server chủ động bắn JSON thông báo qua Websocket về cho người nhận theo đúng logic nghiệp vụ (ví dụ: chặn thông báo nếu người thao tác tự assign chính mình).
  - **Notifications Module**: `GET` danh sách thông báo cá nhân, `PATCH` đánh dấu đã đọc (bảo mật kiểm tra quyền đọc của User).

## Ghi chú cho AI Session Tiếp Theo:
1. Nền tảng hạ tầng PM (DB, RabbitMQ, Domain Events, SignalR) đã chạy rất ổn định và tuân thủ chặt chẽ kiến trúc Clean Architecture.
2. Từ lúc này, hãy focus vào việc hoàn thiện logic nghiệp vụ (như Analytics, Document Intelligence) hoặc thiết kế Database/Service mới nếu cần thiết.
3. LUÔN chú ý dùng `IPMDbContext` hoặc `IIdentityDbContext` trong tầng Application (CQRS Handlers) thay vì dùng trực tiếp class implementation `DbContext` để tránh lỗi Circular Dependency giữa App và Infra.
