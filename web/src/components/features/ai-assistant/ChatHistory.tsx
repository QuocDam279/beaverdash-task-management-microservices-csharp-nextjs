"use client";

/**
 * @component ChatHistory
 * @description Quản lý danh sách các phiên trò chuyện (chat sessions) của trợ lý AI, hỗ trợ chuyển đổi nhanh và thêm/xóa phiên.
 */

import * as React from "react";
import { AiChatSession } from "@/types/chat";

interface ChatHistoryProps {
  sessions: AiChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onCreateSession: () => void;
  onDeleteSession: (id: string) => void;
  onUpdateSessionTitle: (id: string, title: string) => void;
}

export function ChatHistory({
  sessions,
  activeSessionId,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
  onUpdateSessionTitle,
}: ChatHistoryProps) {
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editTitle, setEditTitle] = React.useState("");

  const handleStartEdit = (id: string, currentTitle: string) => {
    setEditingId(id);
    setEditTitle(currentTitle);
  };

  const handleSaveEdit = (id: string) => {
    if (editTitle.trim()) {
      onUpdateSessionTitle(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === "Enter") {
      handleSaveEdit(id);
    } else if (e.key === "Escape") {
      setEditingId(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f4f5f7] select-none">
      {/* Session Header */}
      <div className="p-4 border-b border-[#dfe1e6] flex items-center justify-between bg-[#f4f5f7]">
        <span className="text-[10px] font-bold text-[#505258] uppercase tracking-wider block">
          Lịch sử trò chuyện
        </span>
        <button
          onClick={onCreateSession}
          className="p-1 rounded-[3px] text-[#1868db] bg-white border border-[#dfe1e6] hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center shadow-xs"
          title="Tạo hội thoại mới"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      {/* Session List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
        {sessions.length > 0 ? (
          sessions.map((session) => (
            <div
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              className={`flex items-center justify-between px-3 py-2 rounded-[3px] text-xs font-semibold cursor-pointer group transition-all duration-100 ${
                activeSessionId === session.id
                  ? "bg-[#deebff] text-[#0747a6]"
                  : "text-[#505258] hover:bg-[#ebecf0] hover:text-[#292a2e]"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="shrink-0 text-sm">💬</span>
                {editingId === session.id ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={() => handleSaveEdit(session.id)}
                    onKeyDown={(e) => handleKeyDown(e, session.id)}
                    className="flex-1 bg-white border border-[#1868db] rounded-[3px] px-1.5 py-0.5 text-xs text-[#292a2e] focus:outline-none"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span className="truncate pr-1">
                    {session.title || "Hội thoại mới"}
                  </span>
                )}
              </div>

              {/* Action buttons */}
              {editingId !== session.id && (
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {/* Edit button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartEdit(session.id, session.title || "Hội thoại mới");
                    }}
                    className="text-[#6b6e76] hover:text-[#1868db] hover:bg-black/5 p-0.5 rounded-[3px] cursor-pointer"
                    title="Đổi tên cuộc trò chuyện"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                    className="text-[#6b6e76] hover:text-[#bf2600] hover:bg-black/5 p-0.5 rounded-[3px] cursor-pointer"
                    title="Xóa cuộc trò chuyện"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-[#6b6e76] text-xs font-semibold italic">
            Chưa có hội thoại nào. Click + để tạo mới!
          </div>
        )}
      </div>
    </div>
  );
}
