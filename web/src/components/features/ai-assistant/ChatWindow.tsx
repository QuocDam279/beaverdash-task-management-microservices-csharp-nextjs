"use client";

/**
 * @component ChatWindow
 * @description Khung hội thoại chính của trợ lý Beaver AI, hiển thị tin nhắn, nguồn trích dẫn RAG và ô nhập câu hỏi.
 */

import * as React from "react";
import { AiChatMessage, UsedDocumentInfo } from "@/types/chat";

interface ChatWindowProps {
  messages: AiChatMessage[];
  isThinking: boolean;
  onSendMessage: (content: string) => void;
}

export function ChatWindow({ messages, isThinking, onSendMessage }: ChatWindowProps) {
  const [input, setInput] = React.useState("");
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  React.useEffect(() => {
    if (!isThinking) {
      inputRef.current?.focus();
    }
  }, [isThinking]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isThinking) return;
    onSendMessage(input.trim());
    setInput("");
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white relative">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4">
            <div className="h-16 w-16 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm animate-bounce">
              <img src="/logo.svg" alt="Beaver AI" className="h-10 w-10 object-contain" />
            </div>
            <h3 className="text-base font-bold text-[#292a2e]">Tôi có thể giúp gì cho bạn?</h3>
            <p className="text-xs text-[#505258] font-medium leading-relaxed">
              Hãy đặt câu hỏi về tài liệu, kiến trúc phần mềm hoặc quy trình nghiệp vụ trong dự án này. Tôi sẽ đọc tài liệu (RAG) và trả lời chuẩn xác.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {/* Message Content Bubble */}
              <div className={`flex flex-col max-w-[75%] space-y-1.5 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                <div className={`px-4 py-2.5 rounded-lg text-xs font-semibold leading-relaxed whitespace-pre-wrap w-fit ${
                  msg.role === "user"
                    ? "bg-[#1868db] text-white rounded-tr-none shadow-xs"
                    : "bg-[#f4f5f7] text-[#292a2e] border border-[#dfe1e6] rounded-tl-none"
                }`}>
                  {msg.content}
                </div>



                {/* RAG Citations */}
                {msg.role === "assistant" && msg.usedDocuments && msg.usedDocuments.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1 pl-1">
                    <span className="text-[9px] font-bold text-[#6b6e76] self-center uppercase tracking-wider">Nguồn:</span>
                    {msg.usedDocuments.map((doc, idx) => (
                      <span
                        key={`${doc.documentId}-${idx}`}
                        className="text-[10px] bg-[#ebecf0] border border-[#dfe1e6] text-[#505258] px-2 py-0.5 rounded-[3px] font-semibold truncate max-w-xs select-none"
                        title={doc.fileName}
                      >
                        📖 {doc.fileName}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {/* Thinking Indicator */}
        {isThinking && (
          <div className="flex w-full justify-start">
            <div className="bg-[#f4f5f7] text-[#292a2e] border border-[#dfe1e6] px-4 py-2.5 rounded-lg rounded-tl-none flex items-center gap-1.5 shadow-xs w-fit">
              <span className="text-[10px] font-bold text-[#505258]">Beaver đang phân tích tài liệu...</span>
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-[#1868db] rounded-full animate-bounce delay-100" />
                <span className="w-1.5 h-1.5 bg-[#1868db] rounded-full animate-bounce delay-200" />
                <span className="w-1.5 h-1.5 bg-[#1868db] rounded-full animate-bounce delay-300" />
              </div>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Box Form */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-[#dfe1e6] bg-white">
        <div className="relative flex items-center">
          <input
            type="text"
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isThinking}
            placeholder="Hỏi Beaver về tài liệu của dự án..."
            className="w-full text-xs font-semibold pl-4 pr-12 py-2.5 border border-[#dfe1e6] rounded-[6px] focus:outline-none focus:border-[#1868db] focus:ring-1 focus:ring-[#1868db]/20 transition-all bg-white text-[#292a2e] placeholder-[#6b6e76]"
          />
          <button
            type="submit"
            disabled={!input.trim() || isThinking}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-[3px] bg-[#1868db] text-white hover:bg-[#1868db]/90 disabled:opacity-30 disabled:hover:bg-[#1868db] transition-colors cursor-pointer flex items-center justify-center"
          >
            <svg 
              width="12" 
              height="12" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5"
              className="mr-0.5 mt-0.5"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
