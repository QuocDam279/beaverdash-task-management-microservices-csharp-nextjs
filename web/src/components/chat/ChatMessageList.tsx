"use client";

import * as React from "react";
import type { ChatMessage } from "@/hooks/useChat";
import {
  getAvatarColor,
  getInitials,
  formatBytes,
  getAttachmentUrl,
  isOnlyEmojis,
  getEmojiSizeClass,
} from "./chatUtils";

interface ChatMessageListProps {
  messages: ChatMessage[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentUser: any;
  onDeleteMessage: (id: string) => void;
}

export function ChatMessageList({
  messages,
  currentUser,
  onDeleteMessage,
}: ChatMessageListProps) {
  
  const renderAttachment = (msg: ChatMessage) => {
    const isImage = msg.fileType?.startsWith("image/");
    const resolvedUrl = getAttachmentUrl(msg.fileUrl);
    
    if (isImage) {
      return (
        <div className="max-w-xs overflow-hidden rounded-xl border border-slate-200/60 dark:border-slate-800 shadow-xs my-1 bg-slate-100 dark:bg-slate-900 select-none animate-in fade-in zoom-in-95 duration-150">
          <a href={resolvedUrl} target="_blank" rel="noopener noreferrer">
            <img
              src={resolvedUrl}
              alt={msg.fileName || "Hình ảnh"}
              className="max-h-60 object-contain hover:opacity-95 transition-opacity duration-150 cursor-pointer"
            />
          </a>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/40 dark:border-[#353e47]/30 rounded-xl my-1 max-w-xs text-slate-800 dark:text-[#deebff] shadow-3xs hover:bg-slate-100/60 dark:hover:bg-slate-900/80 transition-all select-none">
        <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-950/45 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 text-base shadow-3xs font-extrabold select-none">
          📄
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold truncate" title={msg.fileName || ""}>
            {msg.fileName}
          </p>
          <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-0.5 uppercase tracking-wider">
            {msg.fileSize ? formatBytes(msg.fileSize) : "Tệp tin"}
          </p>
        </div>
        <a
          href={resolvedUrl}
          download={msg.fileName || ""}
          className="p-1.5 rounded-full hover:bg-white dark:hover:bg-slate-800 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors shadow-4xs shrink-0 cursor-pointer"
          title="Tải xuống"
          target="_blank"
          rel="noopener noreferrer"
        >
          ⬇️
        </a>
      </div>
    );
  };

  const renderMessages = () => {
    const rendered: React.ReactNode[] = [];
    let prevMsg: ChatMessage | null = null;

    messages.forEach((msg) => {
      const isMe = msg.senderId === currentUser?.id;
      const isConsecutive =
        prevMsg &&
        prevMsg.senderId === msg.senderId &&
        new Date(msg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime() < 3 * 60 * 1000;

      const msgTime = new Date(msg.createdAt).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });

      if (isMe) {
        rendered.push(
          <div key={msg.id} className="flex justify-end px-4 group select-none mt-0.5">
            <div className="flex items-end gap-1.5 max-w-[70%]">
              
              {/* Delete Button (visible on hover) */}
              <button
                onClick={() => onDeleteMessage(msg.id)}
                title="Thu hồi tin nhắn"
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-rose-500 transition-opacity duration-150 cursor-pointer order-first shrink-0"
              >
                🗑️
              </button>

              <div className="flex flex-col items-end">
                {msg.fileUrl && renderAttachment(msg)}
                {msg.content && (
                  (() => {
                    const isEmoji = isOnlyEmojis(msg.content);
                    if (isEmoji) {
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
                        className="bg-blue-500 text-white rounded-2xl rounded-tr-sm px-4 py-2 text-xs font-semibold shadow-2xs break-words whitespace-pre-wrap leading-relaxed max-w-full select-text mt-0.5"
                      >
                        {msg.content}
                      </div>
                    );
                  })()
                )}
              </div>
            </div>
          </div>
        );
      } else {
        rendered.push(
          <div key={msg.id} className={`flex justify-start px-4 group select-none ${isConsecutive ? "mt-0.5" : "mt-3.5"}`}>
            <div className="flex items-start gap-2 max-w-[70%]">
              {!isConsecutive ? (
                <div
                  className={`w-7.5 h-7.5 rounded-full ${getAvatarColor(msg.senderDisplayName)} flex items-center justify-center text-[10.5px] font-extrabold select-none shadow-3xs shrink-0 mt-0.5`}
                  title={msg.senderDisplayName}
                >
                  {msg.senderAvatar ? (
                    <img
                      src={msg.senderAvatar}
                      alt={msg.senderDisplayName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    getInitials(msg.senderDisplayName)
                  )}
                </div>
              ) : (
                <div className="w-7.5 shrink-0 select-none pointer-events-none" />
              )}

              <div className="flex flex-col items-start min-w-0">
                {!isConsecutive && (
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 ml-1.5 select-none truncate max-w-full">
                    {msg.senderDisplayName}
                  </span>
                )}
                {msg.fileUrl && renderAttachment(msg)}
                {msg.content && (() => {
                  const isEmoji = isOnlyEmojis(msg.content);
                  if (isEmoji) {
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

  return renderMessages();
}
