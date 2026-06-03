"use client";

import * as React from "react";

interface AnnouncementSlideNotificationsProps {
  isNotifLoading: boolean;
  unreadNotifications: any[];
}

/**
 * @component AnnouncementSlideNotifications
 * @description Slide 2 hiển thị danh sách các thông báo chưa đọc của người dùng trong bảng tin.
 */
export function AnnouncementSlideNotifications({
  isNotifLoading,
  unreadNotifications,
}: AnnouncementSlideNotificationsProps) {
  return (
    <div key="tab-2" className="w-full flex flex-col items-center animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Decorative Icon */}
      <div className="h-12 w-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-4 text-indigo-600">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      </div>

      {/* Title */}
      <h2 className="text-lg font-bold tracking-tight text-[#292a2e] mb-1 text-center">
        HỘP THƯ THÔNG BÁO
      </h2>
      <p className="text-[11px] text-[#505258] mb-5 text-center">
        Các thông báo chưa đọc từ dự án và đồng nghiệp
      </p>

      {/* Notifications list */}
      {isNotifLoading ? (
        <div className="py-8 flex flex-col items-center justify-center gap-3">
          <svg className="animate-spin h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-xs font-semibold text-slate-400 animate-pulse">Đang tải thông báo...</span>
        </div>
      ) : unreadNotifications.length === 0 ? (
        <div className="w-full py-8 flex flex-col items-center justify-center text-center bg-emerald-50/20 rounded-xl p-4 border border-emerald-100">
          <span className="text-2xl mb-1.5">🎉</span>
          <span className="text-xs font-bold text-emerald-600">Không có thông báo chưa đọc</span>
          <span className="text-[10px] text-slate-500 mt-0.5">Tuyệt vời! Bạn đã đọc hết tất cả thông báo gần đây.</span>
        </div>
      ) : (
        <div className="w-full space-y-2.5 my-1">
          {unreadNotifications.slice(0, 3).map((n) => (
            <div
              key={n.id}
              className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-left text-xs hover:bg-slate-100/50 transition-colors flex items-start gap-2.5"
            >
              <div className="h-6 w-6 rounded-full bg-indigo-100 text-indigo-600 border border-indigo-200 flex items-center justify-center shrink-0 text-[10px] font-bold">
                {n.actorUser?.displayName ? n.actorUser.displayName.charAt(0).toUpperCase() : "S"}
              </div>
              <div className="space-y-0.5 min-w-0">
                <p className="font-semibold text-[#292a2e] leading-normal line-clamp-2">
                  {n.content}
                </p>
                <span className="text-[9px] text-[#6b6e76] font-bold block">
                  {(() => {
                    const d = new Date(n.createdAt);
                    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} - ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
                  })()}
                </span>
              </div>
            </div>
          ))}
          {unreadNotifications.length > 3 && (
            <p className="text-[9px] text-[#505258]/80 text-center font-bold uppercase tracking-wider">
              Và {unreadNotifications.length - 3} thông báo chưa đọc khác
            </p>
          )}
        </div>
      )}
    </div>
  );
}
