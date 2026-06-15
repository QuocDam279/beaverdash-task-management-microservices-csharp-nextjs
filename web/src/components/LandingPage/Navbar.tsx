"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";

/**
 * @component Navbar
 * @description Thanh điều hướng đầu trang giới thiệu, hỗ trợ cuộn mượt và nút bấm đi tới trang Login.
 */
export function Navbar() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-stone-200/60 bg-[#FAF9F5]/90 backdrop-blur-md select-none">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
          <Image src="/logo.svg" alt="Beaverdash Logo" width={32} height={32} className="object-contain" priority />
          <span className="font-extrabold text-base tracking-tight text-[#2b221a]">BeaverDash</span>
        </Link>

        {/* Center Menu Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-stone-600">
          <button onClick={() => scrollToSection("features")} className="hover:text-[#78350f] transition-colors cursor-pointer">
            Tính năng
          </button>
          <button onClick={() => scrollToSection("ai-showcase")} className="hover:text-[#78350f] transition-colors cursor-pointer">
            Quy trình AI
          </button>
          <button onClick={() => scrollToSection("pricing")} className="hover:text-[#78350f] transition-colors cursor-pointer">
            Bảng giá
          </button>
          <button onClick={() => scrollToSection("faq")} className="hover:text-[#78350f] transition-colors cursor-pointer">
            Hỏi đáp
          </button>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-xs font-bold text-stone-600 hover:text-[#78350f] transition-colors px-3 py-1.5"
          >
            Đăng nhập
          </Link>
          <Link
            href="/login"
            className="text-xs font-bold text-white bg-gradient-to-r from-amber-700 to-[#78350f] hover:from-amber-600 hover:to-[#5c2d12] px-4 py-2 rounded-xl transition-all duration-300 shadow-lg shadow-amber-700/10 active:scale-95"
          >
            Dùng thử miễn phí
          </Link>
        </div>

      </div>
    </header>
  );
}
