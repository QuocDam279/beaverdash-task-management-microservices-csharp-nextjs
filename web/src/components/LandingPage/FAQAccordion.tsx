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
      q: "Tôi có thể đăng nhập bằng những phương thức nào?",
      a: "Hiện tại BeaverDash hỗ trợ đăng nhập cực kỳ nhanh chóng và an toàn thông qua Tài khoản Google (Google Login SDK). Bạn không cần phải nhớ thêm mật khẩu mới để bắt đầu sử dụng.",
    },
    {
      q: "Trợ lý AI lập kế hoạch hoạt động như thế nào?",
      a: "Trợ lý AI tích hợp trong BeaverDash sử dụng các mô hình ngôn ngữ lớn để bóc tách ngữ nghĩa từ câu thoại của bạn. Khi bạn yêu cầu lập kế hoạch cho một nhiệm vụ, AI sẽ tự động phân tách thành các checklist con, gán nhãn ưu tiên, tính toán thời gian và vẽ chúng lên bảng Kanban cho bạn.",
    },
    {
      q: "Tính năng đồng bộ thời gian thực hoạt động ra sao?",
      a: "Ứng dụng sử dụng công nghệ SignalR để thiết lập cổng kết nối liên tục giữa Client và máy chủ. Nhờ đó, bất cứ khi nào có thay đổi xảy ra trên dự án, tất cả thành viên đang trực tuyến sẽ nhìn thấy cập nhật ngay lập tức trên màn hình của họ mà không cần tải lại trang.",
    },
    {
      q: "Gói dùng thử Pro có bị giới hạn gì không?",
      a: "Gói dùng thử Pro cho phép đội nhóm của bạn sử dụng đầy đủ mọi tính năng cao cấp nhất như đồng bộ SignalR và câu lệnh AI không giới hạn trong vòng 14 ngày. Bạn không cần nhập thông tin thẻ thanh toán để dùng thử.",
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
                  isOpen ? "max-h-[200px] border-t border-stone-150" : "max-h-0"
                }`}
              >
                <p className="p-4 text-[11px] text-stone-500 leading-relaxed text-justify">
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
