"use client";

import * as React from "react";
import { api } from "@/lib/api";

interface InputProps {
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
  inputText,
  setInputText,
  isSending,
  countdown,
  onSubmit,
  onStop,
  hasActiveSession,
}: InputProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [inputText]);
  const [fileAttachment, setFileAttachment] = React.useState<{
    fileName: string;
    fileSize: string;
    content: string;
    estimatedTokens?: number;
  } | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const MAX_SIZE = 2 * 1024 * 1024; // 2MB limit

    if (file.size > MAX_SIZE) {
      setUploadError("Kích thước tệp tối đa là 2MB. Vui lòng chọn tệp nhỏ hơn.");
      // Reset input value to allow selecting the same file again
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);

      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post("/v1/chat/upload", formData);
      if (res) {
        setFileAttachment({
          fileName: res.fileName,
          fileSize: res.fileSize,
          content: res.content,
          estimatedTokens: res.estimatedTokens,
        });
      }
    } catch (err: any) {
      console.error("Failed to upload/extract document:", err);
      setUploadError(err.message || "Không thể đọc tệp này. Vui lòng thử lại.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    if (isSending || isUploading || countdown > 0) return;
    fileInputRef.current?.click();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (inputText.trim() || fileAttachment) {
        onSubmit(inputText, fileAttachment);
        setFileAttachment(null);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() || fileAttachment) {
      onSubmit(inputText, fileAttachment);
      setFileAttachment(null);
    }
  };

  return (
    <div className="p-4 bg-white border-t border-slate-200 shrink-0">
      {/* Upload Error Banner */}
      {uploadError && (
        <div className="mb-2 text-[10px] text-red-500 font-bold bg-red-50 border border-red-100 rounded px-2.5 py-1 flex items-center justify-between">
          <span>⚠️ {uploadError}</span>
          <button onClick={() => setUploadError(null)} className="text-red-400 hover:text-red-600 ml-1 font-bold">
            ×
          </button>
        </div>
      )}

      {/* File Attachment Chip */}
      {fileAttachment && (
        <div className="mb-2 flex items-center justify-between bg-blue-50/60 border border-blue-100 rounded-lg px-3 py-1.5 w-full shadow-3xs">
          <div className="flex items-center gap-2 min-w-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1868db" strokeWidth="2.5" className="shrink-0">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <span className="text-[11px] font-bold text-slate-700 truncate">
              {fileAttachment.fileName} ({fileAttachment.fileSize})
            </span>
            {fileAttachment.estimatedTokens !== undefined && (
              <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.2 rounded border border-slate-200">
                Ước tính ~{fileAttachment.estimatedTokens.toLocaleString()} tokens
              </span>
            )}
          </div>
          <button
            onClick={() => setFileAttachment(null)}
            className="text-slate-400 hover:text-red-500 font-bold text-xs p-0.5 cursor-pointer transition-colors"
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
        className="flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus-within:border-blue-400 focus-within:bg-white transition-all shadow-3xs"
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

        {/* Attachment Trigger Button */}
        <button
          type="button"
          onClick={triggerFileInput}
          disabled={isSending || isUploading || countdown > 0}
          title="Đính kèm tài liệu (.pdf, .docx, .xlsx, .txt, v.v.)"
          className={`p-1.5 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors flex items-center justify-center cursor-pointer mb-[2px] ${
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
          className="flex-1 bg-transparent border-none outline-hidden text-xs text-slate-800 placeholder-slate-400 py-1 resize-none min-h-[20px] max-h-[120px] custom-chat-scrollbar"
        />

        {countdown > 0 ? (
          <button
            type="button"
            disabled
            className="p-1.5 rounded-[4px] flex items-center justify-center bg-slate-200 text-slate-500 font-bold text-[10px] min-w-[28px] h-6 cursor-not-allowed shadow-3xs mb-[2px]"
          >
            {countdown}s
          </button>
        ) : isSending ? (
          <button
            type="button"
            onClick={onStop}
            title="Dừng trợ lý AI"
            className="p-1.5 rounded-[4px] flex items-center justify-center cursor-pointer transition-all bg-red-650 hover:bg-red-700 text-white shadow-3xs hover:shadow-2xs animate-pulse mb-[2px]"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
              <rect x="4" y="4" width="16" height="16" rx="2" />
            </svg>
          </button>
        ) : (
          <button
            type="submit"
            disabled={(!inputText.trim() && !fileAttachment) || isUploading}
            className={`p-1.5 rounded-[4px] flex items-center justify-center cursor-pointer transition-all mb-[2px] ${
              (inputText.trim() || fileAttachment) && !isUploading
                ? "bg-[#1868db] hover:bg-[#155fc7] text-white"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        )}
      </form>
    </div>
  );
}
