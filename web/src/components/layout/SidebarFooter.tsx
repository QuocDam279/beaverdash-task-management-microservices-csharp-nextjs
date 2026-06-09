"use client";

import * as React from "react";

interface SidebarFooterProps {
  isCollapsed: boolean;
  onOpenSettings: () => void;
}

/**
 * Footer của Sidebar hiển thị thông tin phiên bản ứng dụng và nút cài đặt.
 */
export function SidebarFooter({ isCollapsed, onOpenSettings }: SidebarFooterProps) {
  const settingsButton = (
    <button
      onClick={onOpenSettings}
      className="flex h-7 w-7 items-center justify-center rounded-[4px] text-[#505258] hover:bg-slate-200/60 hover:text-[#1868db] transition-all duration-150 cursor-pointer"
      title="Cài đặt hệ thống"
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        className="hover:rotate-45 transition-transform duration-200"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    </button>
  );

  return (
    <div className="p-4 pb-6 border-t border-slate-200 dark:border-[#2c3338] flex items-center justify-center shrink-0">
      {settingsButton}
    </div>
  );
}
