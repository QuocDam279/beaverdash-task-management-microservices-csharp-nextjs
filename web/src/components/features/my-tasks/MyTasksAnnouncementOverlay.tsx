"use client";

import * as React from "react";
import { TaskItem } from "@/types/task";
import { User } from "@/types/auth";
import { AnnouncementSlideOverview } from "./AnnouncementSlideOverview";
import { AnnouncementSlideNotifications } from "./AnnouncementSlideNotifications";
import { AnnouncementStats } from "@/hooks/useMyTasksPage";

interface MyTasksAnnouncementOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: TaskItem[];
  currentUser: User | null;
  isTasksLoading: boolean;
}

/**
 * @component MyTasksAnnouncementOverlay
 * @description Lớp phủ (overlay) hiển thị bảng tin công việc tuần tự bắt buộc bao gồm tổng quan chỉ số và thông báo.
 */
export function MyTasksAnnouncementOverlay({
  isOpen,
  onClose,
  tasks,
  currentUser,
  isTasksLoading,
}: MyTasksAnnouncementOverlayProps) {
  const [activeSlide, setActiveSlide] = React.useState(1);
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [isNotifLoading, setIsNotifLoading] = React.useState(true);

  const unreadNotifications = React.useMemo(() => {
    return notifications.filter((n: any) => !n.isRead);
  }, [notifications]);

  // Fetch notifications
  React.useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const { api } = await import("@/lib/api");
        setIsNotifLoading(true);
        const data = await api.get("/notifications");
        setNotifications(data || []);
      } catch (err) {
        console.error("Failed to load notifications for announcement overlay:", err);
      } finally {
        setIsNotifLoading(false);
      }
    };
    if (isOpen) {
      fetchNotifs();
    }
  }, [isOpen]);

  // Compute stats
  const announcementStats = React.useMemo<AnnouncementStats>(() => {
    const now = new Date();
    const threeDaysFromNow = new Date(now);
    threeDaysFromNow.setDate(now.getDate() + 3);
    threeDaysFromNow.setHours(23, 59, 59, 999);

    let completed = 0;
    let overdueCount = 0;
    let upcomingCount = 0;

    tasks.forEach((t: any) => {
      if (t.isCompleted) {
        completed++;
      } else if (t.dueDate) {
        const dueDate = new Date(t.dueDate);
        if (dueDate < now) overdueCount++;
        else if (dueDate <= threeDaysFromNow) upcomingCount++;
      }
    });

    return {
      total: tasks.length,
      completed,
      uncompleted: tasks.length - completed,
      overdueCount,
      upcomingCount,
    };
  }, [tasks]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 cursor-pointer select-none animate-in fade-in duration-300"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md w-full shadow-2xl relative flex flex-col text-[#292a2e] min-h-[460px] justify-between transition-all duration-300 hover:border-slate-300 cursor-default"
      >
        <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r from-blue-600 via-[#1868db] to-blue-500" />
        
        {/* Close Button "X" */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer z-10"
          title="Đóng bảng tin"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Step Header */}
        <div className="w-full flex items-center justify-between border-b border-slate-100 pb-3 mb-6 mt-2 shrink-0">
          <span className={`text-[10px] font-bold uppercase tracking-wider ${activeSlide === 1 ? "text-[#1868db]" : "text-indigo-600"}`}>
            {activeSlide === 1 ? "Tổng Quan Công Việc" : "Thông Báo Chưa Đọc"}
          </span>
          <span className="text-[10px] font-bold text-slate-400">
            {activeSlide} / 2
          </span>
        </div>

        {/* Slides Content */}
        <div className="w-full flex-1 flex flex-col items-center justify-center">
          {activeSlide === 1 ? (
            <AnnouncementSlideOverview
              isTasksLoading={isTasksLoading}
              announcementStats={announcementStats}
              currentUser={currentUser}
            />
          ) : (
            <AnnouncementSlideNotifications
              isNotifLoading={isNotifLoading}
              unreadNotifications={unreadNotifications}
            />
          )}
        </div>

        {/* Navigation & CTA Controls */}
        <div className="w-full mt-6 space-y-3 shrink-0">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <span className={`h-1.5 rounded-full transition-all duration-300 ${activeSlide === 1 ? "bg-[#1868db] w-3" : "bg-slate-200 w-1.5"}`} />
            <span className={`h-1.5 rounded-full transition-all duration-300 ${activeSlide === 2 ? "bg-indigo-600 w-3" : "bg-slate-200 w-1.5"}`} />
          </div>

          <button
            onClick={(e) => {
              if (activeSlide === 1 && unreadNotifications.length > 0) {
                e.stopPropagation();
                setActiveSlide(2);
              } else {
                onClose();
              }
            }}
            className={`w-full py-2.5 font-bold rounded-lg text-xs transition-all duration-300 shadow-md cursor-pointer text-white ${
              activeSlide === 1 && unreadNotifications.length > 0
                ? "bg-gradient-to-r from-blue-600 to-[#1868db] hover:from-blue-500 hover:to-[#0052cc] hover:shadow-blue-500/20"
                : "bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 hover:shadow-indigo-500/20"
            }`}
          >
            {activeSlide === 1 && unreadNotifications.length > 0 ? "Xem Thông Báo ➔" : "Bắt Đầu Làm Việc"}
          </button>

          {activeSlide === 2 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveSlide(1);
              }}
              className="text-[10px] text-slate-500 hover:text-[#1868db] font-bold uppercase tracking-wider cursor-pointer hover:underline text-center w-full mt-1.5 block"
            >
              ⬅ Quay lại trang trước
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
