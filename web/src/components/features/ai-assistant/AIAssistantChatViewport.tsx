"use client";

import * as React from "react";
import { ChatMessage } from "@/hooks/useAIAssistant";
import { AIAssistantToolCard } from "./AIAssistantToolCard";

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
      return <strong key={index} className="font-bold text-slate-800 dark:text-[#deebff]">{part.slice(2, -2)}</strong>;
    } else if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={index} className="px-1.5 py-0.5 bg-slate-100 dark:bg-[#2c3338] border border-slate-200/65 dark:border-[#353e47] rounded text-[10px] font-mono text-pink-600 dark:text-pink-400 select-all font-semibold">
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
      renderedLines.push(<hr key={i} className="my-3 border-slate-200/50 dark:border-[#2c3338]/50" />);
      continue;
    }

    // 2. Heading 3
    const h3Match = line.match(/^###\s+(.+)$/);
    if (h3Match) {
      renderedLines.push(
        <h3 key={i} className="text-sm font-extrabold text-slate-800 dark:text-[#deebff] mt-3.5 mb-1.5 first:mt-0">
          {parseInlineMarkdown(h3Match[1])}
        </h3>
      );
      continue;
    }

    // 3. Heading 2
    const h2Match = line.match(/^##\s+(.+)$/);
    if (h2Match) {
      renderedLines.push(
        <h2 key={i} className="text-base font-bold text-slate-850 dark:text-white mt-4 mb-2 first:mt-0">
          {parseInlineMarkdown(h2Match[1])}
        </h2>
      );
      continue;
    }

    // 4. Heading 1
    const h1Match = line.match(/^#\s+(.+)$/);
    if (h1Match) {
      renderedLines.push(
        <h1 key={i} className="text-lg font-extrabold text-slate-900 dark:text-white mt-5 mb-2.5 first:mt-0">
          {parseInlineMarkdown(h1Match[1])}
        </h1>
      );
      continue;
    }

    // 5. Bullet List Item
    const bulletMatch = line.match(/^[\*\-]\s+(.+)$/);
    if (bulletMatch) {
      renderedLines.push(
        <div key={i} className="flex gap-2 items-start pl-2.5 my-1.5 leading-relaxed">
          <span className="text-slate-400 dark:text-slate-500 select-none font-bold text-sm leading-none pt-[2px]">•</span>
          <div className="flex-1 text-slate-700 dark:text-slate-350 text-sm">
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
        <p key={i} className="leading-relaxed text-slate-700 dark:text-slate-300 my-1.5 text-sm">
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
  const creationProgress = React.useMemo(() => {
    let total = 0;
    let completed = 0;
    let currentTaskName = "";
    let isTaskCreationActive = false;

    const lastUserIdx = [...messages].reverse().findIndex((m) => m.role === "user");
    const turnMsgs = lastUserIdx !== -1 ? messages.slice(messages.length - 1 - lastUserIdx) : messages;

    for (let idx = 0; idx < turnMsgs.length; idx++) {
      const msg = turnMsgs[idx];
      if (msg.role === "assistant" && msg.tool_calls) {
        for (const tc of msg.tool_calls) {
          if (tc.name === "create_task" || tc.name === "create_subtask") {
            total++;
            isTaskCreationActive = true;
            
            // Check if there is a corresponding tool_result in the subsequent tool messages of this turn
            let isItemCompleted = false;
            for (let i = idx + 1; i < turnMsgs.length; i++) {
              const nextMsg = turnMsgs[i];
              if (nextMsg.role === "tool" && nextMsg.tool_results) {
                const hasResult = nextMsg.tool_results.some(
                  (r) => r.name === tc.name && (r.result.includes("Thành công") || r.result.includes("Success"))
                );
                if (hasResult) {
                  isItemCompleted = true;
                  break;
                }
              }
              if (nextMsg.role === "assistant") {
                break;
              }
            }

            if (isItemCompleted) {
              completed++;
            } else if (!currentTaskName && tc.args && tc.args.title) {
              currentTaskName = tc.args.title;
            }
          }
        }
      }
    }

    return {
      total,
      completed,
      currentTaskName,
      isActive: isTaskCreationActive
    };
  }, [messages]);

  if (isHistoryLoading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full dark:bg-[#1d2125]">
        <svg className="animate-spin h-6 w-6 text-[#1868db] dark:text-[#579dff] shrink-0" fill="none" viewBox="0 0 24 24">
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
      <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col justify-center max-w-xl mx-auto text-center space-y-6 select-none custom-chat-scrollbar bg-white dark:bg-[#1d2125]">
        <div className="flex items-center justify-center mx-auto">
          <img
            src="/logo.svg"
            alt="Beaverdash Logo"
            className="w-24 h-24 object-contain animate-float-fast filter drop-shadow-[0_0_15px_rgba(99,102,241,0.35)] select-none"
          />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-base font-bold text-slate-800 dark:text-[#deebff] tracking-tight">Tôi có thể giúp gì cho bạn hôm nay?</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
            Hỏi trợ lý AI để lên kế hoạch dự án, phân tích công việc hoặc tạo tác vụ tự động.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full pt-2">
          <button
            onClick={() => onSuggestionClick("Giúp tôi tạo công việc cho dự án")}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-[#353e47] bg-white dark:bg-[#22272b] hover:border-slate-300 dark:hover:border-slate-500 hover:bg-slate-50/50 dark:hover:bg-[#2c3338] text-left text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            💡 Giúp tôi tạo công việc cho dự án
          </button>
          <button
            onClick={() => onSuggestionClick("Hỗ trợ tôi lập kế hoạch cho dự án")}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-[#353e47] bg-white dark:bg-[#22272b] hover:border-slate-300 dark:hover:border-slate-500 hover:bg-slate-50/50 dark:hover:bg-[#2c3338] text-left text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            📅 Hỗ trợ tôi lập kế hoạch cho dự án
          </button>
          <a
            href="/templates/project_plan_template.docx"
            download="Mau_Ke_Hoach_Du_An_Nhom_BeaverDash.docx"
            className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/15 hover:border-emerald-300 dark:hover:border-emerald-700/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/25 text-left text-xs font-bold text-emerald-700 dark:text-emerald-400 transition-colors cursor-pointer no-underline"
          >
            📄 Tải file mẫu kế hoạch dự án nhóm
            <span className="block text-[10px] font-medium text-emerald-600/70 dark:text-emerald-500/60 mt-1">Điền thông tin → đính kèm → AI tự lập kế hoạch</span>
          </a>
        </div>
        <div ref={messagesEndRef} />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 custom-chat-scrollbar bg-white dark:bg-[#1d2125]">
      <div className="max-w-3xl mx-auto w-full space-y-6">
        {messages.map((msg, index) => {
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
                <div className="max-w-[70%] rounded-2xl px-4 py-2.5 text-sm bg-slate-100 dark:bg-[#2c3338] text-slate-800 dark:text-[#deebff] leading-relaxed shadow-3xs">
                  {attachment && (
                    <div className="mb-2 p-2 rounded flex items-center gap-2 border text-[11px] bg-slate-50 dark:bg-[#22272b] border-slate-200 dark:border-[#353e47] text-slate-700 dark:text-[#deebff]">
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
                  <div className="text-[8px] mt-1 text-right font-semibold text-slate-400 dark:text-slate-500 select-none">
                    {formatMessageTime(msg.created_at)}
                  </div>
                </div>
              </div>
            );
          } else {
            // Find tool results for this assistant message by scanning forward in the message list
            const toolResults: any[] = [];
            if (msg.tool_calls && msg.tool_calls.length > 0) {
              for (let i = index + 1; i < messages.length; i++) {
                const nextMsg = messages[i];
                if (nextMsg.role === "tool" && nextMsg.tool_results) {
                  toolResults.push(...nextMsg.tool_results);
                }
                if (nextMsg.role === "assistant" || nextMsg.role === "user") {
                  break;
                }
              }
            }

            return (
              <div key={msg.id} className="flex gap-4 items-start w-full text-slate-800 dark:text-slate-300 p-4 rounded-2xl bg-slate-50/50 dark:bg-[#2c3338]/15 border border-slate-100/50 dark:border-transparent">
                {/* AI Avatar */}
                <img
                  src="/logo.svg"
                  alt="Beaverdash Logo"
                  className="w-9 h-9 object-contain shrink-0 select-none filter drop-shadow-[0_0_4px_rgba(99,102,241,0.15)]"
                />
                {/* Content */}
                <div className="flex-1 min-w-0 pt-0.5 space-y-1">
                  <div className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase select-none">Trợ lý BeaverDash</div>
                  <div className="text-sm leading-relaxed font-medium text-slate-800 dark:text-slate-350">
                    <MarkdownRenderer content={displayText || ""} />
                  </div>
                  {msg.tool_calls && msg.tool_calls.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {msg.tool_calls.map((tc, idx) => (
                        <AIAssistantToolCard
                          key={idx}
                          toolCall={tc}
                          toolResults={toolResults.length > 0 ? toolResults : null}
                        />
                      ))}
                    </div>
                  )}
                  <div className="text-[8px] text-slate-400 dark:text-slate-500 font-semibold select-none pt-0.5">
                    {formatMessageTime(msg.created_at)}
                  </div>
                </div>
              </div>
            );
          }
        })}

        {isSending && (
          <div className="flex gap-4 items-start w-full text-slate-800 dark:text-slate-300 p-4 rounded-2xl bg-slate-50/50 dark:bg-[#2c3338]/15 border border-slate-100/50 dark:border-transparent">
            {/* AI Avatar */}
            <img
              src="/logo.svg"
              alt="Beaverdash Logo"
              className="w-9 h-9 object-contain shrink-0 select-none animate-pulse filter drop-shadow-[0_0_6px_rgba(99,102,241,0.25)]"
            />
            {/* Content */}
            <div className="flex-1 min-w-0 pt-0.5 space-y-2">
              <div className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase select-none">Trợ lý BeaverDash</div>
              
              {creationProgress.isActive ? (
                <div className="p-4 rounded-2xl border border-indigo-100 dark:border-indigo-950/40 bg-gradient-to-br from-indigo-50/40 to-white dark:from-indigo-950/10 dark:to-slate-900/10 shadow-sm space-y-3 max-w-md">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-800 dark:text-[#deebff]">
                    <div className="flex items-center gap-2">
                      <svg className="animate-spin h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Đang tự động tạo các công việc...</span>
                    </div>
                    <span className="text-indigo-600 dark:text-indigo-400 tabular-nums">
                      {creationProgress.completed}/{creationProgress.total}
                    </span>
                  </div>

                  {/* Progress Bar Container */}
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-500 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${(creationProgress.completed / Math.max(1, creationProgress.total)) * 100}%` }}
                    />
                  </div>

                  {/* Details of the task currently being processed */}
                  {creationProgress.currentTaskName && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                      Đang xử lý: <strong className="text-slate-700 dark:text-slate-200">{creationProgress.currentTaskName}</strong>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 pt-0.5">
                  <div className="flex gap-1 shrink-0">
                    <span className="h-1.5 w-1.5 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="h-1.5 w-1.5 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="h-1.5 w-1.5 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold tracking-wide animate-pulse select-none">
                    Đang suy nghĩ...
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
