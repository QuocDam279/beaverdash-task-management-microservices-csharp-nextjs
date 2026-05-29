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

function parseInlineMarkdown(text: string): React.ReactNode[] {
  const tokenRegex = /(\*\*.*?\*\*|`.*?`)/g;
  const splitParts = text.split(tokenRegex);
  
  return splitParts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index} className="font-bold text-slate-800">{part.slice(2, -2)}</strong>;
    } else if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={index} className="px-1.5 py-0.5 bg-slate-100 border border-slate-200/65 rounded text-[10px] font-mono text-pink-600 select-all font-semibold">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

interface MarkdownRendererProps {
  content: string;
}

function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return null;

  const lines = content.split("\n");
  const renderedLines: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 1. Horizontal Rule
    if (line.trim() === "---") {
      renderedLines.push(<hr key={i} className="my-3 border-slate-200/50" />);
      continue;
    }

    // 2. Heading 3
    const h3Match = line.match(/^###\s+(.+)$/);
    if (h3Match) {
      renderedLines.push(
        <h3 key={i} className="text-xs font-bold text-slate-800 mt-3 mb-1 first:mt-0">
          {parseInlineMarkdown(h3Match[1])}
        </h3>
      );
      continue;
    }

    // 3. Heading 2
    const h2Match = line.match(/^##\s+(.+)$/);
    if (h2Match) {
      renderedLines.push(
        <h2 key={i} className="text-sm font-bold text-slate-800 mt-4 mb-1.5 first:mt-0">
          {parseInlineMarkdown(h2Match[1])}
        </h2>
      );
      continue;
    }

    // 4. Heading 1
    const h1Match = line.match(/^#\s+(.+)$/);
    if (h1Match) {
      renderedLines.push(
        <h1 key={i} className="text-base font-bold text-slate-900 mt-4.5 mb-2 first:mt-0">
          {parseInlineMarkdown(h1Match[1])}
        </h1>
      );
      continue;
    }

    // 5. Bullet List Item
    const bulletMatch = line.match(/^[\*\-]\s+(.+)$/);
    if (bulletMatch) {
      renderedLines.push(
        <div key={i} className="flex gap-2 items-start pl-2.5 my-1 leading-relaxed">
          <span className="text-slate-400 select-none font-bold text-sm leading-none pt-[1px]">•</span>
          <div className="flex-1 text-slate-700">
            {parseInlineMarkdown(bulletMatch[1])}
          </div>
        </div>
      );
      continue;
    }

    // 6. Regular Paragraph Line (or empty line for spacing)
    if (line.trim() === "") {
      renderedLines.push(<div key={i} className="h-2.5" />);
    } else {
      renderedLines.push(
        <p key={i} className="leading-relaxed text-slate-700 my-1">
          {parseInlineMarkdown(line)}
        </p>
      );
    }
  }

  return <div className="space-y-0.5">{renderedLines}</div>;
}

function formatMessageTime(dateStr: string): string {
  if (!dateStr) return "";
  let isoStr = dateStr;
  if (!isoStr.endsWith("Z") && !isoStr.includes("+") && !isoStr.includes("-")) {
    isoStr = isoStr + "Z";
  }
  try {
    const date = new Date(isoStr);
    return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  } catch (err) {
    console.error("Failed to parse date:", dateStr, err);
    return "";
  }
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
      <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col justify-center max-w-xl mx-auto text-center space-y-6 select-none custom-chat-scrollbar bg-white">
        <div className="flex items-center justify-center mx-auto">
          <img
            src="/logo.svg"
            alt="Beaverdash Logo"
            className="w-24 h-24 object-contain animate-float-fast filter drop-shadow-[0_0_15px_rgba(99,102,241,0.35)] select-none"
          />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-base font-bold text-slate-800 tracking-tight">Tôi có thể giúp gì cho bạn hôm nay?</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
            Hỏi trợ lý AI để lên kế hoạch dự án, phân tích công việc hoặc tạo tác vụ tự động.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full pt-2">
          <button
            onClick={() => onSuggestionClick("Giúp tôi tạo công việc cho dự án")}
            className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50 text-left text-xs font-bold text-slate-700 transition-colors cursor-pointer"
          >
            💡 Giúp tôi tạo công việc cho dự án
          </button>
          <button
            onClick={() => onSuggestionClick("Hỗ trợ tôi lập kế hoạch cho dự án")}
            className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50 text-left text-xs font-bold text-slate-700 transition-colors cursor-pointer"
          >
            📅 Hỗ trợ tôi lập kế hoạch cho dự án
          </button>
        </div>
        <div ref={messagesEndRef} />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 custom-chat-scrollbar bg-white">
      <div className="max-w-3xl mx-auto w-full space-y-6">
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

          if (isUser) {
            return (
              <div key={msg.id} className="flex justify-end w-full">
                <div className="max-w-[70%] rounded-2xl px-4 py-2.5 text-xs bg-[#f4f4f4] text-slate-800 leading-relaxed shadow-3xs">
                  {attachment && (
                    <div className="mb-2 p-2 rounded flex items-center gap-2 border text-[11px] bg-slate-50 border-slate-200 text-slate-850">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold truncate text-[11px]">{attachment.fileName}</div>
                        <div className="text-[9px] opacity-80">{attachment.fileSize}</div>
                      </div>
                    </div>
                  )}
                  {displayText && <p className="whitespace-pre-wrap font-medium">{displayText}</p>}
                  <div className="text-[8px] mt-1 text-right font-semibold text-slate-400 select-none">
                    {formatMessageTime(msg.created_at)}
                  </div>
                </div>
              </div>
            );
          } else {
            return (
              <div key={msg.id} className="flex gap-4 items-start w-full text-slate-800">
                {/* AI Avatar */}
                <img
                  src="/logo.svg"
                  alt="Beaverdash Logo"
                  className="w-10 h-10 object-contain shrink-0 select-none filter drop-shadow-[0_0_4px_rgba(99,102,241,0.15)]"
                />
                {/* Content */}
                <div className="flex-1 min-w-0 pt-0.5 space-y-1">
                  <div className="text-[10px] font-extrabold text-indigo-600 tracking-wider uppercase select-none">Trợ lý BeaverDash</div>
                  <div className="text-xs leading-relaxed font-medium text-slate-800">
                    <MarkdownRenderer content={displayText || ""} />
                  </div>
                  <div className="text-[8px] text-slate-400 font-semibold select-none pt-0.5">
                    {formatMessageTime(msg.created_at)}
                  </div>
                </div>
              </div>
            );
          }
        })}

        {isSending && (
          <div className="flex gap-4 items-start w-full text-slate-800">
            {/* AI Avatar */}
            <img
              src="/logo.svg"
              alt="Beaverdash Logo"
              className="w-10 h-10 object-contain shrink-0 select-none animate-pulse filter drop-shadow-[0_0_6px_rgba(99,102,241,0.25)]"
            />
            {/* Content */}
            <div className="flex-1 min-w-0 pt-0.5 space-y-1">
              <div className="text-[10px] font-extrabold text-indigo-600 tracking-wider uppercase select-none">Trợ lý BeaverDash</div>
              <div className="flex items-center gap-2 pt-0.5">
                <div className="flex gap-1 shrink-0">
                  <span className="h-1.5 w-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="h-1.5 w-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="h-1.5 w-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
                <span className="text-[10px] text-indigo-600 font-bold tracking-wide animate-pulse select-none">
                  {isCreatingTasks ? "Đang tạo công việc..." : "Đang suy nghĩ..."}
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
