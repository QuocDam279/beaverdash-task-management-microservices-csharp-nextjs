markdown_content = """# Quy Tắc Vận Hành Xác Thực Trong Kiến Trúc Microservices (Beaverdash)

Tài liệu này định nghĩa tập hợp các quy tắc kiến trúc và giao tiếp bảo mật giữa 3 thành phần: **API Gateway (YARP)**, **Identity Service**, và **ProjectManagement Service** (cùng các service con tương tự). Hệ thống áp dụng mô hình **Authentication Offloading (Ủy quyền xác thực tại Gateway)** kết hợp với **Trust Domain (Vùng tin cậy nội bộ)**.

---

## 1. Nguyên Lý Tổng Quan (Authentication Offloading)

1. **API Gateway** đóng vai trò là "Người gác cổng" duy nhất tiếp xúc với Internet. Mọi Request từ Client (Next.js, Postman) bắt buộc phải đi qua Gateway.
2. **Identity Service** đóng vai trò là "Trung tâm cấp phát danh tính", chịu trách nhiệm xác thực người dùng (đăng nhập bằng Google) và ký số sinh ra JWT Token.
3. **ProjectManagement Service** (và các service nghiệp vụ khác) nằm trong vùng mạng nội bộ an toàn (Trust Zone), **không trực tiếp kiểm tra chữ ký JWT** mà tin tưởng hoàn toàn vào kết quả xác thực chuyển tiếp từ API Gateway.

---

## 2. Quy Tắc Chi Tiết Cho Từng Thành Phần

### Quy tắc 2.1: Đối với Identity Service (Bộ phận cấp phát)
* **Trách nhiệm:** Xác thực thông tin đăng nhập và sinh JWT Token chuẩn hóa.
* **Cấu hình Token:** Token sinh ra bắt buộc phải chứa các thông tin định danh cốt lõi (Claims) bao gồm:
  * `sub` (Subject): Chứa `User.Id` dưới dạng chuỗi (Guid string). Đây là quy chuẩn quốc tế để định danh User.
  * `email`: Chứa email của người dùng.
  * `name`: Chứa tên hiển thị (`DisplayName`).
* **Đồng bộ cấu hình:** Các thông số `Issuer` (Mặc định: `BeaverdashIdentity`), `Audience` (Mặc định: `BeaverdashApp`), và chuỗi bí mật mã hóa `JWT_SECRET` (đọc từ file `.env`) phải được giữ đồng nhất tuyệt đối với API Gateway.

### Quy tắc 2.2: Đối với API Gateway (Bộ phận kiểm soát)
* **Trách nhiệm:** Chặn đứng request không hợp lệ và chuyển dịch ngữ cảnh người dùng.
* **Cấu hình Middleware:** Kích hoạt bắt buộc hai middleware `app.UseAuthentication()` và `app.UseAuthorization()` trước khi gọi `app.MapReverseProxy()`.
* **Cấu hình Routing (YARP):** Tất cả các Route hướng tới các service con cần bảo mật bắt buộc phải được gắn thuộc tính `"AuthorizationPolicy": "RequireAuthenticatedUser"`. Nếu request không có Token hoặc Token hết hạn, Gateway phải trả về ngay lập tức mã lỗi `401 Unauthorized`.
* **Cơ chế Chuyển tiếp (YARP Transforms):** Sau khi xác thực Token thành công, Gateway có nhiệm vụ giải mã Token, trích xuất giá trị Claim `sub` (User ID), sau đó đính kèm giá trị này vào HTTP Header với tên gọi khóa chuẩn hóa là `X-User-Id` trước khi chuyển tiếp request xuống service con.

### Quy tắc 2.3: Đối với ProjectManagement Service & Service nghiệp vụ con (Bộ phận xử lý)
* **Trách nhiệm:** Tập trung xử lý logic nghiệp vụ và phân quyền dựa trên danh tính được cung cấp.
* **Dọn dẹp mã nguồn:** **Không** cấu hình JWT Authentication (`AddJwtBearer`) và không tự kiểm tra chữ ký token để tiết kiệm tài nguyên CPU.
* **Tuyệt đối không nhận User ID từ Client:** Không sử dụng các tham số nhận diện người dùng truyền trực tiếp từ client qua URL Query String (`[FromQuery] requestingUserId`) hoặc trong Request Body (`[FromBody] RequestingUserId`). Việc này triệt tiêu hoàn toàn lỗ hổng bảo mật mạo danh (IDOR).
* **Sử dụng `ICurrentUserService`:** Tạo một Service dùng chung ở tầng hạ tầng, sử dụng `IHttpContextAccessor` để đọc trực tiếp Header `X-User-Id` do API Gateway truyền xuống. Tầng Application (Handlers) sẽ gọi service này để lấy danh tính thực hiện truy vấn Database (PostgreSQL).
* **Cô lập hạ tầng mạng (Network Isolation):** Khi triển khai thực tế (Docker/Kubernetes), các cổng dịch vụ của service con (ví dụ: port `5001` của project service) bắt buộc phải cấu hình ẩn, không được public ra môi trường ngoài. Các service này chỉ được phép nhận traffic nội bộ đến từ IP của API Gateway.

---

## 3. Luồng Đi Của Một Request Hợp Lệ
Kết quả chạy mã
File successfully generated.

```text
Client (Next.js/Postman)
   │
   │  1. Gửi Request kèm Header [Authorization: Bearer <JWT_Token>]
   ▼
API Gateway (YARP)
   │
   ├─► 2. Tự động kiểm tra tính hợp lệ của Token dựa trên Issuer/Audience/JWT_SECRET
   ├─► 3. Nếu Hợp lệ -> Giải mã lấy Claim["sub"] (Ví dụ: Guid "1234-5678...")
   │  4. Tạo Header mới: [X-User-Id: "1234-5678..."] và xóa bỏ Header Authorization cũ
   ▼
ProjectManagement Service (Backend)
   │
   ├─► 5. CurrentUserService đọc Header ["X-User-Id"] -> Trả về Guid cho MediatR Handler
   ├─► 6. Handler dùng Guid này để query PostgreSQL (Ví dụ: Lấy project thuộc về User này)
   ▼
Cơ sở dữ liệu (PostgreSQL)