# Quy Tắc Phát Triển Frontend (Frontend Development Guidelines)

Tài liệu này định nghĩa các quy tắc, tiêu chuẩn cấu trúc thư mục, xử lý dữ liệu và giao diện phục vụ cho việc phát triển Frontend Beaverdash sử dụng Next.js và Tailwind CSS.

---

## 1. KIẾN TRÚC THƯ MỤC (Strict Folder Structure)
Luôn tuân thủ cấu trúc App Router bên trong thư mục `src/` của dự án frontend. Dưới đây là các thư mục cốt lõi bắt buộc phải có và vai trò cụ thể:

* **`src/components/ui/`**: Chứa các component giao diện nguyên thủy, có thể tái sử dụng ở nhiều nơi (ví dụ: `Card`, `Button`, `Input`, `Dialog`, `Badge`, v.v.).
* **`src/components/features/`**: Chứa các component phức tạp phục vụ cho từng tính năng hoặc trang cụ thể (ví dụ: `KanbanBoard`, `ChatAssistant`, `ProjectList`).
* **`src/actions/`**: Chứa các Next.js Server Actions chịu trách nhiệm giao tiếp và lấy dữ liệu từ Backend API hoặc xử lý các logic ở phía Server.
* **`src/types/`**: Chứa các file định nghĩa kiểu dữ liệu (TypeScript Interfaces/Types) độc lập để chia sẻ trong toàn bộ ứng dụng.
* **`src/lib/`**: Chứa các file cấu hình và tiện ích dùng chung như `utils.ts` (để định nghĩa hàm `cn`) và `mock-data.ts`.


## 2. TIÊU CHUẨN GIAO DIỆN (UI/UX & Tailwind v4)
Đảm bảo giao diện người dùng đạt tính thẩm mỹ cao, trực quan và dễ sử dụng:

* **Thiết kế hiện đại & Sạch sẽ**: Ưu tiên bố cục dạng thẻ (**Card-based layout**). Khoảng cách (padding, margin) và căn lề phải đồng nhất.
* **Không hỗ trợ Dark Mode**: Giao diện chỉ chạy chế độ Light Mode, sử dụng bảng màu và token tuân thủ nghiêm ngặt theo tài liệu `design.md` (ví dụ: text-primary, surface-muted, v.v.). Không tự ý định nghĩa màu sắc ngoài hệ thống token của Atlassian Jira Board.
* **Bảng màu chủ đạo (Indigo & Cyan)**: Sử dụng các sắc độ của Indigo và Cyan làm điểm nhấn đồ họa, các trạng thái active, hover, hoặc chỉ thị trạng thái quan trọng.
* **Xử lý ghép Class động**: Luôn luôn sử dụng hàm tiện ích `cn()` được xuất từ `src/lib/utils.ts` để nối và xử lý xung đột class Tailwind một cách động.

---

## 3. QUY TẮC PHÂN CHIA SERVER/CLIENT COMPONENTS
Tối ưu hóa hiệu năng ứng dụng bằng cách phân chia vai trò rõ ràng giữa Client và Server:

* **Mặc định là Server Component**: Tất cả các component mặc định nên được viết dưới dạng Server Component để giảm tải lượng JavaScript gửi về client và tăng tốc độ load trang đầu tiên.
* **Sử dụng Client Component đúng mục đích**: Chỉ khai báo `'use client'` ở mức các component lá (Leaf Components) khi thực sự cần tương tác người dùng (như sự kiện click, form submit) hoặc khi cần dùng các React Hook (`useState`, `useEffect`, `useContext`, `useRef`).
* **Logic gọi dữ liệu**: Logic gọi API hoặc đọc Mock Data phải được thực hiện ở Server Components hoặc Server Actions. Không gọi trực tiếp từ Client Component xuống các port backend để tránh lộ thông tin nội bộ và tối ưu hiệu suất mạng.
