"use client";

import * as React from "react";
import { useAiAssistant } from "@/hooks/useAiAssistant";
import { Avatar } from "@/components/ui/Avatar";

interface FloatingAssistantProps {
  projectId: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function FloatingAssistant({ projectId, isOpen, setIsOpen }: FloatingAssistantProps) {
  const [inputValue, setInputValue] = React.useState("");
  
  const {
    setSelectedProjId,
    sessions,
    messages,
    activeSessionId,
    isThinking,
    handleCreateSession,
    handleSendMessage,
  } = useAiAssistant();

  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Sync current projectId with hook
  React.useEffect(() => {
    if (projectId) {
      setSelectedProjId(projectId);
    }
  }, [projectId, setSelectedProjId]);

  // Scroll to bottom on new messages
  React.useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isThinking]);

  // Auto focus input when chat opens
  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);

      // Auto create session if none exists for this project
      if (sessions.length === 0 && !activeSessionId) {
        handleCreateSession();
      }
    }
  }, [isOpen, sessions.length, activeSessionId, handleCreateSession]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isThinking || !activeSessionId) return;
    
    handleSendMessage(inputValue.trim());
    setInputValue("");
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50 font-sans">
        {/* Circle Floating Button (FAB) */}
        <button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 sm:h-16 sm:w-16 bg-transparent flex items-center justify-center rounded-full select-none cursor-pointer border-0 logo-glow-button focus:outline-none"
          title="Trợ lý Beaver AI"
        >
          <img src="/logo.svg" alt="Beaver AI" className="h-11 w-11 sm:h-13 sm:w-13 object-contain" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-white overflow-hidden font-sans">
      {/* Header */}
      <div className="h-12 bg-gradient-to-r from-[#1868db] to-[#0747a6] text-white px-4 flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-white flex items-center justify-center border border-white/20 shrink-0">
            <img src="/logo.svg" alt="Beaver AI" className="h-4 w-4 object-contain" />
          </div>
          <div>
            <h3 className="text-xs font-bold leading-tight">Trợ lý Beaver</h3>
            <p className="text-[9px] opacity-80 font-medium">Hỏi đáp & hỗ trợ tạo việc nhanh</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white opacity-85 hover:opacity-100 hover:scale-110 transition-all cursor-pointer p-1 rounded hover:bg-white/10 flex items-center justify-center"
          title="Thu gọn panel"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 bg-slate-50 space-y-3 flex flex-col custom-chat-scrollbar">
        {messages.length === 0 && !isThinking ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-2">
            <div className="h-14 w-14 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm animate-bounce mb-2">
              <img src="/logo.svg" alt="Beaver AI" className="h-9 w-9 object-contain" />
            </div>
            <p className="text-xs font-bold text-slate-700">Trợ lý Beaver sẵn sàng!</p>
            <p className="text-[10px] text-slate-400 max-w-[200px]">Hãy gửi tin nhắn để bắt đầu hỏi đáp hoặc đề xuất tạo công việc.</p>
            <button
              onClick={handleCreateSession}
              type="button"
              className="px-3 py-1.5 bg-[#1868db] hover:bg-[#0052cc] text-white text-[10px] font-bold rounded-lg cursor-pointer transition-colors shadow-xs"
            >
              Bắt đầu hội thoại
            </button>
          </div>
        
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col w-full ${
                msg.role === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`px-3 py-2 rounded-lg text-xs leading-relaxed whitespace-pre-wrap w-fit max-w-[85%] shadow-2xs ${
                  msg.role === "user"
                    ? "bg-[#1868db] text-white rounded-tr-none"
                    : "bg-white text-[#292a2e] border border-slate-200 rounded-tl-none"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}

        {isThinking && (
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold italic pl-1 self-start">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
            <span>Beaver đang suy nghĩ...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2 shrink-0">
        <input
          ref={inputRef}
          type="text"
          placeholder={activeSessionId ? "Hỏi trợ lý Beaver..." : "Nhấn nút để bắt đầu..."}
          disabled={!activeSessionId || isThinking}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-[#292a2e] focus:outline-none focus:ring-1 focus:ring-[#1868db] focus:border-[#1868db] placeholder:text-slate-400 disabled:bg-slate-50 disabled:cursor-not-allowed transition-all"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isThinking || !activeSessionId}
          className="p-1.5 bg-[#1868db] hover:bg-[#0052cc] disabled:bg-slate-100 disabled:text-slate-300 text-white rounded-lg cursor-pointer flex items-center justify-center transition-colors shadow-2xs shrink-0"
          title="Gửi tin nhắn"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </form>
    </div>
  );
}
