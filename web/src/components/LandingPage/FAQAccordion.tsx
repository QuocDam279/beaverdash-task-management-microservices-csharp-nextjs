"use client";

import * as React from "react";

/**
 * @component FAQAccordion
 * @description Mục giải đáp câu hỏi thường gặp dạng Accordion có hoạt họa mở đóng mượt mà.
 */
export function FAQAccordion() {
  const [openIdx, setOpenIdx] = React.useState<number | null>(0);

  const faqs = [
    {
      q: "BeaverDash là gì và có dễ sử dụng không?",
      a: "BeaverDash là công cụ quản lý công việc trực quan giúp cá nhân và đội nhóm sắp xếp công việc gọn gàng. Giao diện được thiết kế kéo-thả cực kỳ đơn giản như việc dán giấy ghi chú lên bảng, giúp bạn làm quen và bắt đầu sử dụng chỉ trong vòng 5 phút mà không cần bất kỳ kiến thức kỹ thuật nào.",
    },
    {
      q: "Trợ lý AI giúp tôi những gì trong công việc?",
      a: "Trợ lý AI đóng vai trò như một người đồng nghiệp thông minh. Khi bạn nhập một yêu cầu ngắn ví dụ như lập kế hoạch thiết kế trang web, AI sẽ tự động phân tách yêu cầu thành danh sách các đầu việc nhỏ cần làm, gợi ý thứ tự ưu tiên và thời gian hoàn thành để bạn bắt tay vào việc ngay lập tức.",
    },
    {
      q: "Làm thế nào để phối hợp làm việc nhóm trên BeaverDash?",
      a: "Bạn có thể dễ dàng tạo nhóm và mời các thành viên tham gia qua email hoặc liên kết chia sẻ. Mọi người có thể cùng cập nhật trạng thái công việc, thảo luận, đính kèm tài liệu. Mọi thay đổi của đồng đội sẽ xuất hiện ngay lập tức trên màn hình của bạn mà không cần tải lại trang.",
    },
    {
      q: "Tôi đăng nhập vào hệ thống bằng cách nào?",
      a: "BeaverDash hỗ trợ đăng nhập cực kỳ nhanh chóng và an toàn chỉ với một cú nhấp chuột bằng Tài khoản Google của bạn. Hệ thống không yêu cầu điền biểu mẫu đăng ký rườm rà hay bắt bạn phải ghi nhớ thêm bất kỳ mật khẩu mới nào.",
    },
  ];

  return (
    <section id="faq" className="space-y-10 py-8 select-none">
      
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-3">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2b221a]">
          Giải đáp thắc mắc thường gặp
        </h2>
        <p className="text-xs text-stone-500 leading-relaxed">
          Tìm câu trả lời nhanh chóng cho các câu hỏi phổ biến nhất về BeaverDash.
        </p>
      </div>

      {/* Accordions */}
      <div className="max-w-3xl mx-auto px-4 space-y-3.5 text-left">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="bg-white border border-stone-200 rounded-xl overflow-hidden transition-all duration-300"
            >
              {/* Question Header */}
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full flex items-center justify-between p-4 font-bold text-xs text-stone-800 hover:text-[#78350f] transition-colors cursor-pointer select-none"
              >
                <span>{faq.q}</span>
                <span className={`text-[10px] text-slate-450 transition-transform duration-350 ${isOpen ? "rotate-180" : ""}`}>
                  ▼
                </span>
              </button>

              {/* Answer Content */}
              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  isOpen ? "max-h-[300px] border-t border-stone-150" : "max-h-0"
                }`}
              >
                <p className="p-4 text-[11.5px] text-stone-500 leading-relaxed text-justify">
                  {faq.a}
                </p>
              </div>
            </div>
          );
        })}
      </div>

    </section>
  );
}
