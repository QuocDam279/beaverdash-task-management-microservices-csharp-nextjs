"use client";

import * as React from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { HubConnectionBuilder, HubConnection, LogLevel } from "@microsoft/signalr";
import { EmojiPicker } from "./EmojiPicker";

interface ChatMessage {
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

interface ChatContainerProps {
  roomId: string;
  roomType: "project" | "team";
  roomName: string;
}

// Helper to calculate avatar color based on user name
const getAvatarColor = (name: string) => {
  const colors = [
    "bg-gradient-to-br from-red-400 to-rose-600 text-white",
    "bg-gradient-to-br from-blue-400 to-indigo-600 text-white",
    "bg-gradient-to-br from-emerald-400 to-teal-600 text-white",
    "bg-gradient-to-br from-amber-400 to-orange-500 text-white",
    "bg-gradient-to-br from-purple-400 to-fuchsia-600 text-white",
    "bg-gradient-to-br from-pink-400 to-rose-500 text-white",
    "bg-gradient-to-br from-cyan-400 to-blue-500 text-white",
  ];
  let sum = 0;
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i);
  }
  return colors[sum % colors.length];
};

const getInitials = (name: string) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

const getAttachmentUrl = (url: string | null) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  return `${apiBaseUrl}${url}`;
};

const isOnlyEmojis = (str: string) => {
  if (!str) return false;
  const trimmed = str.trim();
  if (!trimmed) return false;
  try {
    const emojiRegex = /^(?:\p{Extended_Pictographic}|\p{Emoji_Presentation}|\u200D|\uFE0F|[\u2700-\u27BF]|[\u2600-\u26FF]|\s)+$/u;
    return emojiRegex.test(trimmed);
  } catch (e) {
    return false;
  }
};

const getEmojiSizeClass = (str: string) => {
  const trimmed = str.trim();
  let count = 1;
  if (typeof Intl !== "undefined" && Intl.Segmenter) {
    try {
      const segmenter = new Intl.Segmenter();
      count = Array.from(segmenter.segment(trimmed)).length;
    } catch (e) {
      count = Array.from(trimmed).length;
    }
  } else {
    count = Array.from(trimmed).length;
  }
  
  if (count === 1) return "text-5xl py-2 select-text";
  if (count === 2) return "text-4xl py-1 select-text";
  if (count === 3) return "text-3xl py-1 select-text";
  return "text-2xl py-0.5 select-text";
};

export function ChatContainer({ roomId, roomType, roomName }: ChatContainerProps) {
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

  const dragCounter = React.useRef(0);
  const signalrConnectionRef = React.useRef<HubConnection | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = React.useRef<HTMLDivElement | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, isSendingFile]);

  // Load chat history
  const fetchHistory = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.get(`/${roomType}s/${roomId}/chat`);
      setMessages(data || []);
    } catch (err: any) {
      console.error("Failed to load chat history:", err);
      setError(err.message || "Không thể tải lịch sử trò chuyện.");
    } finally {
      setIsLoading(false);
    }
  }, [roomId, roomType]);

  React.useEffect(() => {
    if (token) {
      fetchHistory();
    }
  }, [token, fetchHistory]);

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
      } catch (err: any) {
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

  const showFeatureToast = (featureName: string) => {
    setToastMessage(`Tính năng "${featureName}" đang được phát triển.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

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
    } catch (err: any) {
      console.error("[Chat] Failed to send message:", err);
      setInputText(textToSend); // Restore input on error
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!signalrConnectionRef.current || !isConnected) return;
    try {
      await signalrConnectionRef.current.invoke("DeleteMessage", roomType, roomId, messageId);
    } catch (err: any) {
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
      
      // If filename is "blob", give it a nicer name with appropriate extension based on mime type
      let fileToUpload = file;
      if (file.name === "blob") {
        const ext = file.type.split("/")[1] || "png";
        fileToUpload = new File([file], `dan-anh-${new Date().toISOString().slice(0, 10)}.${ext}`, {
          type: file.type
        });
      }
      
      formData.append("file", fileToUpload);

      // Call Controller endpoint
      const response = await api.post(`/${roomType}s/${roomId}/chat/upload`, formData);

      if (response && response.fileUrl) {
        // Send message with file attributes via SignalR
        await signalrConnectionRef.current.invoke(
          "SendMessage",
          roomType,
          roomId,
          "", // No text content initially
          response.fileUrl,
          response.fileName,
          response.fileType,
          response.fileSize
        );
      }
    } catch (err: any) {
      console.error("[Chat] Upload file failed:", err);
      setToastMessage(err.message || "Tải tệp lên thất bại.");
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

  // Paste handler to capture clipboard screenshot or files
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
          e.preventDefault(); // Stop pasting image as text characters
          await uploadAndSendFile(file);
        }
      }
    }
  };

  // Drag and Drop Handlers
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

  // Helper to render attachments (images or files) inside bubbles
  const renderAttachment = (msg: ChatMessage) => {
    const isImage = msg.fileType?.startsWith("image/");
    const resolvedUrl = getAttachmentUrl(msg.fileUrl);
    
    if (isImage) {
      return (
        <div className="max-w-xs overflow-hidden rounded-xl border border-slate-200/60 dark:border-slate-800 shadow-xs my-1 bg-slate-100 dark:bg-slate-900 select-none">
          <a href={resolvedUrl} target="_blank" rel="noopener noreferrer">
            <img
              src={resolvedUrl}
              alt={msg.fileName || "Hình ảnh"}
              className="max-h-60 object-contain hover:opacity-95 transition-opacity duration-150 cursor-pointer"
            />
          </a>
        </div>
      );
    } else {
      const isMe = msg.senderId === currentUser?.id;
      return (
        <a
          href={resolvedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-[11px] font-bold no-underline mt-1 mb-1 transition-all ${
            isMe
              ? "bg-blue-600/80 border-blue-400/20 text-white hover:bg-blue-600"
              : "bg-slate-50 dark:bg-[#22272b] border-slate-200 dark:border-[#353e47] text-slate-800 dark:text-[#deebff] hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <div className="min-w-0 flex-1 text-left">
            <div className="truncate text-[11px]">{msg.fileName}</div>
            <div className="text-[9px] opacity-80 mt-0.5 font-semibold">
              {msg.fileSize ? formatBytes(msg.fileSize) : "N/A"}
            </div>
          </div>
        </a>
      );
    }
  };

  const renderMessageList = () => {
    if (messages.length === 0) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 py-16 select-none">
          <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-slate-800/50 flex items-center justify-center mb-3">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-500">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <p className="text-xs font-bold text-slate-700 dark:text-slate-350">Không có tin nhắn</p>
          <p className="text-[10px] opacity-70 mt-1 max-w-[200px] text-center leading-relaxed">
            Hãy bắt đầu cuộc hội thoại bằng cách gửi tin nhắn hoặc hình ảnh đầu tiên.
          </p>
        </div>
      );
    }

    const rendered: React.ReactNode[] = [];
    let prevMsg: ChatMessage | null = null;

    messages.forEach((msg, idx) => {
      const isMe = msg.senderId === currentUser?.id;
      
      const isConsecutive =
        prevMsg &&
        prevMsg.senderId === msg.senderId &&
        new Date(msg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime() < 120000; // 2 minutes

      const msgTime = new Date(msg.createdAt).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const msgDate = new Date(msg.createdAt).toLocaleDateString("vi-VN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      // Insert date separator if first message of a new day
      const prevMsgDate = prevMsg ? new Date(prevMsg.createdAt).toLocaleDateString("vi-VN") : null;
      const currentMsgDate = new Date(msg.createdAt).toLocaleDateString("vi-VN");
      if (prevMsgDate !== currentMsgDate) {
        rendered.push(
          <div key={`date-${msg.id}`} className="flex items-center my-6 select-none">
            <div className="flex-1 border-t border-slate-100 dark:border-slate-800" />
            <span className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {msgDate}
            </span>
            <div className="flex-1 border-t border-slate-100 dark:border-slate-800" />
          </div>
        );
      }

      if (isMe) {
        // Render current user's message (Right-aligned, Blue Bubble, No Avatar)
        rendered.push(
          <div key={msg.id} className={`flex justify-end w-full px-4 ${isConsecutive ? "mt-1" : "mt-3"}`}>
            <div className="max-w-[70%] flex flex-col items-end group">
              <div className="flex items-center gap-2 max-w-full">
                {/* Delete Button (visible on hover) */}
                <button
                  onClick={() => handleDeleteMessage(msg.id)}
                  title="Thu hồi tin nhắn"
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-rose-500 transition-opacity duration-150 cursor-pointer order-first shrink-0"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>

                {/* Message elements container */}
                <div className="flex flex-col items-end max-w-full">
                  {/* File / Image Attachment */}
                  {msg.fileUrl && renderAttachment(msg)}
                  {/* Text bubble */}
                  {msg.content && (() => {
                    const onlyEmojis = isOnlyEmojis(msg.content);
                    if (onlyEmojis) {
                      return (
                        <div
                          title={msgTime}
                          className={`${getEmojiSizeClass(msg.content)} leading-none select-text mt-1 mb-1 filter drop-shadow-sm`}
                        >
                          {msg.content}
                        </div>
                      );
                    }
                    return (
                      <div
                        title={msgTime}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-2 text-xs font-semibold shadow-xs break-words whitespace-pre-wrap leading-relaxed max-w-full select-text mt-0.5"
                      >
                        {msg.content}
                      </div>
                    );
                  })()}
                </div>
              </div>
              {!isConsecutive && (
                <span className="text-[8px] text-slate-400 dark:text-slate-500 mt-0.5 mr-1 font-semibold select-none opacity-0 group-hover:opacity-100 transition-opacity">
                  {msgTime}
                </span>
              )}
            </div>
          </div>
        );
      } else {
        // Render other user's message (Left-aligned, Gray Bubble, With Avatar/Initials)
        rendered.push(
          <div key={msg.id} className={`flex gap-2.5 w-full px-4 items-start ${isConsecutive ? "mt-1" : "mt-3"}`}>
            {/* Avatar or Empty Space placeholder for alignment */}
            <div className="w-8 shrink-0 select-none">
              {!isConsecutive ? (
                msg.senderAvatar ? (
                  <img
                    src={msg.senderAvatar}
                    alt={msg.senderDisplayName}
                    className="w-8 h-8 rounded-full object-cover border border-slate-100 dark:border-[#353e47] shadow-xs"
                  />
                ) : (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] ${getAvatarColor(msg.senderDisplayName)} shadow-xs`}>
                    {getInitials(msg.senderDisplayName)}
                  </div>
                )
              ) : (
                <div className="w-8 h-8" /> // Indent spaces for consecutive messages
              )}
            </div>

            {/* Bubble & Name block */}
            <div className="max-w-[70%] flex flex-col items-start group">
              {/* Show display name only if not consecutive */}
              {!isConsecutive && (
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 ml-1.5 mb-0.5 select-none">
                  {msg.senderDisplayName}
                </span>
              )}
              
              <div className="flex flex-col items-start max-w-full">
                {/* File / Image Attachment */}
                {msg.fileUrl && renderAttachment(msg)}
                {/* Text bubble */}
                {msg.content && (() => {
                  const onlyEmojis = isOnlyEmojis(msg.content);
                  if (onlyEmojis) {
                    return (
                      <div
                        title={msgTime}
                        className={`${getEmojiSizeClass(msg.content)} leading-none select-text mt-1 mb-1 filter drop-shadow-sm`}
                      >
                        {msg.content}
                      </div>
                    );
                  }
                  return (
                    <div
                      title={msgTime}
                      className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-[#deebff] rounded-2xl rounded-tl-sm px-4 py-2 text-xs font-semibold shadow-2xs break-words whitespace-pre-wrap leading-relaxed max-w-full select-text mt-0.5"
                    >
                      {msg.content}
                    </div>
                  );
                })()}
              </div>

              {!isConsecutive && (
                <span className="text-[8px] text-slate-400 dark:text-slate-500 mt-0.5 ml-1 font-semibold select-none opacity-0 group-hover:opacity-100 transition-opacity">
                  {msgTime}
                </span>
              )}
            </div>
          </div>
        );
      }

      prevMsg = msg;
    });

    return <div className="pb-6">{rendered}</div>;
  };

  return (
    <div 
      className="flex flex-col h-full w-full bg-white dark:bg-[#1d2125] select-none relative overflow-hidden"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag and Drop Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-blue-500/10 dark:bg-blue-500/5 backdrop-blur-xs flex items-center justify-center p-6 transition-all duration-200 pointer-events-none">
          <div className="w-full h-full border-2 border-dashed border-blue-500 rounded-2xl flex flex-col items-center justify-center bg-white/95 dark:bg-[#1d2125]/95 shadow-xl animate-in zoom-in-95 duration-150">
            <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-500 flex items-center justify-center mb-4 shadow-sm animate-bounce">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <p className="text-sm font-bold text-slate-800 dark:text-[#deebff]">
              Thả tệp vào đây để gửi
            </p>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-1">
              Hỗ trợ hình ảnh, tài liệu (tối đa 10MB)
            </p>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="*/*"
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 dark:bg-white/95 text-white dark:text-slate-900 text-xs font-bold px-4 py-2 rounded-full shadow-lg transition-all duration-300">
          {toastMessage}
        </div>
      )}

      {/* Header Info */}
      <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-[#1d2125] z-10 shadow-3xs">
        <div className="flex items-center gap-3 min-w-0">
          {/* Group Chat Icon */}
          <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-slate-800 dark:text-[#deebff] truncate">
              {roomName}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`h-1.5 w-1.5 rounded-full ${isConnected ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                {isConnected ? "Kênh trực tuyến" : "Mất kết nối"}
              </span>
            </div>
          </div>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => showFeatureToast("Gọi thoại")}
            title="Bắt đầu gọi thoại"
            className="p-2 rounded-full text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </button>
          <button
            onClick={() => showFeatureToast("Gọi video")}
            title="Bắt đầu gọi video"
            className="p-2 rounded-full text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M23 7l-7 5 7 5V7z" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          </button>
          <button
            onClick={() => showFeatureToast("Thông tin hội thoại")}
            title="Thông tin nhóm"
            className="p-2 rounded-full text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Chat Viewport */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto py-4 custom-chat-scrollbar bg-slate-50/30 dark:bg-[#1e2227]/20"
      >
        {isLoading ? (
          <div className="h-full flex items-center justify-center select-none">
            <div className="flex flex-col items-center gap-2">
              <svg className="animate-spin h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span className="text-[10px] text-slate-400 font-bold">Đang tải lịch sử...</span>
            </div>
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center p-6 text-center select-none">
            <div className="text-slate-500 text-xs space-y-2">
              <span>⚠️</span>
              <p className="font-semibold text-slate-700 dark:text-slate-350">{error}</p>
              <button
                onClick={fetchHistory}
                className="text-xs text-blue-500 hover:underline font-bold"
              >
                Thử lại
              </button>
            </div>
          </div>
        ) : (
          renderMessageList()
        )}

        {/* Loading Indicator for File Uploading */}
        {isSendingFile && (
          <div className="flex justify-end w-full px-4 mt-2 select-none animate-pulse">
            <div className="max-w-[70%] bg-blue-50/50 dark:bg-blue-950/25 border border-blue-100 dark:border-blue-950/40 rounded-2xl px-4 py-2 flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400">
              <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Đang tải tệp lên...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing Footer */}
      <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-[#1d2125]">
        <div className="flex items-center gap-2.5">
          {/* Actions panel */}
          <div className="flex items-center shrink-0">
            <button
              onClick={handleAttachmentClick}
              title="Đính kèm ảnh/tệp"
              className="p-1.5 rounded-full text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
              </svg>
            </button>
          </div>

          {/* Text Input area - Pill design */}
          <form onSubmit={handleSend} className="flex-1 flex items-center gap-2.5 bg-slate-100 dark:bg-slate-800/80 rounded-full pl-4 pr-2 py-1.5 transition-all focus-within:ring-2 focus-within:ring-blue-500/10 focus-within:bg-slate-100/70 dark:focus-within:bg-slate-800">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder={`Nhập tin nhắn (hỗ trợ dán ảnh)...`}
              rows={1}
              maxLength={1000}
              className="flex-1 resize-none border-0 bg-transparent p-0 text-xs font-semibold text-slate-800 dark:text-[#deebff] placeholder-slate-400 focus:ring-0 focus:outline-none min-h-[18px] max-h-[100px] scrollbar-none custom-chat-scrollbar py-0.5"
            />
            
            {/* Emoji Button */}
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={`p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer shrink-0 ${
                showEmojiPicker ? "bg-slate-200 dark:bg-slate-700 text-blue-600" : "text-blue-500"
              }`}
              title="Chọn emoji"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                <line x1="9" y1="9" x2="9.01" y2="9" />
                <line x1="15" y1="9" x2="15.01" y2="9" />
              </svg>
            </button>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputText.trim() || !isConnected}
              className={`p-1.5 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                inputText.trim() && isConnected
                  ? "bg-blue-500 text-white hover:bg-blue-600 shadow-md scale-105 active:scale-95"
                  : "bg-slate-200 dark:bg-slate-700/50 text-slate-400 dark:text-slate-600 cursor-not-allowed"
              }`}
              title="Gửi tin nhắn"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={inputText.trim() && isConnected ? "translate-x-[0.5px]" : ""}>
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>
        </div>
      </div>
      {showEmojiPicker && (
        <EmojiPicker
          onSelect={handleEmojiSelect}
          onClose={() => setShowEmojiPicker(false)}
        />
      )}
    </div>
  );
}
