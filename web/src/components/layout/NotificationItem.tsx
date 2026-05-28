"use client";

/**
 * @component NotificationItem
 * @description Hiển thị một mục thông báo đơn lẻ trong danh sách dropdown thông báo.
 */

import * as React from "react";
import { formatRelativeTime } from "@/lib/utils";
import { Notification } from "@/types/task";
import { Avatar } from "@/components/ui/Avatar";

interface NotificationItemProps {
  notification: Notification;
  onNotificationClick: (n: Notification) => void;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export function NotificationItem({
  notification,
  onNotificationClick,
  onMarkAsRead,
  onDelete,
}: NotificationItemProps) {
  const n = notification;

  return (
    <div
      onClick={() => onNotificationClick(n)}
      className={`flex items-start gap-3 p-3 hover:bg-slate-50 cursor-pointer transition-colors relative ${
        !n.isRead ? "bg-slate-50/50" : ""
      }`}
    >
      {/* Actor Avatar */}
      <Avatar
        src={n.actorUser?.avatar}
        alt={n.actorUser?.displayName || "System"}
        className="h-7 w-7 rounded-full border border-slate-100 object-cover shrink-0 mt-0.5"
      />
      {/* Message Content */}
      <div className="flex-1 min-w-0 pr-14">
        <p className={`text-xs text-slate-700 leading-normal ${!n.isRead ? "font-bold" : "font-normal"}`}>
          {n.content}
        </p>
        <span className="text-[9px] font-bold text-slate-400 mt-1.5 block">
          {formatRelativeTime(n.createdAt)}
        </span>
      </div>
      {/* Action buttons (Read check & Trash delete) */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
        {!n.isRead && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMarkAsRead(n.id);
            }}
            className="h-6 w-6 flex items-center justify-center rounded-full hover:bg-slate-200 text-[#1868db] transition-colors"
            title="Đánh dấu đã đọc"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(n.id);
          }}
          className="h-6 w-6 flex items-center justify-center rounded-full hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
          title="Xóa thông báo"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
