"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { SearchResultDto } from "@/types/api";
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
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<SearchResultDto[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Sync state when props change
  React.useEffect(() => {
    setUser(currentUser);
  }, [currentUser]);

  // Debounced search logic
  React.useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results: SearchResultDto[] = await api.get(`/search?q=${encodeURIComponent(searchQuery)}`);
        setSearchResults(results || []);
        setShowDropdown(true);
      } catch (err) {
        console.error("Failed to fetch search results:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Click outside search dropdown logic
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleResultClick = (actionUrl: string) => {
    setShowDropdown(false);
    setSearchQuery("");
    router.push(actionUrl);
  };

  return (
    <header className="relative h-14 border-b border-slate-200 bg-white flex items-center justify-between px-6 z-40 select-none shrink-0">
      {/* Left: Search input */}
      <div className="relative w-96 max-w-md hidden md:block" ref={dropdownRef}>
        <input
          type="text"
          placeholder="Tìm kiếm nhóm, dự án, công việc..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => {
            if (searchResults.length > 0) setShowDropdown(true);
          }}
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

        {isSearching && (
          <div className="absolute right-2.5 top-2.5 h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-200 border-t-[#1868db]" />
        )}

        {showDropdown && (
          <div className="absolute left-0 mt-1.5 w-full bg-white border border-slate-200 rounded-[6px] shadow-xl z-50 flex flex-col overflow-hidden max-h-[300px] animate-in fade-in slide-in-from-top-1 duration-100">
            <div className="overflow-y-auto divide-y divide-slate-50 scrollbar-thin">
              {searchResults.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  Không tìm thấy kết quả phù hợp
                </div>
              ) : (
                searchResults.map((result) => {
                  let badgeStyle = "bg-slate-100 text-slate-600 border-slate-200";
                  if (result.type === "team") badgeStyle = "bg-purple-50 text-purple-700 border-purple-200";
                  if (result.type === "project") badgeStyle = "bg-teal-50 text-teal-700 border-teal-200";
                  if (result.type === "task") badgeStyle = "bg-blue-50 text-blue-700 border-blue-200";
                  if (result.type === "subtask") badgeStyle = "bg-indigo-50 text-indigo-700 border-indigo-200";

                  return (
                    <div
                      key={result.id}
                      onClick={() => handleResultClick(result.actionUrl)}
                      className="flex items-start gap-3 p-3 hover:bg-slate-50/80 cursor-pointer transition-colors text-left"
                    >
                      <span className={`px-2 py-0.5 rounded-[4px] text-[9px] font-extrabold uppercase border shrink-0 mt-0.5 ${badgeStyle}`}>
                        {result.type === "team" ? "Nhóm" :
                         result.type === "project" ? "Dự án" :
                         result.type === "task" ? "Chính" : "Phụ"}
                      </span>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-700 leading-normal truncate">
                          {result.title}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                          {result.subtitle}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
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
