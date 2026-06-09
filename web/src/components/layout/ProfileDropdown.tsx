"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/components/providers/AuthProvider";
import { SettingsModal } from "./SettingsModal";

interface ProfileDropdownProps {
  user: {
    displayName: string;
    avatar?: string | null;
    email: string;
  };
}

/**
 * Dropdown Avatar người dùng ở góc trên cùng bên phải.
 * Chứa các lựa chọn đi tới Trang cá nhân, Cài đặt hệ thống, hoặc Đăng xuất.
 */
export function ProfileDropdown({ user }: ProfileDropdownProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Xử lý click ra ngoài để đóng dropdown
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { logout } = useAuth();

  const handleLogout = () => {
    setIsOpen(false);
    logout();
  };

  const handleGoToProfile = () => {
    setIsOpen(false);
    router.push("/profile");
  };

  const handleOpenSettings = () => {
    setIsOpen(false);
    setIsSettingsOpen(true);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-[#2c3338] cursor-pointer hover:opacity-80 active:opacity-95 transition-all focus-visible:outline-none py-1 select-none"
        title="Tài khoản cá nhân"
      >
        <Avatar
          src={user.avatar}
          alt={user.displayName}
          className="h-7 w-7 rounded-full border border-slate-200 dark:border-[#2c3338] bg-slate-100 dark:bg-[#2c3338] object-cover shrink-0"
        />
        <span className="text-xs font-bold text-[#292a2e] dark:text-[#deebff] hidden sm:inline truncate max-w-[120px]">
          {user.displayName}
        </span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className={`text-slate-400 dark:text-slate-500 transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180 text-[#1868db] dark:text-[#579dff]" : ""
          }`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown Menu Overlay */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[240px] bg-white dark:bg-[#22272b] border border-slate-200 dark:border-[#353e47] rounded-md shadow-lg z-50 flex flex-col overflow-hidden py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* User Details Header */}
          <div className="px-4 py-3 border-b border-slate-100 dark:border-[#2c3338] flex items-center gap-3">
            <Avatar
              src={user.avatar}
              alt={user.displayName}
              className="h-10 w-10 rounded-full border border-slate-200 dark:border-[#2c3338] bg-slate-100 dark:bg-[#2c3338] object-cover shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-extrabold text-[#292a2e] dark:text-[#deebff] truncate" title={user.displayName}>
                {user.displayName}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate" title={user.email}>
                {user.email}
              </p>
            </div>
          </div>

          {/* Action links */}
          <div className="py-1">
            <button
              onClick={handleGoToProfile}
              className="w-full text-left px-4 py-2.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#2c3338] flex items-center gap-2.5 cursor-pointer font-medium transition-colors"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-slate-400 dark:text-slate-500"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Trang cá nhân
            </button>

            <button
              onClick={handleOpenSettings}
              className="w-full text-left px-4 py-2.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#2c3338] flex items-center gap-2.5 cursor-pointer font-medium transition-colors"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-slate-400 dark:text-slate-500"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              Cài đặt hệ thống
            </button>
          </div>

          {/* Separation & Logout */}
          <div className="border-t border-slate-100 dark:border-[#2c3338] pt-1">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-700 dark:hover:text-red-400 flex items-center gap-2.5 cursor-pointer font-bold transition-colors"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-red-400"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Đăng xuất
            </button>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}
