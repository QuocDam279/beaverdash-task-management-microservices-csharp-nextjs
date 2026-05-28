"use client";

/**
 * @component LoginShowcase
 * @description Hiển thị cột bên phải của trang Đăng nhập với giao diện Kanban giả lập, các hiệu ứng phát sáng mờ ảo (Radial Glow) và chuyển động chậm.
 */

import * as React from "react";
import Image from "next/image";

export function LoginShowcase() {
  return (
    <div className="hidden lg:flex flex-1 relative flex-col justify-between p-16 bg-gradient-to-br from-[#0c1222] via-[#0f172a] to-[#1e293b] overflow-hidden select-none">
      
      {/* Animated Background Spheres (Radial Glow) */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#1868db]/30 to-purple-600/10 blur-[120px] animate-drift-one pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-blue-900/40 to-teal-500/10 blur-[140px] animate-drift-two pointer-events-none" />
      <div className="absolute top-[40%] left-[-10%] w-[350px] h-[350px] rounded-full bg-indigo-600/15 blur-[100px] animate-drift-three pointer-events-none" />

      {/* Decorative Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Top Text / Branding */}
      <div className="relative z-10 flex items-center gap-3">
        <Image
          src="/logo.svg"
          alt="Beaverdash Logo"
          width={24}
          height={24}
          className="opacity-80 object-contain"
        />
        <span className="text-white font-semibold tracking-wider text-sm">BEAVERDASH</span>
      </div>

      {/* Center Showcase: Glassmorphic Kanban Board */}
      <div className="relative z-10 flex flex-col justify-center items-center flex-1 w-full max-w-[800px] mx-auto">
        
        <div className="glassmorphism rounded-2xl w-full p-6 shadow-2xl border border-white/10 backdrop-blur-xl mb-12">
          
          {/* Fake Kanban Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="text-white/40 text-xs ml-2">beaverdash-workspace / project-alpha</span>
            </div>
            <div className="flex gap-1.5">
              <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center text-white/50 text-[10px]">⌥</div>
              <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center text-white/50 text-[10px]">⌘</div>
            </div>
          </div>

          {/* Kanban Columns */}
          <div className="grid grid-cols-3 gap-4">
            
            {/* Column 1: To Do */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-white/60 text-xs font-semibold px-1">
                <span>Cần làm</span>
                <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px]">2</span>
              </div>
              
              {/* Task Card 1 (Float Slow) */}
              <div className="glassmorphism-card rounded-xl p-4 space-y-3 cursor-pointer hover:glassmorphism-card-active transition-all duration-300 transform animate-float-slow">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] bg-blue-500/20 text-blue-300 font-semibold px-2 py-0.5 rounded">
                    Tính năng
                  </span>
                  <span className="text-white/30 text-[9px]">#BD-104</span>
                </div>
                <h4 className="text-white/95 text-xs font-semibold leading-relaxed">
                  Xây dựng lại UI trang đăng nhập
                </h4>
                <div className="flex justify-between items-center pt-2">
                  <div className="flex -space-x-1.5">
                    <div className="w-5 h-5 rounded-full bg-purple-500 text-[8px] font-bold flex items-center justify-center text-white border border-slate-900">QD</div>
                    <div className="w-5 h-5 rounded-full bg-teal-500 text-[8px] font-bold flex items-center justify-center text-white border border-slate-900">AG</div>
                  </div>
                  <span className="text-[9px] text-white/40">Hôm nay</span>
                </div>
              </div>

              {/* Task Card 2 (Float Fast) */}
              <div className="glassmorphism-card rounded-xl p-4 space-y-3 cursor-pointer hover:glassmorphism-card-active transition-all duration-300 transform animate-float-fast">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 font-semibold px-2 py-0.5 rounded">
                    Cải tiến
                  </span>
                  <span className="text-white/30 text-[9px]">#BD-92</span>
                </div>
                <h4 className="text-white/95 text-xs font-semibold leading-relaxed">
                  Thêm hiệu ứng hoạt họa tinh tế
                </h4>
                <div className="flex justify-between items-center pt-2">
                  <div className="w-5 h-5 rounded-full bg-blue-500 text-[8px] font-bold flex items-center justify-center text-white border border-slate-900">AG</div>
                  <span className="text-[9px] text-white/40">2 ngày trước</span>
                </div>
              </div>
            </div>

            {/* Column 2: In Progress */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-white/60 text-xs font-semibold px-1">
                <span>Đang làm</span>
                <span className="bg-[#1868db]/30 text-[#1868db] font-bold px-1.5 py-0.5 rounded text-[10px]">1</span>
              </div>

              {/* Task Card 3 (Float Medium, Styled Active) */}
              <div className="glassmorphism-card-active rounded-xl p-4 space-y-3 cursor-pointer hover:scale-[1.02] transition-all duration-300 transform animate-float-medium">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 font-semibold px-2 py-0.5 rounded">
                    Refactor
                  </span>
                  <span className="text-white/30 text-[9px]">#BD-88</span>
                </div>
                <h4 className="text-white/95 text-xs font-semibold leading-relaxed">
                  Tối ưu hóa Google Auth API
                </h4>
                
                {/* Progress bar visual */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px]">
                    <span className="text-white/50">Tiến độ</span>
                    <span className="text-blue-400 font-semibold">75%</span>
                  </div>
                  <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                    <div className="bg-[#1868db] h-full w-[75%]" />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <div className="w-5 h-5 rounded-full bg-pink-500 text-[8px] font-bold flex items-center justify-center text-white border border-slate-900">QD</div>
                  <span className="text-[9px] text-blue-300 font-semibold bg-blue-500/10 px-1.5 py-0.5 rounded">Khẩn cấp</span>
                </div>
              </div>
            </div>

            {/* Column 3: Done */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-white/60 text-xs font-semibold px-1">
                <span>Hoàn thành</span>
                <span className="bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded text-[10px]">1</span>
              </div>

              {/* Task Card 4 (Float Slow) */}
              <div className="glassmorphism-card rounded-xl p-4 space-y-3 opacity-60 cursor-pointer hover:opacity-100 hover:glassmorphism-card-active transition-all duration-300 transform animate-float-slow">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded">
                    Tài liệu
                  </span>
                  <span className="text-white/30 text-[9px]">#BD-72</span>
                </div>
                <h4 className="text-white/95 text-xs font-semibold leading-relaxed line-through">
                  Cập nhật file README.md
                </h4>
                <div className="flex justify-between items-center pt-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-[8px] font-bold flex items-center justify-center text-white border border-slate-900">QD</div>
                  <span className="text-[9px] text-emerald-400">Đã xong</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Heading under the Showcase */}
        <div className="text-center max-w-[500px]">
          <h2 className="text-2xl font-bold text-white mb-3">
            Quản lý công việc thông minh cùng Beaverdash
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Trải nghiệm hệ thống Kanban trực quan, tự động hóa quy trình làm việc và tối ưu hóa hiệu suất làm việc nhóm của bạn một cách tối đa.
          </p>
        </div>

      </div>

      {/* Footer info in Showcase */}
      <div className="relative z-10 flex justify-between text-xs text-slate-500">
        <span>© 2026 Beaverdash Inc.</span>
        <span>Bản quyền đã được bảo hộ.</span>
      </div>

    </div>
  );
}
