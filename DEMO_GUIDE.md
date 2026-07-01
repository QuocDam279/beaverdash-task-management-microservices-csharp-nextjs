# HƯỚNG DẪN CHẠY DEMO HỆ THỐNG BEAVERDASH

Tài liệu này hướng dẫn cách chạy thử nghiệm và demo hệ thống Beaverdash bằng cách kết hợp các container backend chạy cục bộ và giao diện Frontend đã triển khai trên **Vercel** ([beaverdash.xyz](https://beaverdash.xyz)).

---

## BƯỚC 1: MỞ DOCKER DESKTOP
Hệ thống Beaverdash chạy các dịch vụ lưu trữ dữ liệu (PostgreSQL), truyền tin (RabbitMQ) và toàn bộ các Backend Microservices dưới dạng container Docker.

1. Tìm và mở ứng dụng **Docker Desktop** trên máy tính của bạn.
2. Đợi cho đến khi trạng thái ở góc dưới bên trái của Docker Desktop chuyển sang **màu xanh lá cây (Engine running)**.

---

## BƯỚC 2: CHUẨN BỊ FILE CẤU HÌNH MÔI TRƯỜNG (.env)
Các container cần các biến môi trường cấu hình trước khi khởi chạy.

1. Tại thư mục gốc của dự án (`beaverdash`), tìm file `.env.example`.
2. Tạo một bản sao và đổi tên thành `.env`.
3. Mở file `.env` vừa tạo và điền các giá trị thực tế của bạn:
   * `POSTGRES_PASSWORD`: Điền mật khẩu database (ví dụ: `password`).
   * `JWT_SECRET`: Khóa bảo mật JWT (ví dụ: một chuỗi dài bảo mật ngẫu nhiên).
   * `GEMINI_API_KEY`: **Bắt buộc** điền API Key từ Google AI Studio để Trợ lý AI thực hiện chức năng gọi công cụ (Function Calling).
   * `RABBITMQ_USER` & `RABBITMQ_PASS`: Tài khoản RabbitMQ (mặc định: `guest`).

---

## BƯỚC 3: KHỞI ĐỘNG HỆ THỐNG BẰNG FILE `start.bat`
Đối với môi trường hệ điều hành Windows, hệ thống đã cung cấp sẵn file `start.bat` để tự động hóa việc khởi chạy backend và kết nối trực tiếp với Frontend trên Vercel.

1. Nhấp đúp chuột vào file [start.bat](file:///d:/beaverdash/start.bat) (hoặc chạy từ command prompt bằng cách gõ `start.bat`).
2. Script này sẽ thực hiện 2 công việc:
   * **Khởi chạy Backend (Docker Compose):** Chạy ngầm các container bao gồm PostgreSQL, RabbitMQ, Identity Service, Project Management Service, AI Assistant Service và API Gateway.
   * **Chạy Cloudflare Tunnel:** Sử dụng công cụ `cloudflared` để ánh xạ API Gateway (`http://localhost:5000`) lên tên miền phụ an toàn `api.beaverdash.xyz`. Nhờ đó, Frontend chạy trên Vercel có thể kết nối an toàn với máy cục bộ của bạn.
3. **Lưu ý:** Giữ nguyên cửa sổ Command Prompt của `start.bat` đang chạy để duy trì hệ thống và kết nối mạng.

---

## BƯỚC 4: TRẢI NGHIỆM DEMO TRÊN BROWSER

Khi hệ thống đã chạy qua script thành công, hãy truy cập:

1. **Giao diện quản lý Kanban & Sprints (Frontend trên Vercel):** Truy cập [https://beaverdash.xyz](https://beaverdash.xyz). Giao diện này sẽ tự động giao tiếp với API Gateway local của bạn qua đường dẫn phụ.
2. **Trang quản lý hàng đợi RabbitMQ:** Truy cập [http://localhost:15672](http://localhost:15672) (User/Pass mặc định: `guest`/`guest`).

---

*Lưu ý (Chạy Frontend Local nếu cần thiết):* Nếu bạn muốn chạy giao diện hoàn toàn cục bộ trên máy mà không dùng Vercel:
1. Mở Terminal mới tại thư mục `web`: `cd web`
2. Cài đặt và khởi chạy: `npm install && npm run dev`
3. Truy cập: [http://localhost:3000](http://localhost:3000)
