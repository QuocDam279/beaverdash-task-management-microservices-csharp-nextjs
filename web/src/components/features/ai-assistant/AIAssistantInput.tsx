"use client";

/**
 * @component AIAssistantInput
 * @description Sleek message input bar for the AI assistant supporting document uploads.
 */

import * as React from "react";

import { ProjectDocPickerModal } from "./ProjectDocPickerModal";

import { useAIAssistantInput } from "@/hooks/useAIAssistantInput";

interface InputProps {
  projectId: string;
  inputText: string;
  setInputText: (text: string) => void;
  isSending: boolean;
  countdown: number;
  onSubmit: (
    text: string,
    attachment?: { fileName: string; fileSize: string; content: string } | null
  ) => void;
  onStop?: () => void;
  hasActiveSession: boolean;
}

export function AIAssistantInput({
  projectId,
  inputText,
  setInputText,
  isSending,
  countdown,
  onSubmit,
  onStop,
  hasActiveSession,
}: InputProps) {
  const {
    fileAttachment,
    setFileAttachment,
    isUploading,
    uploadError,
    setUploadError,
    isPickerOpen,
    setIsPickerOpen,
    fileInputRef,
    textareaRef,
    handleFileChange,
    handleSelectProjectDoc,
    triggerFileInput,
    handleKeyDown,
    handleSubmit,
  } = useAIAssistantInput({
    projectId,
    inputText,
    setInputText,
    isSending,
    countdown,
    onSubmit,
  });

  return (
    <div className="p-4 bg-transparent shrink-0">
      <div className="max-w-3xl mx-auto w-full px-4">
        {/* Upload Error Banner */}
        {uploadError && (
          <div className="mb-2 text-[10px] text-red-500 dark:text-red-400 font-bold bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded px-2.5 py-1 flex items-center justify-between">
            <span>⚠️ {uploadError}</span>
            <button onClick={() => setUploadError(null)} className="text-red-400 hover:text-red-650 ml-1 font-bold border-0 bg-transparent cursor-pointer">
              ×
            </button>
          </div>
        )}

        {/* File Attachment Chip */}
        {fileAttachment && (
          <div className="mb-2 flex items-center justify-between bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-lg px-3 py-1.5 w-full shadow-3xs">
            <div className="flex items-center gap-2 min-w-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1868db" strokeWidth="2.5" className="shrink-0">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate">
                {fileAttachment.fileName} ({fileAttachment.fileSize})
              </span>
              {fileAttachment.estimatedTokens !== undefined && (
                <span className="text-[9px] bg-slate-100 dark:bg-[#2c3338] text-slate-500 dark:text-slate-400 px-1.5 py-0.2 rounded border border-slate-200 dark:border-[#353e47]">
                  Ước tính ~{fileAttachment.estimatedTokens.toLocaleString()} tokens
                </span>
              )}
            </div>
            <button
              onClick={() => setFileAttachment(null)}
              className="text-slate-400 hover:text-red-500 font-bold text-xs p-0.5 cursor-pointer transition-colors border-0 bg-transparent"
              title="Xóa đính kèm"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 bg-slate-100 dark:bg-[#22272b] border border-transparent focus-within:border-slate-300/80 dark:focus-within:border-[#353e47] focus-within:bg-white dark:focus-within:bg-[#2c3338] rounded-3xl px-4 py-2 transition-all duration-150"
        >
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".txt,.md,.json,.csv,.xml,.js,.ts,.py,.cs,.html,.pdf,.docx,.xlsx"
            className="hidden"
            disabled={isSending || isUploading || countdown > 0}
          />

          {/* Pick from Project Docs Button */}
          <button
            type="button"
            onClick={() => setIsPickerOpen(true)}
            disabled={isSending || isUploading || countdown > 0}
            title="Đính kèm tài liệu từ thư mục dự án"
            className="p-1.5 rounded-full hover:bg-slate-200/50 dark:hover:bg-[#2c3338]/50 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors flex items-center justify-center cursor-pointer border-0 bg-transparent shrink-0 disabled:opacity-50"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
          </button>

          {/* Attachment Trigger Button */}
          <button
            type="button"
            onClick={triggerFileInput}
            disabled={isSending || isUploading || countdown > 0}
            title="Đính kèm tài liệu từ thiết bị (.pdf, .docx, .xlsx, .txt, v.v.)"
            className={`p-1.5 rounded-full hover:bg-slate-200/50 dark:hover:bg-[#2c3338]/50 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors flex items-center justify-center cursor-pointer border-0 bg-transparent shrink-0 ${
              isUploading ? "animate-pulse" : ""
            } ${countdown > 0 ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isUploading ? (
              <svg className="animate-spin h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
              </svg>
            )}
          </button>

          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              countdown > 0
                ? `Trợ lý quá tải. Vui lòng thử lại sau ${countdown}s...`
                : hasActiveSession
                ? "Hỏi trợ lý AI lên kế hoạch hoặc phân tích tài liệu..."
                : "Nhập câu hỏi hoặc tải lên tài liệu để bắt đầu..."
            }
            disabled={isSending || isUploading || countdown > 0}
            rows={1}
            className={`flex-1 bg-transparent border-none outline-hidden text-xs text-slate-800 dark:text-[#deebff] placeholder-slate-450 dark:placeholder-slate-500 py-1.5 resize-none min-h-[20px] max-h-[120px] custom-chat-scrollbar ${
              !inputText ? "overflow-hidden" : ""
            }`}
          />

          {countdown > 0 ? (
            <button
              type="button"
              disabled
              className="p-1.5 rounded-[4px] flex items-center justify-center bg-slate-200 dark:bg-[#2c3338] text-slate-500 dark:text-slate-400 font-bold text-[10px] min-w-[28px] h-6 cursor-not-allowed shadow-3xs border-0 shrink-0"
            >
              {countdown}s
            </button>
          ) : isSending ? (
            <button
              type="button"
              onClick={onStop}
              title="Dừng trợ lý AI"
              className="p-2 rounded-full flex items-center justify-center cursor-pointer transition-all bg-red-600 hover:bg-red-700 text-white shadow-3xs hover:shadow-2xs animate-pulse border-0 shrink-0"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <rect x="4" y="4" width="16" height="16" rx="2" />
              </svg>
            </button>
          ) : (
            <button
              type="submit"
              disabled={(!inputText.trim() && !fileAttachment) || isUploading}
              className={`p-2 rounded-full flex items-center justify-center cursor-pointer transition-all duration-150 border-0 shrink-0 ${
                (inputText.trim() || fileAttachment) && !isUploading
                  ? "bg-slate-900 hover:bg-black text-white dark:bg-[#579dff] dark:hover:bg-blue-400 dark:text-[#1d2125] hover:scale-[1.05] active:scale-[0.95]"
                  : "bg-slate-200 dark:bg-[#2c3338] text-slate-400 dark:text-slate-650 cursor-not-allowed"
              }`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          )}
          <ProjectDocPickerModal
            isOpen={isPickerOpen}
            onClose={() => setIsPickerOpen(false)}
            projectId={projectId}
            onSelect={handleSelectProjectDoc}
          />
        </form>
      </div>
    </div>
  );
}
