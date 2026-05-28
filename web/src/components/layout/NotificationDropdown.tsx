"use client";

/**
 * @component NotificationDropdown
 * @description Dropdown thông báo ở góc trên cùng bên phải Header.
 */

import * as React from "react";
import { NotificationItem } from "./NotificationItem";
import { useNotifications } from "@/hooks/useNotifications";

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    filteredNotifications,
    filterTab,
    setFilterTab,
    handleMarkAsRead,
    handleMarkAllAsRead,
    handleDeleteNotification,
    handleClearAllNotifications,
    handleNotificationClick,
  } = useNotifications(isOpen, setIsOpen);

  // Xử lý sự kiện click ra ngoài để đóng dropdown
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        title="Thông báo"
        onClick={() => setIsOpen(!isOpen)}
        className={`p-1.5 rounded-[4px] border border-slate-200 text-[#505258] hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer relative ${
          isOpen ? "bg-slate-100 border-slate-300" : ""
        }`}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-[9px] font-extrabold text-white shadow-xs">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Overlay */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[340px] bg-white border border-slate-200 rounded-md shadow-lg z-50 flex flex-col overflow-hidden max-h-[420px] animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Dropdown Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50 shrink-0">
            <span className="text-xs font-bold text-[#292a2e]">Thông báo ({unreadCount})</span>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-[10px] font-bold text-[#1868db] hover:text-[#0052cc] hover:underline cursor-pointer"
                >
                  Đọc tất cả
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAllNotifications}
                  className="text-[10px] font-bold text-red-600 hover:text-red-800 hover:underline cursor-pointer"
                >
                  Xóa tất cả
                </button>
              )}
            </div>
          </div>

          {/* Tab Filter */}
          <div className="flex border-b border-slate-100 bg-slate-50/20 px-3 shrink-0">
            <button
              onClick={() => setFilterTab("all")}
              className={`flex-1 py-2 text-center text-[10px] font-bold tracking-wider uppercase border-b-2 transition-all cursor-pointer ${
                filterTab === "all"
                  ? "border-[#1868db] text-[#1868db]"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilterTab("unread")}
              className={`flex-1 py-2 text-center text-[10px] font-bold tracking-wider uppercase border-b-2 transition-all cursor-pointer relative ${
                filterTab === "unread"
                  ? "border-[#1868db] text-[#1868db]"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              Chưa đọc
              {unreadCount > 0 && (
                <span className="ml-1.5 px-1 py-0.2 bg-red-500 rounded-full text-[8px] font-extrabold text-white">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Scrollable List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[320px] scrollbar-thin">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center select-none">
                <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center mb-2.5">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-slate-400">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </div>
                <p className="text-xs font-bold text-slate-700">
                  {filterTab === "unread" ? "Không có thông báo chưa đọc" : "Không có thông báo mới"}
                </p>
                <p className="text-[10px] text-slate-400 mt-1 max-w-[200px]">Chúng tôi sẽ báo cho bạn khi có cập nhật mới.</p>
              </div>
            ) : (
              filteredNotifications.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onNotificationClick={handleNotificationClick}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDeleteNotification}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
