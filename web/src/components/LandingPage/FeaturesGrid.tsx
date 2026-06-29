"use client";

import * as React from "react";

/**
 * @component FeaturesGrid
 * @description Lưới hiển thị các tính năng cốt lõi của BeaverDash: Real-time, AI và Visual Boards.
 */
export function FeaturesGrid() {
  const features = [
    {
      icon: "📋",
      title: "Bảng Kanban & Danh sách",
      desc: "Quản lý công việc linh hoạt thông qua bảng Kanban kéo-thả trực quan hoặc dạng danh sách chi tiết, giúp bạn dễ dàng theo dõi trạng thái nhiệm vụ.",
      tag: "Trực quan",
      color: "border-stone-200 hover:border-amber-700/40 hover:shadow-amber-700/5",
    },
    {
      icon: "📅",
      title: "Sơ đồ Gantt & Lịch biểu",
      desc: "Hình dung tiến trình công việc theo thời gian thực trên sơ đồ Gantt và quản lý thời hạn hoàn thành sát sao qua giao diện lịch biểu của cả đội.",
      tag: "Tiến độ",
      color: "border-stone-200 hover:border-amber-700/40 hover:shadow-amber-700/5",
    },
    {
      icon: "🤖",
      title: "Trợ lý AI lập kế hoạch",
      desc: "Hỏi đáp và trò chuyện với Trợ lý AI để tự động phân rã các nhiệm vụ lớn thành checklist công việc nhỏ hơn, giúp tiết kiệm thời gian chuẩn bị.",
      tag: "Trí tuệ nhân tạo",
      color: "border-stone-200 hover:border-amber-700/40 hover:shadow-amber-700/5",
    },
    {
      icon: "💬",
      title: "Kênh chat nội bộ dự án",
      desc: "Trao đổi ý kiến, thảo luận trực tiếp và chia sẻ tệp tin ngay trong không gian làm việc của từng dự án, giúp thông tin luôn liền mạch.",
      tag: "Cộng tác",
      color: "border-stone-200 hover:border-amber-700/40 hover:shadow-amber-700/5",
    },
    {
      icon: "⚡",
      title: "Đồng bộ tức thời",
      desc: "Tự động cập nhật mọi thay đổi từ các thành viên khác ngay trên màn hình làm việc của bạn mà không cần tải lại trang, giúp cả nhóm phối hợp ăn ý.",
      tag: "Đồng bộ",
      color: "border-stone-200 hover:border-amber-700/40 hover:shadow-amber-700/5",
    },
  ];

  return (
    <section id="features" className="space-y-10 py-8 select-none">
      
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-3">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2b221a]">
          Mọi công cụ cần thiết để tối ưu hóa tiến độ
        </h2>
        <p className="text-xs text-stone-500 leading-relaxed">
          BeaverDash thiết lập một tiêu chuẩn mới cho quản lý công việc và cộng tác đội nhóm chuyên nghiệp.
        </p>
      </div>

      {/* Centered Flexbox Layout */}
      <div className="flex flex-wrap justify-center gap-6 px-4 max-w-6xl mx-auto">
        {features.map((f, idx) => (
          <div
            key={idx}
            className={`w-full sm:w-[calc(50%-12px)] md:w-[calc(33.333%-16px)] bg-white/80 border rounded-2xl p-6 text-left space-y-4 hover:-translate-y-1 transition-all duration-300 shadow-xl ${f.color}`}
          >
            <div className="flex justify-between items-center">
              <span className="text-2xl">{f.icon}</span>
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-stone-600 bg-stone-50 border border-stone-200 px-2 py-0.5 rounded-md">
                {f.tag}
              </span>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-[#2b221a]">{f.title}</h3>
              <p className="text-xs text-stone-500 leading-relaxed text-justify">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

    </section>
  );
}
