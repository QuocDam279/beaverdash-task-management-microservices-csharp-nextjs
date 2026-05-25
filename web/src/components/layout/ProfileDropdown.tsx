"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/components/providers/AuthProvider";

interface ProfileDropdownProps {
  user: {
    displayName: string;
    avatar?: string | null;
    email: string;
  };
}

/**
 * Dropdown Avatar người dùng ở góc trên cùng bên phải.
 * Chứa các lựa chọn đi tới Trang cá nhân hoặc Đăng xuất.
 */
export function ProfileDropdown({ user }: ProfileDropdownProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
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

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 pl-3 border-l border-slate-200 cursor-pointer hover:opacity-80 active:opacity-95 transition-all focus-visible:outline-none py-1 select-none`}
        title="Tài khoản cá nhân"
      >
        <Avatar
          src={user.avatar}
          alt={user.displayName}
          className="h-7 w-7 rounded-full border border-slate-200 bg-slate-100 object-cover shrink-0"
        />
        <span className="text-xs font-bold text-[#292a2e] hidden sm:inline truncate max-w-[120px]">
          {user.displayName}
        </span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className={`text-slate-400 transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180 text-[#1868db]" : ""
          }`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown Menu Overlay */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[240px] bg-white border border-slate-200 rounded-md shadow-lg z-50 flex flex-col overflow-hidden py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* User Details Header */}
          <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
            <Avatar
              src={user.avatar}
              alt={user.displayName}
              className="h-10 w-10 rounded-full border border-slate-200 bg-slate-100 object-cover shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-extrabold text-[#292a2e] truncate" title={user.displayName}>
                {user.displayName}
              </p>
              <p className="text-[10px] text-slate-500 truncate" title={user.email}>
                {user.email}
              </p>
            </div>
          </div>

          {/* Action links */}
          <div className="py-1">
            <button
              onClick={handleGoToProfile}
              className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer font-medium transition-colors"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-slate-400"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Trang cá nhân
            </button>
          </div>

          {/* Separation & Logout */}
          <div className="border-t border-slate-100 pt-1">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-2.5 cursor-pointer font-bold transition-colors"
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
    </div>
  );
}
