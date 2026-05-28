"use client";

/**
 * @hook useNotifications
 * @description Quản lý tìm nạp, kết nối SignalR thời gian thực và các tương tác (đọc, xóa) của hệ thống thông báo.
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import { Notification } from "@/types/task";
import { api } from "@/lib/api";
import { HubConnectionBuilder, HubConnection, LogLevel } from "@microsoft/signalr";
import { useToast } from "@/components/providers/ToastProvider";
import { useAuth } from "@/components/providers/AuthProvider";

export function useNotifications(isOpen: boolean, setIsOpen: (open: boolean) => void) {
  const router = useRouter();
  const { toast } = useToast();
  const { token } = useAuth();
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [filterTab, setFilterTab] = React.useState<"all" | "unread">("all");

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

  React.useEffect(() => {
    if (token) {
      fetchNotifications();
    } else {
      setNotifications([]);
    }
  }, [token, fetchNotifications]);

  React.useEffect(() => {
    if (!token) return;

    let connection: HubConnection | null = null;

    const startConnection = async () => {
      try {
        connection = new HubConnectionBuilder()
          .withUrl("http://localhost:5000/hubs/notifications", {
            accessTokenFactory: () => token,
          })
          .configureLogging(LogLevel.Warning)
          .withAutomaticReconnect()
          .build();

        connection.on("ReceiveNotification", (notificationData: any) => {
          toast(notificationData.content, "Thông báo mới", "info");

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
        const errMsg = err instanceof Error ? err.message : String(err);
        if (errMsg.includes("stopped during negotiation")) {
          console.warn("SignalR connection stopped during negotiation (unmount).");
        } else {
          console.error("Failed to start SignalR connection:", err);
        }
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
  }, [token, toast]);

  React.useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = React.useMemo(() => {
    if (filterTab === "unread") {
      return notifications.filter((n) => !n.isRead);
    }
    return notifications;
  }, [notifications, filterTab]);

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

  const handleMarkAllAsRead = async () => {
    const unreadNotifications = notifications.filter((n) => !n.isRead);
    if (unreadNotifications.length === 0) return;

    try {
      await Promise.all(
        unreadNotifications.map((n) => api.patch(`/notifications/${n.id}/read`, {}))
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const handleClearAllNotifications = async () => {
    try {
      await api.delete("/notifications/clear");
      setNotifications([]);
    } catch (err) {
      console.error("Failed to clear all notifications:", err);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    handleMarkAsRead(notification.id);
    setIsOpen(false);
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  return {
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
  };
}
