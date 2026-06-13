"use client";

import * as React from "react";
import type { ChatMessage } from "@/hooks/useChat";
import { getAttachmentUrl, formatBytes } from "./chatUtils";

interface ChatSidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (val: boolean) => void;
  sidebarTab: "media" | "files" | "links";
  setSidebarTab: (val: "media" | "files" | "links") => void;
  sharedMedia: ChatMessage[];
  sharedFiles: ChatMessage[];
  sharedLinks: { id: string; url: string; title: string; sender: string; date: string }[];
}

export function ChatSidebar({
  isSidebarOpen,
  setIsSidebarOpen,
  sidebarTab,
  setSidebarTab,
  sharedMedia,
  sharedFiles,
  sharedLinks,
}: ChatSidebarProps) {
  if (!isSidebarOpen) return null;

  return (
    <div className="w-80 border-l border-slate-100 dark:border-slate-800 bg-white dark:bg-[#1d2125] flex flex-col shrink-0 h-full overflow-hidden select-none animate-in slide-in-from-right duration-250 z-20">
      
      {/* Sidebar Header */}
      <div className="px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Tệp chia sẻ & Liên kết
        </h3>
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
          title="Đóng thanh bên"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Sidebar Tabs */}
      <div className="flex border-b border-slate-100 dark:border-slate-800 text-[11px] shrink-0 font-bold bg-slate-50/50 dark:bg-slate-900/30">
        {[
          { id: "media", label: "Ảnh & Video" },
          { id: "files", label: "Tài liệu" },
          { id: "links", label: "Liên kết" }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSidebarTab(tab.id as "media" | "files" | "links")}
            className={`flex-1 py-2.5 text-center border-b-2 transition-all cursor-pointer ${
              sidebarTab === tab.id
                ? "border-blue-500 text-blue-600 dark:text-blue-400 font-extrabold"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sidebar Tab Content */}
      <div className="flex-1 overflow-y-auto min-h-0 bg-white dark:bg-[#1d2125]">
        {sidebarTab === "media" && (
          <div className="p-3">
            {sharedMedia.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500">
                Chưa chia sẻ hình ảnh hoặc video nào.
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1.5">
                {sharedMedia.map(msg => (
                  <a
                    key={msg.id}
                    href={getAttachmentUrl(msg.fileUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative aspect-square rounded-[4px] overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-[#353e47]/30 hover:opacity-90 transition-all flex items-center justify-center shrink-0"
                    title={msg.fileName || ""}
                  >
                    {msg.fileType?.startsWith("video/") ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white text-[9px] font-bold select-none p-1">
                        <span className="text-sm mb-0.5">▶</span>
                        <span>Video</span>
                      </div>
                    ) : (
                      <img
                        src={getAttachmentUrl(msg.fileUrl)}
                        alt={msg.fileName || ""}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    )}
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {sidebarTab === "files" && (
          <div className="p-1">
            {sharedFiles.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500">
                Chưa chia sẻ tài liệu hoặc tệp tin nào.
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800/60">
                {sharedFiles.map(msg => (
                  <div key={msg.id} className="flex items-center gap-2.5 p-2.5 text-xs">
                    <div className="w-8 h-8 rounded bg-blue-50 dark:bg-blue-950/20 text-blue-500 flex items-center justify-center shrink-0 text-sm">
                      📄
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-700 dark:text-[#deebff] truncate" title={msg.fileName || ""}>
                        {msg.fileName}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium">
                        {msg.fileSize ? formatBytes(msg.fileSize) : ""} • {new Date(msg.createdAt).toLocaleDateString("vi-VN", { month: "short", day: "numeric" })}
                      </p>
                    </div>
                    <a
                      href={getAttachmentUrl(msg.fileUrl)}
                      download={msg.fileName || ""}
                      className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-blue-500 hover:text-blue-600 transition-colors shrink-0 cursor-pointer"
                      title="Tải xuống"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      ⬇️
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {sidebarTab === "links" && (
          <div className="p-1">
            {sharedLinks.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500">
                Chưa chia sẻ liên kết nào.
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800/60">
                {sharedLinks.map(item => (
                  <div key={item.id} className="flex items-center gap-2.5 p-2.5 text-xs">
                    <div className="w-8 h-8 rounded bg-teal-50 dark:bg-teal-950/20 text-teal-500 flex items-center justify-center shrink-0 text-sm">
                      🔗
                    </div>
                    <div className="flex-1 min-w-0">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-slate-700 dark:text-[#deebff] hover:underline block truncate cursor-pointer"
                        title={item.url}
                      >
                        {item.title}
                      </a>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 truncate font-medium">
                        Gửi bởi {item.sender} • {item.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
