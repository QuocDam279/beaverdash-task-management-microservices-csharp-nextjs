# Cập nhật Trạng thái Dự án: Beaverdash Monorepo
*(Tài liệu này tổng hợp mã nguồn hiện tại đã được implement, dùng để làm Context cho các session tiếp theo)*

## 1. Môi trường & Infrastructure
- **Framework**: .NET 10.0
- **Kiến trúc**: Clean Architecture, CQRS (MediatR), Event-driven Microservices (RabbitMQ).
- **Docker**: `docker-compose.yml` đang chạy PostgreSQL (5432) và RabbitMQ (5672/15672).
- **Thư viện chính**: `MediatR`, `EF Core PostgreSQL`, `MassTransit` (đang **chốt ở ver 8.3.0** để tránh dính lỗi License của v9), `System.IdentityModel.Tokens.Jwt`, `YARP`.
- **Database**: Đã chạy thành công EF Core Migrations (`InitialIdentityCreate`, `InitialPMCreate`) và tạo đủ bảng dưới Postgres.

## 2. API Gateway (`ApiGateway`)
- **Port**: `5000`
- Chạy bằng `YARP Reverse Proxy`.
- Đã cấu hình `appsettings.Development.json` định tuyến các route:
  - `/api/auth/**`, `/api/users/**` -> `identity-cluster` (5001)
  - `/api/projects/**`, `/api/teams/**`, `/api/tasks/**`, `/api/boardcolumns/**` -> `pm-cluster` (5002)

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
- **Domain**: 10 Entities: `User` (replica), `Team`, `TeamMember`, `Project`, `BoardColumn`, `TaskItem`, `Comment`, `Attachment`, `ActivityLog`, `Notification`. (Thuộc tính `TaskItem` có `BoardColumnId` và `AssigneeUserId`. `BoardColumn` có `Position` và `WipLimit`).
- **Application & Infrastructure**:
  - Tách Interface `IPMDbContext` để tránh Circular Dependency.
  - Cấu hình toàn bộ EF Core Fluent API cho 10 Entities đảm bảo đúng Constraint và Relationships N-1, N-N.
  - Cấu hình Consumer: `UserCreatedConsumer` (lắng nghe qua MassTransit, tự động sync User vào PM DB).
- **API (Controllers)**:
  - `ProjectsController`: Nhận `POST /api/projects` (`CreateProjectCommand`).
  - `BoardColumnsController`: Nhận `POST /api/boardcolumns` (`CreateBoardColumnCommand`).
  - `TasksController`: Nhận `POST /api/tasks` (`CreateTaskCommand`).

## Ghi chú cho AI Session Tiếp Theo:
1. Không cần thiết lập lại base structure, database config hay RabbitMQ nữa vì tất cả đang hoạt động trơn tru.
2. Từ lúc này, hãy focus vào việc hoàn thiện logic nghiệp vụ (Queries / Endpoints GET, PUT, DELETE) hoặc bổ sung thêm Service mới (như `DocumentIntelligenceService`).
3. LUÔN chú ý dùng `IPMDbContext` hoặc `IIdentityDbContext` trong tầng Application (CQRS Handlers) thay vì dùng trực tiếp class implementation `DbContext` để tránh lỗi Circular Dependency giữa App và Infra.
