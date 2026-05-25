"use client";

import * as React from "react";
import Link from "next/link";
import { SidebarTooltip } from "@/components/ui/Tooltip";

interface CollapsedNavProps {
  pathname: string;
  activeProjectId: string | null;
}

/**
 * Thanh điều hướng Sidebar ở chế độ thu gọn (collapsed).
 * Chỉ hiển thị icon với tooltip khi hover.
 */
export function SidebarCollapsedNav({
  pathname,
  activeProjectId,
}: CollapsedNavProps) {
  return (
    <nav className="flex-1 py-4 flex flex-col items-center gap-5 overflow-y-auto overflow-x-hidden">
      <SidebarTooltip text="Nhóm">
        <Link
          href="/teams"
          className={`flex h-10 w-10 items-center justify-center rounded-[4px] transition-all duration-150 cursor-pointer ${
            pathname.startsWith("/teams")
              ? "bg-[#1868db]/10 text-[#1868db]"
              : "text-[#505258] hover:bg-slate-200/60 hover:text-[#1868db]"
          }`}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </Link>
      </SidebarTooltip>

      <SidebarTooltip text="Dự án">
        <Link
          href={activeProjectId ? `/projects/${activeProjectId}` : "/teams"}
          className={`flex h-10 w-10 items-center justify-center rounded-[4px] transition-all duration-150 cursor-pointer ${
            pathname.startsWith("/projects/") && !pathname.endsWith("/board")
              ? "bg-[#1868db]/10 text-[#1868db]"
              : "text-[#505258] hover:bg-slate-200/60 hover:text-[#1868db]"
          }`}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
          >
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
        </Link>
      </SidebarTooltip>

      <SidebarTooltip text="Công việc">
        <Link
          href="/tasks"
          className={`flex h-10 w-10 items-center justify-center rounded-[4px] transition-all duration-150 cursor-pointer ${
            pathname.startsWith("/tasks")
              ? "bg-[#1868db]/10 text-[#1868db]"
              : "text-[#505258] hover:bg-slate-200/60 hover:text-[#1868db]"
          }`}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        </Link>
      </SidebarTooltip>

      <SidebarTooltip text="Trợ lý Beaver">
        <Link
          href="/ai-assistant"
          className={`flex h-10 w-10 items-center justify-center rounded-[4px] transition-all duration-150 cursor-pointer ${
            pathname === "/ai-assistant"
              ? "bg-[#1868db]/10 text-[#1868db]"
              : "text-[#505258] hover:bg-slate-200/60 hover:text-[#1868db]"
          }`}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <path d="M12 7v6M9 10h6" />
          </svg>
        </Link>
      </SidebarTooltip>

      <SidebarTooltip text="Thùng rác">
        <Link
          href="/trash"
          className={`flex h-10 w-10 items-center justify-center rounded-[4px] transition-all duration-150 cursor-pointer ${
            pathname === "/trash"
              ? "bg-[#1868db]/10 text-[#1868db]"
              : "text-[#505258] hover:bg-slate-200/60 hover:text-[#1868db]"
          }`}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
          >
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </Link>
      </SidebarTooltip>
    </nav>
  );
}
