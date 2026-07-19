# Beaverdash - Hệ Thống Quản Lý Dự Án Kanban Kết Hợp Sprint & Trợ Lý AI

**Beaverdash** là một hệ thống quản lý công việc và dự án theo mô hình Kanban kết hợp Sprint, được xây dựng trên kiến trúc **Microservices** tách biệt, tích hợp với **Trợ lý AI thông minh** thông qua cơ chế Gọi công cụ (**Function Calling**).

---

## 🌐 Link Trực Tuyến & Tài Liệu Triển Khai (Live Demo & Production Links)

Hệ thống hiện tại đã được triển khai hoàn chỉnh trên môi trường Cloud (Vercel & Render). Bạn có thể truy cập và trải nghiệm trực tiếp thông qua các đường liên kết dưới đây:

*   🌐 **Giao diện Web (Frontend):** [https://beaverdash.xyz](https://beaverdash.xyz) (Đã deploy trên Vercel)
*   🔌 **API Gateway (Backend):** [https://api.beaverdash.xyz](https://api.beaverdash.xyz) (Đã deploy trên Render)
*   📑 **Tài liệu Hướng dẫn Triển khai Chi tiết:** [docs/deploy_render.md](file:///d:/beaverdash/docs/deploy_render.md)

---

## 1. Mục Tiêu Đồ Án

*   **Quản lý dự án trực quan (Kanban & Sprint):** Cung cấp bảng Kanban kéo thả mượt mà, phân chia dự án theo các Sprint (hoặc Product Backlog), phân tách công việc chi tiết thành Task chính và Sub-task (checklist), hỗ trợ làm việc nhóm và thảo luận trực tiếp.
*   **Trợ lý AI thông minh (Function Calling):** Tích hợp mô hình ngôn ngữ lớn (LLM - Google Gemini) để tự động hóa lập kế hoạch và khởi tạo công việc. AI giao tiếp với người dùng và có khả năng tự động gọi các API tạo Sprint, tạo Task, Sub-task, cập nhật trạng thái... tương tác trực tiếp với cơ sở dữ liệu dự án.
*   **Kiến trúc Microservices hiện đại:** Áp dụng các mẫu thiết kế **Clean Architecture, CQRS (MediatR), API Gateway (YARP), Event-driven Microservices (RabbitMQ)**, và cô lập dữ liệu hoàn toàn (**Database-per-Service**).
*   **Thời gian thực (Real-time):** Gửi thông báo tức thời đến thành viên nhóm qua **SignalR (Websockets)** khi có thay đổi trạng thái công việc hoặc bình luận mới.

---

## 2. Kiến Trúc Hệ Thống (System Architecture)

Dưới đây là sơ đồ kiến trúc hệ thống khi được triển khai thực tế trên môi trường Cloud (Vercel, Render và CloudAMQP):

```mermaid
graph TD
    Client["Client (Vercel Frontend) <br> beaverdash.xyz"]
    Gateway["API Gateway (Render Web Service) <br> api.beaverdash.xyz"]
    
    subgraph Render["Render Cloud Environment"]
        subgraph Services["Backend Microservices (Docker)"]
            Identity["Identity Service <br> (.NET 10)"]
            PM["Project Management Service <br> (.NET 10)"]
            AI["AI Assistant Service <br> (FastAPI)"]
        end
        
        subgraph Databases["PostgreSQL Databases (Render)"]
            DB_Identity[("beaverdash_identity_db")]
            DB_PM[("beaverdash_pm_db")]
            DB_AI[("beaverdash_ai_assistant_db")]
        end
    end
    
    Broker["RabbitMQ Message Broker <br> (CloudAMQP / Render Private)"]
    
    LLM["Google Gemini API <br> (Gemini SDK)"]
    SMTP["SMTP Mail Server <br> (Email Notification)"]
    
    %% Routing
    Client -->|HTTP / WebSockets| Gateway
    Gateway -->|/api/auth/**, /api/users/**| Identity
    Gateway -->|/api/projects/**, /api/teams/**, /uploads/**, /hubs/**| PM
    Gateway -->|/api/v1/chat/**| AI
    
    %% DB Connections
    Identity --> DB_Identity
    PM --> DB_PM
    AI --> DB_AI
    
    %% Async Events (RabbitMQ)
    Identity -->|Publish User Events| Broker
    Broker -->|Subscribe User Events| PM
    Broker -->|Subscribe User Events| AI
    
    %% Direct Sync & API Calls
    AI -.->|Tool Calls / REST API <br> HTTP POST/PATCH| PM
    
    %% External calls
    AI -->|LLM Chat & Reasoning| LLM
    PM -->|Send Email| SMTP
```

### Các Thành Phần Trong Hệ Thống:

1.  **Frontend Web (Next.js):** Đã được triển khai trên nền tảng **Vercel** tại địa chỉ chính thức [beaverdash.xyz](https://beaverdash.xyz). Giao diện sử dụng Next.js (React 19, Tailwind CSS v4) và SignalR Client để tương tác thời gian thực.
2.  **API Gateway ([ApiGateway](file:///d:/beaverdash/ApiGateway)):** Định tuyến duy nhất sử dụng **YARP Reverse Proxy** (.NET 10). Tiếp nhận các cuộc gọi từ client để phân phối đến các service tương ứng, đồng thời xử lý CORS và JWT offloading.
3.  **Identity Service ([IdentityService](file:///d:/beaverdash/IdentityService)):** Sử dụng .NET 10 C#, quản lý tài khoản người dùng, xác thực đăng nhập Google Sign-In và cấp phát JWT.
4.  **Project Management Service ([ProjectManagementService](file:///d:/beaverdash/ProjectManagementService)):** Nghiệp vụ cốt lõi quản lý Kanban board, sprints, tasks, sub-tasks, comments, attachments (lưu trữ file vật lý), notifications, activity logs.
5.  **AI Assistant Service ([AIAssistantService](file:///d:/beaverdash/AIAssistantService)):** Dịch vụ Python FastAPI tương tác với LLM thông qua Gemini SDK. Cung cấp API Chatbot hỗ trợ lên kế hoạch dự án bằng cơ chế gọi công cụ (**Function Calling**) tự động gửi REST API tạo/cập nhật Sprint và Task đến PM Service.
6.  **Database & Broker:** 
    *   **PostgreSQL:** Chia làm 3 database riêng biệt cho từng service.
    *   **RabbitMQ:** Message broker đồng bộ thông tin người dùng bất đồng bộ khi có sự kiện `UserCreatedEvent`. Triển khai trên **CloudAMQP** (hoặc dưới dạng Private Service trên Render).

---

## 3. Hướng Dẫn Triển Khai Lên Cloud (Cloud Deployment Guide)

Nếu bạn muốn triển khai lại hệ thống lên môi trường Render và Vercel:

1.  **Cơ sở dữ liệu (PostgreSQL):** Tạo PostgreSQL instance trên Render, sau đó tạo 3 database riêng biệt: `beaverdash_identity_db`, `beaverdash_pm_db`, `beaverdash_ai_assistant_db`.
2.  **Message Broker:** Tạo instance RabbitMQ miễn phí trên [CloudAMQP](https://www.cloudamqp.com/).
3.  **Backend Services:** Triển khai các dịch vụ lên Render dưới dạng **Web Service (Docker)** bằng cách sử dụng Dockerfile tương ứng của từng dịch vụ.
4.  **Frontend:** Triển khai project Next.js trong thư mục `web/` lên **Vercel** và cấu hình các biến môi trường thích hợp (`NEXT_PUBLIC_API_URL` trỏ về API Gateway trên Render).

*Xem tài liệu chi tiết tại:* **[Tài liệu Hướng dẫn Triển khai trên Render](file:///d:/beaverdash/docs/deploy_render.md)**.

---

## 4. Hướng Dẫn Chạy & Phát Triển Cục Bộ (Local Development Setup)

Để chạy thử nghiệm hoặc phát triển hệ thống Beaverdash dưới máy cục bộ, bạn có thể thực hiện theo một trong hai cách dưới đây:

### CÁCH 1: Chạy Backend Local Kết Hợp Với Frontend Vercel (Dành cho việc Demo nhanh)

Sử dụng trực tiếp Frontend đã deploy tại [beaverdash.xyz](https://beaverdash.xyz) kết nối về Backend chạy dưới máy local của bạn thông qua Cloudflare Tunnel:

1.  Cài đặt công cụ `cloudflared` trên máy tính.
2.  Sao chép file cấu hình `.env.example` thành `.env` ở thư mục gốc và điền đầy đủ thông số (đặc biệt là `GEMINI_API_KEY`).
3.  Chạy file:
    ```cmd
    start.bat
    ```
    *Script này sẽ khởi động toàn bộ hạ tầng cơ sở dữ liệu và các microservices backend trong Docker Compose, đồng thời kích hoạt tunnel chuyển tiếp traffic từ internet (`api.beaverdash.xyz`) về Gateway cổng 5000 tại máy của bạn.*
4.  Truy cập trực tiếp [https://beaverdash.xyz](https://beaverdash.xyz) để thao tác và demo.

---

### CÁCH 2: Chạy Cục Bộ Hoàn Toàn (Chạy Hybrid)

#### 1. Khởi động hạ tầng Docker
Chạy lệnh compose tại thư mục gốc để khởi động DB & RabbitMQ:
```bash
docker compose up -d postgres rabbitmq
```

#### 2. Chạy các service Backend C# (.NET)
Mở các cửa sổ terminal riêng biệt và chạy:
*   **API Gateway (Port 5000):**
    ```bash
    cd ApiGateway
    dotnet run
    ```
*   **Identity Service (Port 5001):**
    ```bash
    cd IdentityService/src/Identity.API
    dotnet ef database update
    dotnet run
    ```
*   **Project Management Service (Port 5002):**
    ```bash
    cd ProjectManagementService/src/PM.API
    dotnet ef database update
    dotnet run
    ```

#### 3. Chạy AI Assistant Service (FastAPI - Port 5003)
Mở terminal tại thư mục `AIAssistantService`:
```bash
cd AIAssistantService
python -m venv .venv
# Kích hoạt môi trường ảo (.venv)
.venv\Scripts\activate      # Windows
source .venv/bin/activate   # macOS/Linux

pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 5003 --reload
```

#### 4. Chạy Frontend Next.js Local (Port 3000)
Mở terminal tại thư mục `web`:
```bash
cd web
npm install
npm run dev
```
Truy cập [http://localhost:3000](http://localhost:3000) để chạy thử trên local.

---

## 5. Các Phần Mềm Cần Thiết (Prerequisites)

*   **Docker / Docker Desktop:** Để chạy PostgreSQL và RabbitMQ.
*   **SDK .NET 10.0:** Dành cho các dịch vụ Backend (.NET).
*   **Node.js (v18+):** Dành cho Frontend Next.js (nếu chạy local).
*   **Python 3.11+:** Dành cho dịch vụ AI Assistant (nếu chạy local).
*   **Cloudflared CLI:** Để chạy đường ống kết nối API Gateway với môi trường Production khi chạy demo cục bộ.
