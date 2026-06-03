"use client";

import * as React from "react";
import { User } from "@/types/auth";
import { AnnouncementStats } from "@/hooks/useMyTasksPage";

interface AnnouncementSlideOverviewProps {
  isTasksLoading: boolean;
  announcementStats: AnnouncementStats;
  currentUser: User | null;
}

/**
 * @component AnnouncementSlideOverview
 * @description Slide 1 hiển thị tổng quan tiến độ công việc của người dùng trong bảng tin.
 */
export function AnnouncementSlideOverview({
  isTasksLoading,
  announcementStats,
  currentUser,
}: AnnouncementSlideOverviewProps) {
  return (
    <div key="tab-1" className="w-full flex flex-col items-center animate-in fade-in slide-in-from-left-4 duration-300">
      {/* Decorative Icon */}
      <div className="h-12 w-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center mb-4 text-[#1868db]">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </div>

      {/* Greeting Title */}
      <h2 className="text-lg font-bold tracking-tight text-[#292a2e] mb-1 text-center">
        BẢNG TIN CÔNG VIỆC
      </h2>
      <p className="text-[11px] text-[#505258] mb-5 text-center">
        Chào mừng {currentUser?.displayName || "bạn"} trở lại hệ thống!
      </p>

      {/* Stats Body */}
      {isTasksLoading ? (
        <div className="py-8 flex flex-col items-center justify-center gap-3">
          <svg className="animate-spin h-6 w-6 text-[#1868db]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-xs font-semibold text-slate-400 animate-pulse">Đang tổng hợp dữ liệu...</span>
        </div>
      ) : (
        <div className="w-full space-y-3.5 my-1 text-left bg-slate-50 rounded-xl p-4 border border-slate-100">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#505258] font-medium">Tổng số công việc được giao:</span>
            <span className="font-bold text-[#292a2e]">{announcementStats.total}</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-[#505258] font-medium">Công việc đã hoàn thành:</span>
            <span className="font-bold text-emerald-600">{announcementStats.completed}</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-[#505258] font-medium">Công việc chưa hoàn thành:</span>
            <span className="font-bold text-amber-600">{announcementStats.uncompleted}</span>
          </div>

          {announcementStats.overdueCount > 0 && (
            <div className="flex justify-between items-center text-xs border-t border-slate-200/60 pt-2.5">
              <span className="text-red-600 font-bold flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
                Công việc quá hạn:
              </span>
              <span className="font-extrabold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-100 text-[10px]">
                {announcementStats.overdueCount} việc
              </span>
            </div>
          )}

          {announcementStats.upcomingCount > 0 && (
            <div className={`flex justify-between items-center text-xs ${announcementStats.overdueCount === 0 ? "border-t border-slate-200/60 pt-2.5" : ""}`}>
              <span className="text-amber-600 font-semibold flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Sắp đến hạn (3 ngày):
              </span>
              <span className="font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 text-[10px]">
                {announcementStats.upcomingCount} việc
              </span>
            </div>
          )}
        </div>
      )}

      {/* CTA advice */}
      {!isTasksLoading && (
        <div className="mt-3 text-center">
          {announcementStats.overdueCount > 0 ? (
            <p className="text-[10px] text-red-600 font-semibold leading-relaxed">
              ⚠️ Bạn có công việc quá hạn! Vui lòng ưu tiên hoàn thành chúng.
            </p>
          ) : (
            <p className="text-[10px] text-[#505258] font-semibold leading-relaxed">
              ✨ Chúc bạn có một ngày làm việc hiệu quả và nhiều niềm vui!
            </p>
          )}
        </div>
      )}
    </div>
  );
}
