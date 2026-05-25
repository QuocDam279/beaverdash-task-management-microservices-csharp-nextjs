"use client";

import * as React from "react";
import { NotificationDropdown } from "./NotificationDropdown";
import { ProfileDropdown } from "./ProfileDropdown";

interface TopHeaderProps {
  currentUser: {
    displayName: string;
    avatar?: string | null;
    email: string;
  };
}

/**
 * Header toàn cục nằm trên cùng bên phải (ngoài Sidebar).
 * Chứa thanh tìm kiếm, nút thông báo và dropdown thông tin người dùng.
 */
export function TopHeader({ currentUser }: TopHeaderProps) {
  const [user, setUser] = React.useState(currentUser);

  // Sync state when props change
  React.useEffect(() => {
    setUser(currentUser);
  }, [currentUser]);


  return (
    <header className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-6 z-20 select-none shrink-0">
      {/* Left: Search input */}
      <div className="relative w-96 max-w-md hidden md:block">
        <input
          type="text"
          placeholder="Tìm kiếm..."
          className="w-full px-3 py-1.5 pl-8 text-xs border border-slate-300 rounded-[4px] bg-white text-[#292a2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1868db] focus-visible:border-transparent transition-all placeholder:text-slate-400"
        />
        <svg
          className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </div>

      {/* Right: Notifications & User Avatar */}
      <div className="flex items-center gap-4">
        {/* Notifications Bell with Dropdown */}
        <NotificationDropdown />

        {/* User Profile Dropdown */}
        <ProfileDropdown user={user} />
      </div>
    </header>
  );
}
