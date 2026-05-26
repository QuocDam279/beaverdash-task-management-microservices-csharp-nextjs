"use client";

/**
 * @page Beaver Assistant (AI Assistant)
 * @description Trang điều phối giao diện Trợ lý Beaver AI: Quản lý dự án, tài liệu RAG, phiên chat.
 */

import * as React from "react";
import { ChatHistory, DocumentManager, ChatWindow } from "@/components/features/ai-assistant";
import { useAiAssistant } from "@/hooks/useAiAssistant";

export default function AiAssistantPage() {
  const {
    projects,
    selectedProjId,
    setSelectedProjId,
    documents,
    sessions,
    messages,
    activeSessionId,
    setActiveSessionId,
    isThinking,
    showHistory,
    setShowHistory,
    showDocs,
    setShowDocs,
    handleCreateSession,
    handleDeleteSession,
    handleUploadDocument,
    handleDeleteDocument,
    handleSendMessage,
    handleDownloadDocument,
    handleUpdateSessionTitle,
  } = useAiAssistant();

  return (
    <div className="h-[calc(100vh-3.5rem)] overflow-hidden flex flex-col bg-[#f4f5f7] p-4 gap-4 font-sans">
      {/* Top Banner Select Project */}
      <div className="px-5 py-3 border border-[#dfe1e6] bg-white rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 shadow-[0_1px_3px_rgba(9,30,66,0.08)]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-7 w-7 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-2xs shrink-0">
            <img src="/logo.svg" alt="Beaver AI" className="h-4.5 w-4.5 object-contain" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-[#292a2e] leading-tight">Trợ lý Beaver</h1>
            <p className="text-[10px] text-[#505258] font-semibold mt-0.5 whitespace-nowrap md:whitespace-normal truncate md:overflow-visible">
              Hỏi đáp RAG ngữ cảnh dự án kết hợp tài liệu đính kèm
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Toggle History (mobile only) */}
          <button
            onClick={() => {
              setShowHistory(!showHistory);
              if (showDocs) setShowDocs(false);
            }}
            className={`md:hidden px-2.5 py-1.5 rounded border border-[#dfe1e6] text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-1 ${
              showHistory ? "bg-[#1868db]/10 text-[#1868db] border-[#1868db]/20" : "bg-white text-[#505258]"
            }`}
            title="Lịch sử trò chuyện"
          >
            <span>💬</span>
            <span className="text-[10px]">Hội thoại</span>
          </button>

          {/* Toggle Documents (tablet & mobile) */}
          <button
            onClick={() => {
              setShowDocs(!showDocs);
              if (showHistory) setShowHistory(false);
            }}
            className={`lg:hidden px-2.5 py-1.5 rounded border border-[#dfe1e6] text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-1 ${
              showDocs ? "bg-[#1868db]/10 text-[#1868db] border-[#1868db]/20" : "bg-white text-[#505258]"
            }`}
            title="Kho tri thức"
          >
            <span>📁</span>
            <span className="text-[10px]">Tài liệu</span>
          </button>

          <label className="text-[10px] font-bold text-[#505258] uppercase tracking-wider whitespace-nowrap">Chọn dự án:</label>
          <select
            value={selectedProjId}
            onChange={(e) => setSelectedProjId(e.target.value)}
            className="text-xs font-semibold px-2.5 py-1.5 border border-[#dfe1e6] rounded bg-white hover:bg-slate-50 cursor-pointer focus:outline-none focus:border-[#1868db] focus:ring-1 focus:ring-[#1868db]/20 w-full md:w-64 max-w-[280px] truncate"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Feature Layout */}
      <div className="flex-1 flex gap-4 min-h-0 overflow-hidden relative">
        {/* Chat History Panel */}
        <div className={`
          absolute md:static inset-y-0 left-0 z-30 w-64 bg-white border border-[#dfe1e6] rounded-lg transition-transform duration-200 shrink-0 shadow-[0_1px_3px_rgba(9,30,66,0.08)] overflow-hidden
          ${showHistory ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}>
          <ChatHistory
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSelectSession={(id) => {
              setActiveSessionId(id);
              setShowHistory(false);
            }}
            onCreateSession={() => {
              handleCreateSession();
              setShowHistory(false);
            }}
            onDeleteSession={handleDeleteSession}
            onUpdateSessionTitle={handleUpdateSessionTitle}
          />
        </div>

        {/* Chat Window Panel */}
        <div className="flex-1 flex flex-col min-w-0 bg-white border border-[#dfe1e6] rounded-lg shadow-[0_1px_3px_rgba(9,30,66,0.08)] overflow-hidden">
          <ChatWindow
            messages={messages}
            isThinking={isThinking}
            onSendMessage={handleSendMessage}
          />
        </div>

        {/* Document Manager Panel */}
        <div className={`
          absolute lg:static inset-y-0 right-0 z-30 w-80 bg-white border border-[#dfe1e6] rounded-lg transition-transform duration-200 shrink-0 shadow-[0_1px_3px_rgba(9,30,66,0.08)] overflow-hidden
          ${showDocs ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
        `}>
          <DocumentManager
            documents={documents}
            onUploadDocument={handleUploadDocument}
            onDeleteDocument={handleDeleteDocument}
            onDownloadDocument={handleDownloadDocument}
          />
        </div>

        {/* Backdrop for mobile overlays */}
        {(showHistory || showDocs) && (
          <div
            onClick={() => {
              setShowHistory(false);
              setShowDocs(false);
            }}
            className="absolute inset-0 bg-slate-900/15 backdrop-blur-xs z-20 lg:hidden"
          />
        )}
      </div>
    </div>
  );
}
