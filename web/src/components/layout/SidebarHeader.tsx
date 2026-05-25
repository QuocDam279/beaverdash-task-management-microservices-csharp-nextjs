"use client";

import * as React from "react";
import Link from "next/link";

interface SidebarHeaderProps {
  isCollapsed: boolean;
}

/**
 * Header của Sidebar chứa logo Beaverdash và tên ứng dụng.
 * Tự động ẩn tên khi sidebar thu gọn, chỉ hiển thị logo.
 */
export function SidebarHeader({ isCollapsed }: SidebarHeaderProps) {
  return (
    <div
      className={`h-14 border-b border-slate-200 flex items-center shrink-0 bg-[#f4f5f7] ${
        isCollapsed ? "justify-center px-2" : "justify-between px-4"
      }`}
    >
      <Link
        href="/teams"
        className="flex items-center gap-2.5 focus-visible:outline-none cursor-pointer hover:opacity-90 transition-opacity overflow-hidden"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-md shrink-0 overflow-hidden">
          <img
            src="/logo.svg"
            alt="Beaverdash Logo"
            className="h-full w-full object-contain"
          />
        </div>
        {!isCollapsed && (
          <span className="text-base font-bold text-[#292a2e] tracking-tight truncate">
            BeaverDash
          </span>
        )}
      </Link>
    </div>
  );
}
