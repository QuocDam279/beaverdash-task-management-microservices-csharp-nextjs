"use client";

import * as React from "react";

interface ShowcaseKanbanProps {
  isBoardHovered: boolean;
}

export function ShowcaseKanban({ isBoardHovered }: ShowcaseKanbanProps) {
  return (
    <div className="grid grid-cols-3 gap-4 preserve-3d animate-fade-slide-up duration-300 text-slate-800">
      {/* Column 1 */}
      <div className="space-y-4 preserve-3d">
        <div className="flex items-center justify-between text-slate-500 text-xs font-semibold px-1">
          <span>Cần làm</span>
          <span className="bg-slate-200/50 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-bold">2</span>
        </div>
        
        <div className="preserve-3d transition-transform duration-300" style={{ transform: isBoardHovered ? "translateZ(25px)" : "translateZ(0px)" }}>
          <div className="bg-white/80 border border-slate-200/50 hover:bg-white rounded-xl p-4 space-y-3 cursor-pointer hover:border-slate-300 transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <div className="flex justify-between items-start">
              <span className="text-[9px] bg-blue-50 text-blue-600 border border-blue-100 font-bold px-2 py-0.5 rounded">Tính năng</span>
              <span className="text-slate-400 text-[9px] font-semibold">#BD-104</span>
            </div>
            <h4 className="text-slate-800 text-xs font-bold leading-relaxed">Xây dựng lại UI trang đăng nhập</h4>
            <div className="flex justify-between items-center pt-2">
              <div className="flex -space-x-1.5">
                <div className="w-5 h-5 rounded-full bg-purple-500 text-[8px] font-bold flex items-center justify-center text-white border border-white">QD</div>
                <div className="w-5 h-5 rounded-full bg-teal-500 text-[8px] font-bold flex items-center justify-center text-white border border-white">AG</div>
              </div>
              <span className="text-[9px] text-slate-400 font-semibold">Hôm nay</span>
            </div>
          </div>
        </div>

        <div className="preserve-3d transition-transform duration-300" style={{ transform: isBoardHovered ? "translateZ(40px)" : "translateZ(0px)" }}>
          <div className="bg-white/80 border border-slate-200/50 hover:bg-white rounded-xl p-4 space-y-3 cursor-pointer hover:border-slate-300 transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <div className="flex justify-between items-start">
              <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-100 font-bold px-2 py-0.5 rounded">Cải tiến</span>
              <span className="text-slate-400 text-[9px] font-semibold">#BD-92</span>
            </div>
            <h4 className="text-slate-800 text-xs font-bold leading-relaxed">Thêm hiệu ứng hoạt họa tinh tế</h4>
            <div className="flex justify-between items-center pt-2">
              <div className="w-5 h-5 rounded-full bg-blue-500 text-[8px] font-bold flex items-center justify-center text-white border border-white">AG</div>
              <span className="text-[9px] text-slate-400 font-semibold">2 ngày trước</span>
            </div>
          </div>
        </div>
      </div>

      {/* Column 2 */}
      <div className="space-y-4 preserve-3d">
        <div className="flex items-center justify-between text-slate-500 text-xs font-semibold px-1">
          <span>Đang làm</span>
          <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-[10px] font-bold">1</span>
        </div>

        <div className="preserve-3d transition-transform duration-300" style={{ transform: isBoardHovered ? "translateZ(55px)" : "translateZ(0px)" }}>
          <div className="bg-white border border-blue-200/60 rounded-xl p-4 space-y-3 cursor-pointer shadow-[0_8px_20px_rgba(24,104,219,0.04)] transition-all duration-300">
            <div className="flex justify-between items-start">
              <span className="text-[9px] bg-purple-50 text-purple-700 border border-purple-100 font-bold px-2 py-0.5 rounded">Refactor</span>
              <span className="text-slate-400 text-[9px] font-semibold">#BD-88</span>
            </div>
            <h4 className="text-slate-800 text-xs font-bold leading-relaxed">Tối ưu hóa Google Auth API</h4>
            
            <div className="space-y-1">
              <div className="flex justify-between text-[9px]">
                <span className="text-slate-400">Tiến độ</span>
                <span className="text-blue-500 font-bold">75%</span>
              </div>
              <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                <div className="bg-[#1868db] h-full w-[75%]" />
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <div className="w-5 h-5 rounded-full bg-pink-500 text-[8px] font-bold flex items-center justify-center text-white border border-white">QD</div>
              <span className="text-[9px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">Khẩn cấp</span>
            </div>
          </div>
        </div>
      </div>

      {/* Column 3 */}
      <div className="space-y-4 preserve-3d">
        <div className="flex items-center justify-between text-slate-500 text-xs font-semibold px-1">
          <span>Hoàn thành</span>
          <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded text-[10px] font-bold">1</span>
        </div>

        <div className="preserve-3d transition-transform duration-300" style={{ transform: isBoardHovered ? "translateZ(30px)" : "translateZ(0px)" }}>
          <div className="bg-white/50 border border-slate-200/30 rounded-xl p-4 space-y-3 opacity-70 cursor-pointer hover:opacity-100 hover:border-slate-300 hover:bg-white transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
            <div className="flex justify-between items-start">
              <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold px-2 py-0.5 rounded">Tài liệu</span>
              <span className="text-slate-400 text-[9px] font-semibold">#BD-72</span>
            </div>
            <h4 className="text-slate-600 text-xs font-bold leading-relaxed line-through">Cập nhật file README.md</h4>
            <div className="flex justify-between items-center pt-2">
              <div className="w-5 h-5 rounded-full bg-emerald-600 text-[8px] font-bold flex items-center justify-center text-white border border-white">QD</div>
              <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">Đã xong</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
