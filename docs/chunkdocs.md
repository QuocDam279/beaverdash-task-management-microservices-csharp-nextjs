# TIÊU CHUẨN XỬ LÝ VÀ CHUNKING TÀI LIỆU RAG (CẬP NHẬT MỞ RỘNG)
**Target Model:** `BGE-M3` (Embedding Size: Tối đa 8192 tokens, tối ưu RAG ở mức 512-800 tokens).
**Global Parameters:** `chunk_size = 512 tokens` (~1500 ký tự), `chunk_overlap = 64 tokens` (~150-200 ký tự).

---

## 1. Văn bản Plain Text (.txt)
* **Cách chunk:** Phân mảnh đệ quy (Recursive Character Splitting) theo mảng ưu tiên: `["\n\n", "\n", ". ", "? ", "! ", " ", ""]`.
* **Cơ chế Fallback:** Khi văn bản thô không chứa dấu ngắt đoạn hoặc dấu câu, hệ thống tự động kích hoạt cắt cứng (Hard Limit) tại vị trí khoảng trắng `" "` gần nhất khi chạm ngưỡng 512 tokens để tránh bẻ đôi từ.

## 2. Tài liệu Markdown (.md)
* **Cách chunk (Phân mảnh lồng nhau 2 lớp):**
  * **Lớp 1:** Tách theo cấu trúc Heading (`#`, `##`) bằng `MarkdownHeaderTextSplitter`.
  * **Lớp 2 (Hard Limit Fallback):** Nếu khối nội dung dưới một Heading > 512 tokens, dùng `RecursiveCharacterTextSplitter` băm nhỏ khối đó thành các Child Chunks. Toàn bộ Child Chunks phải kế thừa dữ liệu Heading cha vào bảng `metadata` (JSONB).

## 3. Tài liệu Word (.docx)
* **Cách chunk:** Chuyển đổi toàn bộ cấu trúc sang file Markdown trung gian (giữ nguyên bảng, list, in đậm/nghiêng), sau đó áp dụng quy tắc phân mảnh lồng nhau 2 lớp như mục (2).

## 4. Tài liệu PDF (.pdf)
* **Cách chunk:** Sử dụng Vision AI nhận diện bố cục hình học qua Background Worker để kết xuất ra Markdown sạch, sau đó chunk theo cấu trúc tiêu đề.
* **Xử lý đặc thù cấu phần PDF:**
  * **Bảng biểu (Tables):** Vision AI chuyển đổi thành định dạng Markdown Table. Nếu bảng vượt quá `chunk_size`, chuyển đổi các hàng thành câu văn tự nhiên (Row-based Context) trước khi embedding.
  * **Hình ảnh/Biểu đồ:** Trích xuất Text qua OCR (nếu có sơ đồ chữ) hoặc lưu vết dòng Caption/Alt-text sát ảnh thành văn bản ngữ cảnh. Bỏ qua các ảnh pixel không có thông tin văn bản.

## 5. Bảng tính Excel (.xlsx, .csv)
* **Cách chunk:** Tuyệt đối KHÔNG cắt tự do. Sử dụng Pandas duyệt từng dòng, tạo chuỗi ngôn ngữ tự nhiên bằng cách ghép *[Tiêu đề cột] + [Giá trị ô]* (Vd: *"Task-01 có tiêu đề Thiết kế DB, trạng thái In Progress"*). Mỗi câu tương ứng với 1 mảnh độc lập.

## 6.API các model sử dụng
* **API của gemini - model Gemini 3.1 Flash Lite:** <YOUR_GEMINI_API_KEY>

* **API github model - model gpt-4o-mini:** <YOUR_GITHUB_MODEL_TOKEN>

 
* **API của Groq - model Llama 3.1 8B** <YOUR_GROQ_API_KEY>
