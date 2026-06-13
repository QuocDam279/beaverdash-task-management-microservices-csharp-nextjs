"use client";

import * as React from "react";
import Link from "next/link";
import { SidebarTooltip } from "@/components/ui/Tooltip";

interface CollapsedNavProps {
  pathname: string;
  activeProjectId: string | null;
  onExpand: () => void;
}

/**
 * Thanh điều hướng Sidebar ở chế độ thu gọn (collapsed).
 * Chỉ hiển thị icon với tooltip khi hover.
 */
export function SidebarCollapsedNav({
  pathname,
  activeProjectId,
  onExpand,
}: CollapsedNavProps) {
  return (
    <nav className="flex-1 py-4 flex flex-col items-center gap-5 overflow-y-auto overflow-x-hidden">
      <SidebarTooltip text="Công việc của tôi">
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
            strokeWidth="2.4"
          >
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        </Link>
      </SidebarTooltip>

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


      <SidebarTooltip text="Thùng rác">
        <Link
          href="/trash"
          className={`flex h-10 w-10 items-center justify-center rounded-[4px] transition-all duration-150 cursor-pointer ${
            pathname.startsWith("/trash")
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

      <SidebarTooltip text="Dự án được chia sẻ">
        <Link
          href="/shared-projects"
          className={`flex h-10 w-10 items-center justify-center rounded-[4px] transition-all duration-150 cursor-pointer ${
            pathname.startsWith("/shared-projects")
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
            strokeWidth="2.4"
            className="shrink-0"
          >
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        </Link>
      </SidebarTooltip>

      {/* Divider to separate main menu and projects section, matching the expanded sidebar visual categories */}
      <div className="w-8 border-t border-slate-200 my-1 shrink-0" />

      <SidebarTooltip text="Dự án">
        <button
          onClick={onExpand}
          className={`flex h-10 w-10 items-center justify-center rounded-[4px] transition-all duration-150 cursor-pointer ${
            pathname.startsWith("/projects/")
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
        </button>
      </SidebarTooltip>
    </nav>
  );
}
