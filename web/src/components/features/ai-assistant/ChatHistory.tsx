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
}

export function ChatHistory({
  sessions,
  activeSessionId,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
}: ChatHistoryProps) {
  return (
    <div className="w-64 border-r border-slate-200 bg-[#fafbfc] flex flex-col h-full shrink-0">
      {/* Session Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <span className="text-[11px] font-bold text-[#6b6e76] uppercase tracking-wider block">
          Lịch sử trò chuyện
        </span>
        <button
          onClick={onCreateSession}
          className="p-1 rounded text-[#1868db] hover:bg-[#1868db]/10 transition-colors cursor-pointer flex items-center justify-center"
          title="Tạo hội thoại mới"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
              className={`flex items-center justify-between px-3 py-2 rounded-[4px] text-xs font-semibold cursor-pointer group transition-all duration-150 ${
                activeSessionId === session.id
                  ? "bg-[#1868db]/10 text-[#1868db]"
                  : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-800"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="shrink-0 text-sm">💬</span>
                <span className="truncate pr-1">
                  {session.title || "Hội thoại mới"}
                </span>
              </div>

              {/* Delete button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSession(session.id);
                }}
                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 hover:bg-slate-200/60 p-0.5 rounded cursor-pointer transition-opacity"
                title="Xóa cuộc trò chuyện"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-slate-400 text-xs font-medium">
            Chưa có hội thoại nào. Click + để tạo mới!
          </div>
        )}
      </div>
    </div>
  );
}
