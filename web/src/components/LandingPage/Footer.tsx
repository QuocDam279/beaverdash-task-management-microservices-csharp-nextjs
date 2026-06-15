"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";

/**
 * @component Footer
 * @description Phần cuối trang (Footer) chứa thông tin bản quyền và liên kết phụ.
 */
export function Footer() {
  return (
    <footer className="border-t border-stone-200/80 bg-[#fbfaf8] py-12 select-none text-[10.5px]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand Column */}
        <div className="space-y-3.5 text-left">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Beaverdash Logo" width={24} height={24} className="object-contain" />
            <span className="font-extrabold text-xs tracking-tight text-[#2b221a]">BeaverDash</span>
          </div>
          <p className="text-stone-500 leading-relaxed max-w-[200px]">
            Nâng tầm hiệu suất công việc đội nhóm thời gian thực với sức mạnh của Trợ lý AI.
          </p>
        </div>

        {/* Product Links */}
        <div className="space-y-3.5 text-left">
          <h4 className="font-bold text-stone-700 uppercase tracking-wider text-[9.5px]">Sản phẩm</h4>
          <ul className="space-y-2 text-stone-500 font-medium">
            <li><a href="#features" className="hover:text-[#78350f] transition-colors">Tính năng</a></li>
            <li><a href="#pricing" className="hover:text-[#78350f] transition-colors">Bảng giá dịch vụ</a></li>
            <li><Link href="/login" className="hover:text-[#78350f] transition-colors">Yêu cầu Demo</Link></li>
          </ul>
        </div>

        {/* Resources Links */}
        <div className="space-y-3.5 text-left">
          <h4 className="font-bold text-stone-700 uppercase tracking-wider text-[9.5px]">Tài nguyên</h4>
          <ul className="space-y-2 text-stone-500 font-medium">
            <li><a href="#" className="hover:text-[#78350f] transition-colors">Tài liệu hướng dẫn</a></li>
            <li><a href="#" className="hover:text-[#78350f] transition-colors">Blog chia sẻ</a></li>
            <li><a href="#" className="hover:text-[#78350f] transition-colors">Hỗ trợ khách hàng</a></li>
          </ul>
        </div>

        {/* Legal Links */}
        <div className="space-y-3.5 text-left">
          <h4 className="font-bold text-stone-700 uppercase tracking-wider text-[9.5px]">Pháp lý</h4>
          <ul className="space-y-2 text-stone-500 font-medium">
            <li><a href="#" className="hover:text-[#78350f] transition-colors">Điều khoản dịch vụ</a></li>
            <li><a href="#" className="hover:text-[#78350f] transition-colors">Chính sách bảo mật</a></li>
            <li><a href="#" className="hover:text-[#78350f] transition-colors">Tuân thủ GDPR</a></li>
          </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 mt-10 pt-6 border-t border-stone-200/60 flex flex-col md:flex-row items-center justify-between gap-4 text-stone-400 font-mono text-[9px]">
        <span>© 2026 BEAVERDASH MICROSERVICES PROJECT. ALL RIGHTS RESERVED.</span>
        <span>CRAFTED WITH PASSION FOR MODERN TEAMS.</span>
      </div>
    </footer>
  );
}
