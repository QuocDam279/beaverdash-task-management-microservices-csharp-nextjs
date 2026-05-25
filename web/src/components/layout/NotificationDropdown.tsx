"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { formatRelativeTime } from "@/lib/utils";
import { Notification } from "@/types/task";
import { Avatar } from "@/components/ui/Avatar";
import { api } from "@/lib/api";
import { HubConnectionBuilder, HubConnection, LogLevel } from "@microsoft/signalr";

/**
 * Dropdown thông báo ở góc trên cùng bên phải Header.
 * Hiển thị chuông báo, số lượng chưa đọc, và danh sách thông báo thực từ API.
 */
export function NotificationDropdown() {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const fetchNotifications = React.useCallback(async () => {
    try {
      const data: any[] = await api.get("/notifications");
      const mappedData: Notification[] = (data || []).map((n) => ({
        ...n,
        actorUser: n.actorUser || (n.actorDisplayName ? {
          id: n.actorUserId,
          displayName: n.actorDisplayName,
          avatar: n.actorAvatar,
          email: ""
        } : null)
      }));
      setNotifications(mappedData);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  }, []);

  // Khởi tạo danh sách thông báo từ API thật
  React.useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Kết nối SignalR Hub thời gian thực
  React.useEffect(() => {
    let connection: HubConnection | null = null;

    const startConnection = async () => {
      try {
        const token = localStorage.getItem("beaverdash_token");
        connection = new HubConnectionBuilder()
          .withUrl("http://localhost:5000/hubs/notifications", {
            accessTokenFactory: () => token || "",
          })
          .configureLogging(LogLevel.Warning)
          .withAutomaticReconnect()
          .build();

        connection.on("ReceiveNotification", (notificationData: any) => {
          setNotifications((prev) => {
            if (prev.some((n) => n.id === notificationData.id)) {
              return prev;
            }
            
            const newNotif: Notification = {
              id: notificationData.id,
              userId: "",
              actorUserId: notificationData.actorUserId || "",
              type: notificationData.type,
              content: notificationData.content,
              actionUrl: notificationData.actionUrl,
              isRead: false,
              isSentViaEmail: false,
              emailSentAt: null,
              createdAt: notificationData.createdAt,
              actorUser: notificationData.actorDisplayName ? {
                id: notificationData.actorUserId,
                displayName: notificationData.actorDisplayName,
                avatar: notificationData.actorAvatar,
                email: ""
              } : null
            };
            
            return [newNotif, ...prev];
          });
        });

        await connection.start();
        console.log("Connected to SignalR Notification Hub.");
      } catch (err) {
        console.error("Failed to start SignalR connection:", err);
      }
    };

    startConnection();

    return () => {
      if (connection) {
        connection.stop()
          .then(() => console.log("SignalR connection stopped."))
          .catch((err) => console.error("Error stopping SignalR connection:", err));
      }
    };
  }, []);

  // Làm mới khi mở dropdown
  React.useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

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

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Đánh dấu một thông báo đã đọc
  const handleMarkAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`, {});
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  // Đánh dấu tất cả thông báo là đã đọc
  const handleMarkAllAsRead = async () => {
    const unreadNotifications = notifications.filter((n) => !n.isRead);
    if (unreadNotifications.length === 0) return;

    try {
      // Gọi API song song đánh dấu đã đọc cho tất cả thông báo chưa đọc
      await Promise.all(
        unreadNotifications.map((n) => api.patch(`/notifications/${n.id}/read`, {}))
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  // Click vào thông báo để chuyển trang và đánh dấu đã đọc
  const handleNotificationClick = (notification: Notification) => {
    handleMarkAsRead(notification.id);
    setIsOpen(false);
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

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
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-[10px] font-bold text-[#1868db] hover:text-[#0052cc] hover:underline cursor-pointer"
              >
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>

          {/* Scrollable List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[320px] scrollbar-thin">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center select-none">
                <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center mb-2.5">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-slate-400">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </div>
                <p className="text-xs font-bold text-slate-700">Không có thông báo mới</p>
                <p className="text-[10px] text-slate-400 mt-1 max-w-[200px]">Chúng tôi sẽ báo cho bạn khi có cập nhật mới.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
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
                  <div className="flex-1 min-w-0 pr-4">
                    <p className={`text-xs text-slate-700 leading-normal ${!n.isRead ? "font-bold" : "font-normal"}`}>
                      {n.content}
                    </p>
                    <span className="text-[9px] font-bold text-slate-400 mt-1.5 block">
                      {formatRelativeTime(n.createdAt)}
                    </span>
                  </div>
                  {/* Unread mark with hover mark-read check button */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {!n.isRead ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(n.id);
                        }}
                        className="group/btn relative h-4 w-4 flex items-center justify-center"
                        title="Đánh dấu đã đọc"
                      >
                        <span className="block h-1.5 w-1.5 rounded-full bg-[#1868db] group-hover/btn:hidden" />
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3.5"
                          className="text-[#1868db] hidden group-hover/btn:block"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </button>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
