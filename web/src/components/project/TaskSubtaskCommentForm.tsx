"use client";

/**
 * @component TaskSubtaskCommentForm
 * @description Form soạn thảo bình luận cho nhiệm vụ, hỗ trợ đính kèm tệp và liên kết.
 */

import * as React from "react";
import { useAlertConfirm } from "@/components/providers/AlertConfirmProvider";

export interface StagedAttachment {
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSizeBytes: number | null;
  file?: File; // Store the original File object for uploading
}

interface TaskSubtaskCommentFormProps {
  subtaskId: string;
  onSubmit: (content: string, attachments: StagedAttachment[]) => void;
}

export function TaskSubtaskCommentForm({
  subtaskId,
  onSubmit,
}: TaskSubtaskCommentFormProps) {
  const [commentInput, setCommentInput] = React.useState("");
  const [stagedAttachments, setStagedAttachments] = React.useState<StagedAttachment[]>([]);
  const [showLinkInput, setShowLinkInput] = React.useState(false);
  const [linkUrl, setLinkUrl] = React.useState("");
  const [linkTitle, setLinkTitle] = React.useState("");
  
  const { alert } = useAlertConfirm();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const MAX_SIZE_MB = 10; // 10MB limit
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    
    // Check for files exceeding the size limit
    const oversizedFiles = files.filter((f) => f.size > MAX_SIZE_BYTES);
    if (oversizedFiles.length > 0) {
      alert(
        `Một số tệp vượt quá giới hạn dung lượng ${MAX_SIZE_MB}MB:\n${oversizedFiles
          .map((f) => `- ${f.name} (${(f.size / 1024 / 1024).toFixed(1)}MB)`)
          .join("\n")}`,
        "Lỗi dung lượng tệp",
        "warning"
      );
    }
    
    const validFiles = files.filter((f) => f.size <= MAX_SIZE_BYTES);
    if (validFiles.length === 0) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const newStaged: StagedAttachment[] = validFiles.map((file) => ({
      fileName: file.name,
      fileUrl: URL.createObjectURL(file), // Generate safe local URL for previewing/downloading
      fileType: file.type || "application/octet-stream",
      fileSizeBytes: file.size,
      file: file, // Store the File object
    }));

    setStagedAttachments((prev) => [...prev, ...newStaged]);
    if (fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
  };

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrl.trim()) return;

    let formattedUrl = linkUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const title = linkTitle.trim() || linkUrl.trim();
    const newLink: StagedAttachment = {
      fileName: title,
      fileUrl: formattedUrl,
      fileType: "link",
      fileSizeBytes: null,
    };

    setStagedAttachments((prev) => [...prev, newLink]);
    setLinkUrl("");
    setLinkTitle("");
    setShowLinkInput(false);
  };

  const handleRemoveStaged = (indexToRemove: number) => {
    setStagedAttachments((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() && stagedAttachments.length === 0) return;
    onSubmit(commentInput.trim(), stagedAttachments);
    setCommentInput("");
    setStagedAttachments([]);
  };

  return (
    <form onSubmit={handleFormSubmit} className="border border-slate-200 dark:border-[#353e47] rounded bg-slate-50/50 dark:bg-[#22272b]/30 p-2 space-y-2 focus-within:border-slate-350 dark:focus-within:border-slate-500 transition-colors">
      <textarea
        placeholder="Viết bình luận hoặc đính kèm tài liệu..."
        value={commentInput}
        onChange={(e) => setCommentInput(e.target.value)}
        rows={2}
        className="w-full px-2 py-1 text-xs border border-transparent rounded bg-transparent text-[#292a2e] dark:text-[#deebff] focus-visible:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 leading-normal resize-none"
      />

      {/* Staged Attachments Preview List */}
      {stagedAttachments.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-2 pb-1.5">
          {stagedAttachments.map((att, idx) => (
            <div key={idx} className="flex items-center gap-1.5 bg-white dark:bg-[#2c3338] border border-slate-200 dark:border-[#353e47] pl-2 pr-1 py-0.5 rounded text-[10px] text-slate-600 dark:text-slate-300 font-semibold shadow-xs select-none">
              <span>{att.fileType === "link" ? "🔗" : "📁"}</span>
              <span className="truncate max-w-[120px]">{att.fileName}</span>
              <button
                type="button"
                onClick={() => handleRemoveStaged(idx)}
                className="text-slate-400 dark:text-slate-500 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-[#353e47] rounded-full p-0.5 cursor-pointer ml-0.5"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Inline Link Popover/Form */}
      {showLinkInput && (
        <div className="border border-slate-200 dark:border-[#353e47] rounded p-2 bg-white dark:bg-[#22272b] mx-2 space-y-1.5 shadow-sm animate-in fade-in slide-in-from-top-1 duration-100">
          <input
            type="text"
            placeholder="URL liên kết (ví dụ: https://example.com)..."
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="w-full px-2 py-1 text-[10px] border border-slate-200 dark:border-[#353e47] rounded bg-white dark:bg-[#2c3338] text-[#292a2e] dark:text-[#deebff] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#1868db] dark:focus-visible:ring-[#579dff]"
            autoFocus
          />
          <div className="flex gap-1.5">
            <input
              type="text"
              placeholder="Tên hiển thị (tùy chọn)..."
              value={linkTitle}
              onChange={(e) => setLinkTitle(e.target.value)}
              className="flex-1 px-2 py-1 text-[10px] border border-slate-200 dark:border-[#353e47] rounded bg-white dark:bg-[#2c3338] text-[#292a2e] dark:text-[#deebff] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#1868db] dark:focus-visible:ring-[#579dff]"
            />
            <button
              type="button"
              onClick={handleAddLink}
              disabled={!linkUrl.trim()}
              className="bg-[#1868db] dark:bg-[#579dff] hover:bg-[#0052cc] dark:hover:bg-blue-400 disabled:bg-slate-100 dark:disabled:bg-[#353e47] disabled:text-slate-400 dark:disabled:text-slate-600 text-white dark:text-[#1d2125] text-[9px] font-extrabold px-2.5 rounded cursor-pointer"
            >
              Thêm liên kết
            </button>
            <button
              type="button"
              onClick={() => setShowLinkInput(false)}
              className="border border-slate-200 dark:border-[#353e47] text-slate-600 dark:text-slate-400 text-[9px] font-semibold px-2 py-1 rounded hover:bg-slate-50 dark:hover:bg-[#2c3338] cursor-pointer"
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      {/* Action Toolbar */}
      <div className="flex items-center justify-between border-t border-slate-200/50 dark:border-[#353e47]/30 pt-2 px-1">
        <div className="flex items-center gap-1.5">
          {/* File input (hidden) */}
          <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          {/* Attachment Paperclip Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-1 rounded text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-150 dark:hover:bg-[#2c3338] transition-colors cursor-pointer"
            title="Đính kèm tệp tin"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
          </button>

          {/* Link Button */}
          <button
            type="button"
            onClick={() => setShowLinkInput(!showLinkInput)}
            className={`p-1 rounded text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-150 dark:hover:bg-[#2c3338] transition-colors cursor-pointer ${showLinkInput ? "text-slate-700 dark:text-slate-300 bg-slate-150 dark:bg-[#2c3338]" : ""}`}
            title="Thêm liên kết"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </button>
        </div>

        <button
          type="submit"
          disabled={!commentInput.trim() && stagedAttachments.length === 0}
          className="bg-[#1868db] dark:bg-[#579dff] hover:bg-[#0052cc] dark:hover:bg-blue-400 disabled:bg-slate-150 dark:disabled:bg-[#2c3338] disabled:text-slate-400 dark:disabled:text-slate-600 text-white dark:text-[#1d2125] text-[10px] font-extrabold px-3 py-1 rounded transition-colors cursor-pointer shrink-0"
        >
          Gửi bình luận
        </button>
      </div>
    </form>
  );
}
