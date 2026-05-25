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
  const [activeCitation, setActiveCitation] = React.useState<UsedDocumentInfo | null>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isThinking) return;
    onSendMessage(input.trim());
    setInput("");
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white relative">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4">
            <span className="text-4xl animate-bounce">🦫</span>
            <h3 className="text-base font-bold text-slate-800">Tôi có thể giúp gì cho bạn?</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Hãy đặt câu hỏi về tài liệu, kiến trúc phần mềm hoặc quy trình nghiệp vụ trong dự án này. Tôi sẽ đọc tài liệu (RAG) và trả lời chuẩn xác.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3.5 max-w-3xl ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 shadow-xs border ${
                msg.role === "user" 
                  ? "bg-slate-100 text-slate-700 border-slate-200" 
                  : "bg-[#1868db]/10 text-[#1868db] border-[#1868db]/20 font-bold"
              }`}>
                {msg.role === "user" ? "U" : "🦫"}
              </div>

              {/* Message Content Bubble */}
              <div className="space-y-2 max-w-[calc(100%-3rem)]">
                <div className={`px-4 py-2.5 rounded-lg text-xs font-medium leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-[#1868db] text-white rounded-tr-none"
                    : "bg-slate-100 text-slate-800 border border-slate-200/60 rounded-tl-none"
                }`}>
                  {msg.content}
                </div>

                {/* RAG Citations */}
                {msg.role === "assistant" && msg.usedDocuments && msg.usedDocuments.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1 pl-1">
                    <span className="text-[9px] font-bold text-slate-400 self-center uppercase tracking-wider">Nguồn:</span>
                    {msg.usedDocuments.map((doc, idx) => (
                      <button
                        key={`${doc.documentId}-${idx}`}
                        onClick={() => setActiveCitation(doc)}
                        className="text-[10px] bg-slate-50 border border-slate-200 hover:border-[#1868db] hover:bg-[#1868db]/5 text-slate-600 hover:text-[#1868db] px-2 py-0.5 rounded-full font-semibold transition-all cursor-pointer truncate max-w-xs"
                        title={doc.fileName}
                      >
                        📖 {doc.fileName} [p.{doc.chunkIndex}]
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {/* Thinking Indicator */}
        {isThinking && (
          <div className="flex gap-3.5 max-w-3xl mr-auto">
            <div className="w-8 h-8 rounded-full bg-[#1868db]/10 text-[#1868db] border border-[#1868db]/20 font-bold flex items-center justify-center text-sm shrink-0">
              🦫
            </div>
            <div className="bg-slate-100 text-slate-850 border border-slate-200/60 px-4 py-3 rounded-lg rounded-tl-none flex items-center gap-1.5 shadow-xs">
              <span className="text-[10px] font-bold text-slate-500">Beaver đang phân tích tài liệu...</span>
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
      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-200 bg-white">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isThinking}
            placeholder="Hỏi Beaver về tài liệu của dự án..."
            className="w-full text-xs font-medium pl-4 pr-12 py-2 border border-slate-250 rounded-lg focus:outline-none focus:border-[#1868db] focus:ring-1 focus:ring-[#1868db]/20 transition-all bg-slate-50/50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isThinking}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-[#1868db] text-white hover:bg-[#1868db]/90 disabled:opacity-30 disabled:hover:bg-[#1868db] transition-colors cursor-pointer flex items-center justify-center"
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

      {/* Citation Detail Popup / Overlay */}
      {activeCitation && (
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-150 flex flex-col max-h-[70%] animate-scale-up">
            <div className="p-4 border-b border-slate-150 flex items-center justify-between">
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-slate-800 truncate" title={activeCitation.fileName}>
                  📖 {activeCitation.fileName}
                </h4>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                  Đoạn trích từ index: {activeCitation.chunkIndex}
                </p>
              </div>
              <button
                onClick={() => setActiveCitation(null)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg cursor-pointer transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
              <p className="text-xs text-slate-700 leading-relaxed font-semibold italic bg-white p-4 rounded-lg border border-slate-200/60 shadow-xs whitespace-pre-wrap">
                "{activeCitation.content}"
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
