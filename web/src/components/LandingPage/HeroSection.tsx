"use client";

import * as React from "react";
import Link from "next/link";
import { ProductMockup } from "./ProductMockup";
import { VideoModal } from "./VideoModal";

/**
 * @component HeroSection
 * @description Phần mở đầu của Landing Page chứa tiêu đề chính, mô tả và nhúng Mockup sản phẩm cùng video giới thiệu.
 */
export function HeroSection() {
  const [isVideoOpen, setIsVideoOpen] = React.useState(false);

  return (
    <section className="text-center py-10 md:py-16 space-y-10 relative select-none">
      
      {/* Background soft warm glowing blur shape */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] rounded-full bg-amber-500/5 blur-[100px] -z-10" />

      {/* Hero Header Text */}
      <div className="max-w-3xl mx-auto space-y-4 px-4">
        {/* Animated tag */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-amber-50 border border-amber-200 text-amber-700">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
          Giải pháp quản lý hiện đại
        </span>

        {/* H1 Main Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#2b221a] leading-[1.15]">
          Quản lý công việc thông minh, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-700 via-amber-600 to-[#78350f]">
            tối ưu hiệu suất với Trợ lý AI
          </span>
        </h1>

        {/* Description paragraph */}
        <p className="text-xs sm:text-sm text-stone-500 max-w-xl mx-auto leading-relaxed">
          Không gian làm việc thời gian thực tích hợp bảng Kanban, sơ đồ Gantt trực quan và Trợ lý trí tuệ nhân tạo lập kế hoạch tự động cho đội ngũ của bạn.
        </p>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/login"
          className="text-xs font-bold text-white bg-gradient-to-r from-amber-700 to-[#78350f] hover:from-amber-600 hover:to-[#5c2d12] px-6 py-3 rounded-xl transition-all duration-300 shadow-xl shadow-amber-700/10 active:scale-95 cursor-pointer"
        >
          Bắt đầu miễn phí ngay
        </Link>
        <button
          onClick={() => setIsVideoOpen(true)}
          className="flex items-center gap-2.5 text-xs font-bold text-stone-600 hover:text-[#2b221a] bg-white hover:bg-stone-50 border border-stone-200 px-6 py-3 rounded-xl transition-all duration-300 active:scale-95 cursor-pointer shadow-sm"
        >
          <svg className="w-4 h-4 text-amber-750 fill-amber-700/10" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <polygon points="5 3 19 12 5 21 5 3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Xem video giới thiệu
        </button>
      </div>

      {/* Embedded App Mockup */}
      <div className="pt-4 px-2">
        <ProductMockup />
      </div>

      {/* Video Lightbox Modal */}
      <VideoModal
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
        videoSrc="/videogioithieu.mp4"
      />

    </section>
  );
}

