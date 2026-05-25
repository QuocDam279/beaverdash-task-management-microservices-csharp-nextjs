"use client";

import * as React from "react";

interface SidebarFooterProps {
  isCollapsed: boolean;
}

/**
 * Footer của Sidebar hiển thị thông tin phiên bản ứng dụng.
 */
export function SidebarFooter({ isCollapsed }: SidebarFooterProps) {
  return (
    <div className="p-4 pb-6 border-t border-slate-200 text-center shrink-0">
      <p className="text-[10px] text-[#6b6e76] font-semibold truncate">
        {isCollapsed ? "v1.0" : "Beaverdash Monorepo v1.0"}
      </p>
    </div>
  );
}
