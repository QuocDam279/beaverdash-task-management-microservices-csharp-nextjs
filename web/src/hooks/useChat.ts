"use client";

import * as React from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { HubConnectionBuilder, HubConnection, LogLevel } from "@microsoft/signalr";
import { api } from "@/lib/api";

export interface ChatMessage {
  id: string;
  senderId: string;
  senderDisplayName: string;
  senderAvatar: string | null;
  senderEmail: string;
  content: string;
  fileUrl: string | null;
  fileName: string | null;
  fileType: string | null;
  fileSize: number | null;
  createdAt: string;
  projectId: string | null;
  teamId: string | null;
}

export function useChat(roomId: string, roomType: "project" | "team") {
  const { token, user: currentUser } = useAuth();
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [inputText, setInputText] = React.useState("");
  const [isConnected, setIsConnected] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false);
  const [isSendingFile, setIsSendingFile] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const [members, setMembers] = React.useState<any[]>([]);

  // Load room members (for mentions)
  React.useEffect(() => {
    const fetchMembers = async () => {
      try {
        if (roomType === "project") {
          const data = await api.get(`/projects/${roomId}/overview`);
          setMembers(data?.memberWorkloads || []);
        } else {
          const data = await api.get(`/teams/${roomId}`);
          setMembers(data?.members || []);
        }
      } catch (err) {
        console.error("Failed to load room members for mentions:", err);
      }
    };
    if (token) {
      fetchMembers();
    }
  }, [roomId, roomType, token]);

  // Scroll and Pagination States
  const [chatLimit, setChatLimit] = React.useState(30);
  const [hasMoreOlder, setHasMoreOlder] = React.useState(true);
  const [isLoadingOlder, setIsLoadingOlder] = React.useState(false);
  const isInitialLoadRef = React.useRef(true);
  const prevMessagesLengthRef = React.useRef(0);

  // Sidebar States
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [sidebarTab, setSidebarTab] = React.useState<"media" | "files" | "links">("media");

  const dragCounter = React.useRef(0);
  const signalrConnectionRef = React.useRef<HubConnection | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = React.useRef<HTMLDivElement | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Auto scroll to bottom under specific conditions
  React.useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    if (isInitialLoadRef.current && messages.length > 0 && !isLoading) {
      container.scrollTop = container.scrollHeight;
      isInitialLoadRef.current = false;
      prevMessagesLengthRef.current = messages.length;
      return;
    }

    if (messages.length > prevMessagesLengthRef.current) {
      const isUserAtBottom = container.scrollHeight - container.clientHeight - container.scrollTop < 150;
      if (isUserAtBottom || isSendingFile) {
        container.scrollTop = container.scrollHeight;
      }
    }

    prevMessagesLengthRef.current = messages.length;
  }, [messages, isLoading, isSendingFile]);

  // Load chat history
  const fetchHistory = React.useCallback(async (limitVal: number, isLoadMore = false) => {
    try {
      if (!isLoadMore) {
        setIsLoading(true);
      } else {
        setIsLoadingOlder(true);
      }
      setError(null);
      const data = await api.get(`/${roomType}s/${roomId}/chat?limit=${limitVal}`);
      
      const newMessages = data || [];
      setMessages(newMessages);
      
      if (newMessages.length < limitVal) {
        setHasMoreOlder(false);
      } else {
        setHasMoreOlder(true);
      }
    } catch (err) {
      console.error("Failed to load chat history:", err);
      setError(err instanceof Error ? err.message : "Không thể tải lịch sử trò chuyện.");
    } finally {
      setIsLoading(false);
      setIsLoadingOlder(false);
    }
  }, [roomId, roomType]);

  React.useEffect(() => {
    if (token) {
      isInitialLoadRef.current = true;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setChatLimit(30);
      setHasMoreOlder(true);
      fetchHistory(30, false);
    }
  }, [token, roomId, roomType, fetchHistory]);

  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    if (container.scrollTop === 0 && hasMoreOlder && !isLoading && !isLoadingOlder) {
      const oldScrollHeight = container.scrollHeight;
      const nextLimit = chatLimit + 30;

      setIsLoadingOlder(true);
      fetchHistory(nextLimit, true).then(() => {
        setChatLimit(nextLimit);
        // Anchor the scroll position
        setTimeout(() => {
          if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight - oldScrollHeight;
          }
        }, 50);
      });
    }
  };

  // Initialize SignalR
  React.useEffect(() => {
    if (!token) return;

    let isStopped = false;
    let connection: HubConnection | null = null;

    const startSignalR = async () => {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        connection = new HubConnectionBuilder()
          .withUrl(`${apiBaseUrl}/hubs/chat`, {
            accessTokenFactory: () => token,
          })
          .configureLogging(LogLevel.Warning)
          .withAutomaticReconnect()
          .build();

        signalrConnectionRef.current = connection;

        connection.on("ReceiveMessage", (message: ChatMessage) => {
          setMessages((prev) => {
            if (prev.some((m) => m.id === message.id)) {
              return prev;
            }
            return [...prev, message];
          });
        });

        connection.on("MessageDeleted", (messageId: string) => {
          setMessages((prev) => prev.filter((m) => m.id !== messageId));
        });

        await connection.start();
        setIsConnected(true);

        await connection.invoke("JoinRoom", roomType, roomId);
        console.log(`[Chat] Connected and joined room ${roomType}_${roomId}`);
      } catch (err) {
        console.error("[Chat] SignalR connection failed:", err);
        if (!isStopped) {
          setIsConnected(false);
        }
      }
    };

    startSignalR();

    return () => {
      isStopped = true;
      if (connection) {
        if (connection.state === "Connected") {
          connection.stop()
            .then(() => console.log("[Chat] SignalR disconnected cleanly."))
            .catch((err) => console.error("[Chat] Disconnect error:", err));
        }
      }
    };
  }, [token, roomId, roomType]);

  const handleEmojiSelect = (emoji: string) => {
    setInputText((prev) => prev + emoji);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !signalrConnectionRef.current || !isConnected) return;

    const textToSend = inputText;
    setInputText(""); // Clear input immediately

    try {
      await signalrConnectionRef.current.invoke("SendMessage", roomType, roomId, textToSend, null, null, null, null);
    } catch (err) {
      console.error("[Chat] Failed to send message:", err);
      setInputText(textToSend); // Restore input on error
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!signalrConnectionRef.current || !isConnected) return;
    try {
      await signalrConnectionRef.current.invoke("DeleteMessage", roomType, roomId, messageId);
    } catch (err) {
      console.error("[Chat] Failed to delete message:", err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  // Upload and Send File/Image Action
  const uploadAndSendFile = async (file: File) => {
    if (!signalrConnectionRef.current || !isConnected) return;
    
    try {
      setIsSendingFile(true);
      const formData = new FormData();
      
      let fileToUpload = file;
      if (file.name === "blob") {
        const ext = file.type.split("/")[1] || "png";
        fileToUpload = new File([file], `dan-anh-${new Date().toISOString().slice(0, 10)}.${ext}`, {
          type: file.type
        });
      }
      
      formData.append("file", fileToUpload);

      const response = await api.post(`/${roomType}s/${roomId}/chat/upload`, formData);

      if (response && response.fileUrl) {
        await signalrConnectionRef.current.invoke(
          "SendMessage",
          roomType,
          roomId,
          "",
          response.fileUrl,
          response.fileName,
          response.fileType,
          response.fileSize
        );
      }
    } catch (err) {
      console.error("[Chat] Upload file failed:", err);
      setToastMessage(err instanceof Error ? err.message : "Tải tệp lên thất bại.");
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setIsSendingFile(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadAndSendFile(file);
      e.target.value = ""; // Reset
    }
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const files = e.clipboardData?.files;
    if (files && files.length > 0) {
      e.preventDefault();
      for (let i = 0; i < files.length; i++) {
        await uploadAndSendFile(files[i]);
      }
      return;
    }

    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          await uploadAndSendFile(file);
        }
      }
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        await uploadAndSendFile(files[i]);
      }
    }
  };

  // Memoized lists of shared media, files, and links
  const sharedMedia = React.useMemo(() => {
    return messages.filter(m => m.fileUrl && (m.fileType?.startsWith("image/") || m.fileType?.startsWith("video/")));
  }, [messages]);

  const sharedFiles = React.useMemo(() => {
    return messages.filter(m => m.fileUrl && !(m.fileType?.startsWith("image/") || m.fileType?.startsWith("video/")));
  }, [messages]);

  const sharedLinks = React.useMemo(() => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const linksList: { id: string; url: string; title: string; sender: string; date: string }[] = [];
    messages.forEach(m => {
      if (!m.fileUrl && m.content) {
        const found = m.content.match(urlRegex);
        if (found) {
          found.forEach(url => {
            linksList.push({
              id: `${m.id}-${url}`,
              url,
              title: url.replace(/https?:\/\/(www\.)?/, "").substring(0, 40) + (url.length > 40 ? "..." : ""),
              sender: m.senderDisplayName,
              date: new Date(m.createdAt).toLocaleDateString("vi-VN", { month: "short", day: "numeric" })
            });
          });
        }
      }
    });
    return linksList;
  }, [messages]);

  return {
    messages,
    inputText,
    setInputText,
    isConnected,
    isLoading,
    error,
    toastMessage,
    showEmojiPicker,
    setShowEmojiPicker,
    isSendingFile,
    isDragging,
    chatLimit,
    hasMoreOlder,
    isLoadingOlder,
    isSidebarOpen,
    setIsSidebarOpen,
    sidebarTab,
    setSidebarTab,
    messagesContainerRef,
    messagesEndRef,
    fileInputRef,
    handleScroll,
    handleSend,
    handleDeleteMessage,
    handleKeyDown,
    handlePaste,
    handleFileChange,
    handleAttachmentClick,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleEmojiSelect,
    fetchHistory,
    currentUser,
    sharedMedia,
    sharedFiles,
    sharedLinks,
    members,
  };
}
