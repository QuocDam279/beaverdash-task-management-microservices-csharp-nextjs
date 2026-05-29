"use client";

import * as React from "react";
import { ChatSession } from "@/hooks/useAIAssistant";
import { useAlertConfirm } from "@/components/providers/AlertConfirmProvider";

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  setActiveSessionId: (id: string) => void;
  isSessionsLoading: boolean;
  onCreateSession: () => void;
  onRenameSession: (id: string, title: string) => Promise<void>;
  onDeleteSession: (id: string) => Promise<void>;
}

export function AIAssistantSidebar({
  sessions,
  activeSessionId,
  setActiveSessionId,
  isSessionsLoading,
  onCreateSession,
  onRenameSession,
  onDeleteSession,
}: SidebarProps) {
  const [editingSessionId, setEditingSessionId] = React.useState<string | null>(null);
  const [editTitle, setEditTitle] = React.useState<string>("");
  const { confirm } = useAlertConfirm();

  const handleSaveRename = async (id: string) => {
    if (!editTitle.trim()) {
      setEditingSessionId(null);
      return;
    }
    await onRenameSession(id, editTitle.trim());
    setEditingSessionId(null);
  };

  const handleConfirmDelete = async (id: string) => {
    const consent = await confirm(
      "Bạn có chắc chắn muốn xóa cuộc hội thoại này? Mọi tin nhắn bên trong sẽ bị xóa vĩnh viễn.",
      {
        title: "Xóa cuộc hội thoại",
        confirmLabel: "Xóa",
        cancelLabel: "Hủy",
        variant: "danger",
      }
    );
    if (consent) {
      await onDeleteSession(id);
    }
  };

  return (
    <div className="w-[240px] border-r border-[#262626] bg-[#171717] flex flex-col shrink-0 text-slate-200">
      <div className="p-3.5 border-b border-[#262626] flex flex-col gap-3 shrink-0 bg-[#171717]">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Trợ lý BeaverDash</span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" title="Sẵn sàng" />
        </div>
        <button
          onClick={onCreateSession}
          className="w-full py-2 px-3 bg-transparent hover:bg-[#212121] border border-slate-700/50 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Hội thoại mới
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-chat-scrollbar">
        {isSessionsLoading ? (
          <div className="flex items-center justify-center p-4">
            <svg className="animate-spin h-5 w-5 text-slate-450" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 italic font-semibold">Chưa có hội thoại nào</div>
        ) : (
          sessions.map((s) => {
            const isActive = activeSessionId === s.id;
            const isEditing = editingSessionId === s.id;
            return (
              <div
                key={s.id}
                onClick={() => {
                  if (!isEditing) {
                    setActiveSessionId(s.id);
                  }
                }}
                className={`group relative w-full flex items-center justify-between pl-2.5 pr-14 py-2.5 rounded-lg text-xs font-semibold cursor-pointer ${
                  isActive
                    ? "bg-[#212121] text-white font-bold"
                    : "text-slate-300 hover:bg-[#212121]/50 hover:text-white"
                }`}
              >
                {isEditing ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSaveRename(s.id);
                      } else if (e.key === "Escape") {
                        setEditingSessionId(null);
                      }
                    }}
                    onBlur={() => handleSaveRename(s.id)}
                    autoFocus
                    className="flex-1 bg-[#212121] border border-blue-500 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <>
                    <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        className={`shrink-0 ${isActive ? "text-white" : "text-slate-500"}`}
                      >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      <span className="truncate flex-1">{s.title || "Không tiêu đề"}</span>
                    </div>

                    {/* Action buttons shown on hover */}
                    <div className="hidden group-hover:flex items-center gap-1 absolute right-2 top-1/2 -translate-y-1/2 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingSessionId(s.id);
                          setEditTitle(s.title || "");
                        }}
                        className="p-1 rounded hover:bg-[#2f2f2f] text-slate-400 hover:text-white transition-colors cursor-pointer border-0 bg-transparent"
                        title="Sửa tên"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConfirmDelete(s.id);
                        }}
                        className="p-1 rounded hover:bg-[#2f2f2f] text-slate-400 hover:text-red-400 transition-colors cursor-pointer border-0 bg-transparent"
                        title="Xóa cuộc hội thoại"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
