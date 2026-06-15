"use client";

import * as React from "react";

/**
 * @component ProductMockup
 * @description Mockup giao diện ứng dụng BeaverDash dạng 2D phẳng, phong cách Dark Mode cao cấp để nhúng vào Hero Section.
 */
export function ProductMockup() {
  const [activeTab, setActiveTab] = React.useState(0);

  return (
    <div className="w-full relative max-w-[840px] mx-auto rounded-2xl border border-stone-200/80 bg-white/70 p-1.5 shadow-[0_25px_60px_-15px_rgba(43,34,26,0.08)] backdrop-blur-xl animate-fade-slide-up select-none">
      
      {/* Outer ambient glow */}
      <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-tr from-amber-600/5 via-transparent to-orange-600/5 blur-xl" />

      {/* Browser Shell */}
      <div className="rounded-[10px] bg-white overflow-hidden flex flex-col border border-stone-200">
        
        {/* Browser Header */}
        <div className="bg-[#FAF9F5] border-b border-stone-200 px-4 py-2.5 flex items-center justify-between">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
          </div>
          <div className="bg-stone-100 rounded-md py-0.5 px-6 text-[9.5px] text-stone-500 font-mono select-none border border-stone-200/50">
            beaverdash.app/workspace/board
          </div>
          <div className="w-8" /> {/* Spacer */}
        </div>

        {/* Browser Body */}
        <div className="flex min-h-[340px] md:min-h-[380px] text-left">
          
          {/* Sidebar */}
          <div className="w-36 md:w-40 bg-[#fbfaf8] border-r border-stone-200/60 p-2.5 flex flex-col justify-between shrink-0 text-[10px] text-stone-500">
            <div className="space-y-3.5">
              <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
                <div className="w-4.5 h-4.5 rounded bg-[#854d0e] flex items-center justify-center text-white font-bold text-[8.5px]">B</div>
                <span className="font-extrabold text-[#2b221a]">BeaverDash Pro</span>
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 px-2 py-1.5 rounded bg-stone-200/60 text-[#78350f] font-bold">
                  <span>📋</span> Bảng công việc
                </div>
                <div className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-stone-100 hover:text-[#78350f] transition-colors cursor-pointer">
                  <span>💬</span> Thảo luận
                </div>
                <div className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-stone-100 hover:text-[#78350f] transition-colors cursor-pointer">
                  <span>🤖</span> Trợ lý AI
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 border-t border-stone-200 pt-2">
              <div className="w-5 h-5 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center text-[7.5px]">QĐ</div>
              <span className="font-bold text-stone-600 truncate">Quốc Đàm</span>
            </div>
          </div>

          {/* Main Area */}
          <div className="flex-1 p-4 md:p-5 flex flex-col gap-4 overflow-hidden bg-[#FAF9F5]/30">
            <div className="flex justify-between items-center select-none">
              <h3 className="text-xs md:text-sm font-bold text-[#2b221a]">Dự án Phát triển Web</h3>
              <div className="flex gap-1 bg-stone-100 p-0.5 rounded-lg border border-stone-200 text-[9px] font-bold">
                {["Kanban", "Lịch", "Gantt"].map((t, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveTab(idx)}
                    className={`px-2 py-0.5 rounded cursor-pointer ${activeTab === idx ? "bg-[#854d0e] text-white" : "text-stone-500"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Kanban Columns */}
            <div className="grid grid-cols-3 gap-3">
              {/* To Do */}
              <div className="space-y-2.5">
                <span className="text-[9px] font-bold text-stone-500 uppercase tracking-wide">Cần làm (2)</span>
                <div className="bg-white border border-stone-200/80 shadow-sm rounded-lg p-2.5 space-y-2">
                  <div className="flex justify-between items-center"><span className="text-[7.5px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100 font-bold">Dev</span></div>
                  <h4 className="text-[10px] font-bold text-stone-850 leading-snug">Thiết kế landing page</h4>
                </div>
              </div>

              {/* In Progress */}
              <div className="space-y-2.5">
                <span className="text-[9px] font-bold text-stone-500 uppercase tracking-wide">Đang thực hiện (1)</span>
                <div className="bg-white border border-stone-200/80 shadow-md rounded-lg p-2.5 space-y-2">
                  <div className="flex justify-between items-center"><span className="text-[7.5px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded border border-purple-100 font-bold">AI</span></div>
                  <h4 className="text-[10px] font-bold text-stone-850 leading-snug">Tích hợp Chatbot AI</h4>
                  <div className="w-full bg-stone-100 h-1 rounded-full overflow-hidden"><div className="bg-[#854d0e] h-full w-[60%]" /></div>
                </div>
              </div>

              {/* Done */}
              <div className="space-y-2.5">
                <span className="text-[9px] font-bold text-stone-500 uppercase tracking-wide">Đã xong (1)</span>
                <div className="bg-stone-50/50 border border-stone-200/40 rounded-lg p-2.5 opacity-60">
                  <h4 className="text-[10px] font-bold text-stone-400 line-through">Khởi tạo repo dự án</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating AI Agent bubble overlay */}
      <div className="absolute -bottom-4 -right-4 md:-right-6 bg-white/95 border border-amber-200/60 shadow-2xl p-2.5 rounded-xl w-48 md:w-56 z-25 flex items-start gap-2 animate-bounce-slow">
        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-600 to-[#78350f] flex items-center justify-center text-[10px] text-white shrink-0 shadow-md">🤖</div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-[8px] font-bold text-amber-700 leading-none">Beaver AI Agent</p>
          <p className="text-[9px] text-stone-600 mt-1 leading-normal">Kế hoạch thiết kế landing page đã được tự động thêm vào cột Cần làm!</p>
        </div>
      </div>
    </div>
  );
}
