"use client";

import * as React from "react";
import Image from "next/image";

/**
 * @component ProductMockup
 * @description Mockup hiển thị giao diện ứng dụng BeaverDash trực quan, sử dụng ảnh chụp hệ thống thực tế.
 */
export function ProductMockup() {
  return (
    <div className="w-full relative max-w-[840px] mx-auto rounded-2xl border border-stone-200/85 bg-white/60 p-2 shadow-[0_30px_70px_-15px_rgba(43,34,26,0.1)] backdrop-blur-xl transition-all duration-700 ease-out hover:scale-[1.015] hover:-translate-y-1.5 hover:shadow-[0_45px_80px_-10px_rgba(180,83,9,0.18)] select-none group">
      
      {/* Outer ambient glow */}
      <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-tr from-amber-600/10 via-transparent to-orange-600/10 blur-2xl transition-opacity duration-700 group-hover:opacity-100 opacity-60" />

      {/* Browser Shell */}
      <div className="rounded-[12px] bg-white overflow-hidden flex flex-col border border-stone-200/90 shadow-sm">
        
        {/* Browser Header */}
        <div className="bg-[#FAF9F5] border-b border-stone-200 px-4 py-2.5 flex items-center justify-between">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] transition-transform duration-300 hover:scale-120 cursor-pointer" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] transition-transform duration-300 hover:scale-120 cursor-pointer" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f] transition-transform duration-300 hover:scale-120 cursor-pointer" />
          </div>
          <div className="bg-stone-100/80 rounded-md py-0.5 px-6 text-[9.5px] text-stone-500 font-mono select-none border border-stone-200/50">
            beaverdash.xyz/workspace/board
          </div>
          <div className="w-8" /> {/* Spacer */}
        </div>

        {/* Browser Body with anhgioithieuhethong.png */}
        <div className="relative w-full overflow-hidden bg-stone-50 aspect-[1920/1080]">
          <Image
            src="/anhgioithieuhethong.png"
            alt="Giao diện hệ thống BeaverDash"
            width={1920}
            height={1080}
            className="w-full h-auto object-cover transition-transform duration-700 ease-out group-hover:scale-[1.012]"
            priority
          />
        </div>
      </div>

      {/* Floating AI Agent bubble overlay */}
      <div className="absolute -bottom-5 -right-4 md:-right-6 bg-white/95 border border-amber-200/60 shadow-2xl p-2.5 rounded-xl w-48 md:w-56 z-25 flex items-start gap-2.5 animate-bounce-slow transition-all duration-300 hover:scale-105">
        <div className="w-6.5 h-6.5 rounded-full bg-gradient-to-tr from-amber-600 to-[#78350f] flex items-center justify-center text-[11px] text-white shrink-0 shadow-md">🤖</div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-[8px] font-extrabold text-amber-700 leading-none uppercase tracking-wider">Beaver AI Agent</p>
          <p className="text-[9.5px] text-stone-600 mt-1.5 leading-relaxed">
            Kế hoạch phát triển dự án đã được tự động phân tách và sắp xếp trên bảng Kanban!
          </p>
        </div>
      </div>
    </div>
  );
}
