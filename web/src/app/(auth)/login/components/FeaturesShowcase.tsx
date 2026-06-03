"use client";

import * as React from "react";

interface Feature {
  title: string;
  shortDesc: string;
  longDesc: string;
  badge: string;
  icon: React.ReactNode;
  visual: React.ReactNode;
}

export function FeaturesShowcase() {
  const [activeTab, setActiveTab] = React.useState(0);
  const [isHovered, setIsHovered] = React.useState(false);

  const features: Feature[] = [
    {
      title: "Trợ lý AI Copilot",
      shortDesc: "Tối ưu hóa quy trình làm việc bằng AI",
      longDesc: "Tích hợp trợ lý AI thông minh giúp tự động gợi ý mô tả nhiệm vụ, lập checklist kế hoạch chi tiết và phân loại tài nguyên tối ưu chỉ trong nháy mắt.",
      badge: "AI Powered",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l-.813-5.096L3 15l5.096-.813L9 9l.813 5.096L15 15l-5.187.904zM18.007 7.007L17 10l-1.007-2.993L13 6l2.993-1.007L17 2l1.007 2.993L21 6l-2.993 1.007z" />
        </svg>
      ),
      visual: (
        <div className="relative w-full h-12 bg-blue-500/5 rounded-xl border border-blue-500/10 flex items-center justify-between px-3 overflow-hidden animate-pulse">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-[10px] font-semibold text-[#1868db]">Copilot đang gợi ý checklist...</span>
          </div>
          <span className="text-[9px] bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded-full font-bold">Hoàn tất</span>
        </div>
      ),
    },
    {
      title: "Đồng bộ Real-time",
      shortDesc: "Cập nhật tức thời thông qua SignalR",
      longDesc: "Hệ thống kết nối thời gian thực ổn định giúp cộng tác không độ trễ. Mọi thay đổi trạng thái Kanban, bình luận và tiến độ được đồng bộ ngay lập tức.",
      badge: "Live Sync",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      visual: (
        <div className="relative w-full h-12 bg-emerald-500/5 rounded-xl border border-emerald-500/10 flex items-center justify-between px-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-semibold text-emerald-700">Đã đồng bộ với nhóm dự án</span>
          </div>
          <span className="text-[9px] font-mono text-emerald-600 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">Ping 12ms</span>
        </div>
      ),
    },
    {
      title: "Báo cáo Analytics",
      shortDesc: "Đo lường tiến độ tự động trực quan",
      longDesc: "Theo dõi biểu đồ năng suất, tỷ lệ hoàn thành nhiệm vụ chi tiết và thời gian trung bình hoàn thành dự án để liên tục tối ưu hóa hiệu quả công việc.",
      badge: "Smart Analytics",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      visual: (
        <div className="relative w-full h-12 bg-purple-500/5 rounded-xl border border-purple-500/10 flex flex-col justify-center px-3 gap-1">
          <div className="flex justify-between text-[9px] font-bold text-purple-700">
            <span>Tiến độ tổng thể</span>
            <span>92% Hoàn thành</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-purple-600 h-full w-[92%] transition-all duration-1000" />
          </div>
        </div>
      ),
    },
  ];

  React.useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % features.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isHovered, features.length]);

  return (
    <div
      className="w-full space-y-4 my-4 text-left"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Tabs list */}
      <div className="grid grid-cols-3 gap-2 bg-slate-100/70 p-1.5 rounded-xl border border-slate-200/50">
        {features.map((feat, index) => {
          const isActive = index === activeTab;
          return (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-center cursor-pointer transition-all duration-300 ${
                isActive
                  ? "bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-slate-200/50 text-[#1868db] font-bold"
                  : "text-[#505258] hover:text-[#292a2e] hover:bg-white/50 font-semibold"
              }`}
            >
              <div className={`p-1.5 rounded-lg mb-1 transition-colors ${isActive ? "bg-[#1868db]/10 text-[#1868db]" : "bg-slate-200/50 text-slate-400"}`}>
                {feat.icon}
              </div>
              <span className="text-[10px] tracking-tight">{feat.title}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tab Panel Content */}
      <div className="relative min-h-[145px] bg-gradient-to-b from-slate-50/50 to-white/20 border border-slate-100/80 rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.01)] transition-all duration-300 flex flex-col justify-between overflow-hidden group">
        
        {/* Decorative corner accent glow */}
        <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-gradient-to-br from-[#1868db]/5 to-transparent blur-xl pointer-events-none" />

        <div className="space-y-1.5 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#1868db]/10 text-[#1868db]">
              {features[activeTab].badge}
            </span>
            <span className="text-[11px] font-bold text-slate-700">{features[activeTab].shortDesc}</span>
          </div>
          <p className="text-[10.5px] text-[#505258] leading-relaxed transition-all duration-300">
            {features[activeTab].longDesc}
          </p>
        </div>

        <div className="mt-3 relative z-10">
          {features[activeTab].visual}
        </div>
      </div>
    </div>
  );
}
