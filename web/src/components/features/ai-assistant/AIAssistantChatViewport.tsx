"use client";

import * as React from "react";
import { ChatMessage } from "@/hooks/useAIAssistant";

interface ViewportProps {
  messages: ChatMessage[];
  isHistoryLoading: boolean;
  isSending: boolean;
  onSuggestionClick: (promptText: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export function AIAssistantChatViewport({
  messages,
  isHistoryLoading,
  isSending,
  onSuggestionClick,
  messagesEndRef,
}: ViewportProps) {
  const lastUserIndex = [...messages].reverse().findIndex((m) => m.role === "user");
  const currentTurnMessages = lastUserIndex !== -1 ? messages.slice(messages.length - 1 - lastUserIndex) : messages;
  const isCreatingTasks = currentTurnMessages.some((m) => m.tool_calls && m.tool_calls.length > 0);

  if (isHistoryLoading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <svg className="animate-spin h-6 w-6 text-[#1868db]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col justify-center max-w-xl mx-auto text-center space-y-6 select-none custom-chat-scrollbar">
        <div className="p-3 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center w-16 mx-auto">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1868db" strokeWidth="1.5">
            <path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2z" />
            <path d="M12 8v4" />
            <path d="M12 16h.01" />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-800">Bắt đầu hội thoại với AI Trợ lý</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
            Tôi có thể giúp bạn lên kế hoạch dự án bằng cách phân rã yêu cầu của bạn thành các Task chính và Subtask con tự động.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full pt-4">
          <button
            onClick={() => onSuggestionClick("Hãy phân tích dự án và đề xuất 3 công việc chính để triển khai")}
            className="p-3 rounded-lg border border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/20 text-left text-xs font-semibold text-slate-700 transition-all cursor-pointer shadow-3xs"
          >
            💡 Phân tích dự án & đề xuất công việc chính
          </button>
          <button
            onClick={() =>
              onSuggestionClick("Tạo công việc chính 'Họp kick-off dự án' có độ ưu tiên Cao bắt đầu từ ngày mai")
            }
            className="p-3 rounded-lg border border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/20 text-left text-xs font-semibold text-slate-700 transition-all cursor-pointer shadow-3xs"
          >
            ➕ Tạo công việc 'Họp kick-off dự án'
          </button>
        </div>
        <div ref={messagesEndRef} />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 custom-chat-scrollbar">
      {messages.map((msg) => {
        const isUser = msg.role === "user";
        if (msg.role === "tool") return null;

        let displayText = msg.content;
        let attachment: { fileName: string; fileSize: string } | null = null;

        if (msg.content && msg.content.startsWith("{") && msg.content.endsWith("}")) {
          try {
            const parsed = JSON.parse(msg.content);
            if (parsed.attachment) {
              attachment = parsed.attachment;
              displayText = parsed.text;
            }
          } catch (e) {
            // Non-JSON or parsing failed, fallback
          }
        }

        return (
          <div key={msg.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[70%] rounded-xl px-4 py-2.5 text-xs leading-relaxed shadow-3xs ${
                isUser
                  ? "bg-[#1868db] text-white rounded-br-none"
                  : "bg-white border border-slate-200/80 text-slate-800 rounded-bl-none"
              }`}
            >
              {attachment && (
                <div
                  className={`mb-2 p-2 rounded flex items-center gap-2 border text-[11px] ${
                    isUser
                      ? "bg-blue-600/30 border-blue-500/30 text-white"
                      : "bg-slate-50 border-slate-200 text-slate-800"
                  }`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold truncate text-[11px]">{attachment.fileName}</div>
                    <div className="text-[9px] opacity-80">{attachment.fileSize}</div>
                  </div>
                </div>
              )}
              {displayText && <p className="whitespace-pre-wrap font-medium">{displayText}</p>}



              <div className={`text-[9px] mt-1.5 text-right font-semibold ${isUser ? "text-blue-200" : "text-slate-400"}`}>
                {new Date(msg.created_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </div>
        );
      })}

      {isSending && (
        <div className="flex justify-start">
          <div className="bg-white border border-slate-200/80 rounded-xl px-4 py-3 shadow-3xs rounded-bl-none flex items-center gap-3">
            <div className="flex gap-1">
              <div className="h-1.5 w-1.5 bg-[#1868db] rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
              <div className="h-1.5 w-1.5 bg-[#1868db] rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
              <div className="h-1.5 w-1.5 bg-[#1868db] rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
            </div>
            <span className="text-[10px] text-slate-500 font-bold">
              {isCreatingTasks ? "Đang tạo công việc..." : "Trợ lý AI đang suy nghĩ..."}
            </span>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
