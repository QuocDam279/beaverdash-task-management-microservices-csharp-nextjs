"use client";

import * as React from "react";

/**
 * @component FeaturesGrid
 * @description Lưới hiển thị các tính năng cốt lõi của BeaverDash: Real-time, AI và Visual Boards.
 */
export function FeaturesGrid() {
  const features = [
    {
      icon: "⚡",
      title: "Đồng bộ thời gian thực",
      desc: "Mọi thay đổi từ cập nhật nhiệm vụ, bình luận đến chỉnh sửa tiến độ đều được đồng bộ tức thời qua SignalR tới tất cả màn hình của thành viên.",
      tag: "SignalR Sync",
      color: "border-stone-200 hover:border-amber-700/40 hover:shadow-amber-700/5",
    },
    {
      icon: "🤖",
      title: "Trợ lý AI lập kế hoạch",
      desc: "Tự động phân tích dự án, đề xuất danh sách việc cần làm (checklist) và tạo công việc tự động từ câu hội thoại ngôn ngữ tự nhiên.",
      tag: "AI Powered",
      color: "border-stone-200 hover:border-amber-700/40 hover:shadow-amber-700/5",
    },
    {
      icon: "📅",
      title: "Bảng biểu trực quan",
      desc: "Theo dõi tiến độ linh hoạt thông qua bảng Kanban kéo thả, Lịch biểu chi tiết và sơ đồ Gantt trực quan giúp kiểm soát sát sao thời hạn công việc.",
      tag: "Visual Boards",
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

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 max-w-6xl mx-auto">
        {features.map((f, idx) => (
          <div
            key={idx}
            className={`bg-white/80 border rounded-2xl p-6 text-left space-y-4 hover:-translate-y-1 transition-all duration-300 shadow-xl ${f.color}`}
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
