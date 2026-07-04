"use client";

import * as React from "react";

export function ShowcaseKanban() {
  return (
    <div className="grid grid-cols-3 gap-3.5 animate-fade-slide-up duration-300 text-slate-800">
      {/* Column 1 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold px-1 select-none uppercase tracking-wider">
          <span>Cần làm</span>
          <span className="bg-slate-200/60 text-slate-600 px-1.5 py-0.5 rounded-md text-[9px] font-extrabold">2</span>
        </div>
        
        <div className="bg-white/85 border border-slate-200/60 hover:bg-white rounded-xl p-3.5 space-y-3 cursor-pointer hover:border-slate-300 hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-start">
            <span className="text-[8px] bg-blue-50 text-blue-600 border border-blue-100 font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">Tính năng</span>
            <span className="text-slate-400 text-[8.5px] font-bold">#BD-104</span>
          </div>
          <h4 className="text-slate-800 text-[11px] font-bold leading-snug">Thiết kế giao diện đăng nhập</h4>
          <div className="flex justify-between items-center pt-1 border-t border-slate-100/60 mt-2">
            <div className="flex -space-x-1.5">
              <div className="w-4.5 h-4.5 rounded-full bg-purple-500 text-[7px] font-bold flex items-center justify-center text-white border border-white">LC</div>
              <div className="w-4.5 h-4.5 rounded-full bg-teal-500 text-[7px] font-bold flex items-center justify-center text-white border border-white">AG</div>
            </div>
            <span className="text-[8.5px] text-slate-400 font-bold">Hôm nay</span>
          </div>
        </div>

        <div className="bg-white/85 border border-slate-200/60 hover:bg-white rounded-xl p-3.5 space-y-3 cursor-pointer hover:border-slate-300 hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-start">
            <span className="text-[8px] bg-amber-50 text-amber-700 border border-amber-100 font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">Cải tiến</span>
            <span className="text-slate-400 text-[8.5px] font-bold">#BD-92</span>
          </div>
          <h4 className="text-slate-800 text-[11px] font-bold leading-snug">Thêm hiệu ứng hoạt họa mượt mà</h4>
          <div className="flex justify-between items-center pt-1 border-t border-slate-100/60 mt-2">
            <div className="w-4.5 h-4.5 rounded-full bg-blue-500 text-[7px] font-bold flex items-center justify-center text-white border border-white">AG</div>
            <span className="text-[8.5px] text-slate-400 font-bold">2 ngày trước</span>
          </div>
        </div>
      </div>

      {/* Column 2 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold px-1 select-none uppercase tracking-wider">
          <span>Đang làm</span>
          <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-md text-[9px] font-extrabold">1</span>
        </div>

        <div className="bg-white border border-blue-200/80 rounded-xl p-3.5 space-y-3 cursor-pointer shadow-[0_8px_20px_rgba(24,104,219,0.03)] hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-start">
            <span className="text-[8px] bg-purple-50 text-purple-700 border border-purple-100 font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">Tối ưu hóa</span>
            <span className="text-slate-400 text-[8.5px] font-bold">#BD-88</span>
          </div>
          <h4 className="text-slate-800 text-[11px] font-bold leading-snug">Tối ưu hóa đăng nhập bằng Google</h4>
          
          <div className="space-y-1 my-1">
            <div className="flex justify-between text-[8px] font-bold">
              <span className="text-slate-400">Tiến độ</span>
              <span className="text-blue-500">75%</span>
            </div>
            <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
              <div className="bg-[#1868db] h-full w-[75%]" />
            </div>
          </div>

          <div className="flex justify-between items-center pt-1 border-t border-slate-100/60 mt-2">
            <div className="w-4.5 h-4.5 rounded-full bg-pink-500 text-[7px] font-bold flex items-center justify-center text-white border border-white">MA</div>
            <span className="text-[8px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">Khẩn cấp</span>
          </div>
        </div>
      </div>

      {/* Column 3 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold px-1 select-none uppercase tracking-wider">
          <span>Hoàn thành</span>
          <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-md text-[9px] font-extrabold">1</span>
        </div>

        <div className="bg-white/60 border border-slate-200/40 rounded-xl p-3.5 space-y-3 opacity-70 cursor-pointer hover:opacity-100 hover:border-slate-300 hover:bg-white hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-start">
            <span className="text-[8px] bg-emerald-50 text-emerald-700 border border-emerald-100 font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">Tài liệu</span>
            <span className="text-slate-400 text-[8.5px] font-bold">#BD-72</span>
          </div>
          <h4 className="text-slate-500 text-[11px] font-bold leading-snug line-through">Cập nhật tài liệu hướng dẫn</h4>
          <div className="flex justify-between items-center pt-1 border-t border-slate-100/60 mt-2">
            <div className="w-4.5 h-4.5 rounded-full bg-emerald-600 text-[7px] font-bold flex items-center justify-center text-white border border-white">LC</div>
            <span className="text-[8px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">Đã xong</span>
          </div>
        </div>
      </div>
    </div>
  );
}
