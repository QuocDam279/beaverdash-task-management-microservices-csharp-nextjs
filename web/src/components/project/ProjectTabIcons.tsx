"use client";

import * as React from "react";

/**
 * Lấy Icon SVG phù hợp cho từng tab trong Dự án.
 * Mỗi icon có màu sắc riêng biệt nhưng được thiết kế đồng bộ với giao diện hiện đại (clean UI).
 */
export function getTabIcon(name: string): React.ReactNode {
  const normalized = name.trim().toLowerCase();

  switch (normalized) {
    case "tổng quan":
      return (
        <svg
          className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 group-hover:scale-110 transition-transform duration-200 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z"
          />
        </svg>
      );

    case "bảng công việc":
      return (
        <svg
          className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-200 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
          />
        </svg>
      );

    case "backlog":
      return (
        <svg
          className="w-3.5 h-3.5 text-pink-500 dark:text-pink-400 group-hover:scale-110 transition-transform duration-200 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      );

    case "lịch":
      return (
        <svg
          className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400 group-hover:scale-110 transition-transform duration-200 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      );

    case "danh sách":
      return (
        <svg
          className="w-3.5 h-3.5 text-teal-500 dark:text-teal-400 group-hover:scale-110 transition-transform duration-200 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      );

    case "sơ đồ gantt":
      return (
        <svg
          className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500 group-hover:scale-110 transition-transform duration-200 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 3v18h18M7 7h6M11 12h7M8 17h5"
          />
        </svg>
      );

    case "tài liệu":
      return (
        <svg
          className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-200 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      );

    case "ai trợ lý":
      return (
        <svg
          className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400 group-hover:scale-110 transition-transform duration-200 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.813 15.904L9 21l-.813-5.096L3 15l5.096-.813L9 9l.813 5.096L15 15l-5.187.904zM18.007 7.007L17 10l-1.007-2.993L13 6l2.993-1.007L17 2l1.007 2.993L21 6l-2.993 1.007z"
          />
        </svg>
      );

    case "trò chuyện":
      return (
        <svg
          className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400 group-hover:scale-110 transition-transform duration-200 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      );

    default:
      return null;
  }
}
