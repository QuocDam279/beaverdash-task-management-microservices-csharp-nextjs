"use client";

/**
 * @component TaskSubtaskCommentItem
 * @description Hiển thị một bình luận của công việc con, kết xuất các tệp đính kèm và liên kết đi kèm.
 */

import * as React from "react";

import { formatRelativeTime } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";

import { Comment, Attachment } from "@/types/task";
import { User } from "@/types/auth";

interface TaskSubtaskCommentItemProps {
  comment: Comment;
  currentUser: User | null;
  onDeleteComment: (commentId: string) => void;
  readOnly?: boolean;
}

function formatBytes(bytes: number | null): string {
  if (bytes === null || bytes === undefined) return "";
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export function TaskSubtaskCommentItem({
  comment,
  currentUser,
  onDeleteComment,
  readOnly = false,
}: TaskSubtaskCommentItemProps) {
  const attachments = comment.attachments || [];

  const getAttachmentUrl = (url: string) => {
    if (url && url.startsWith("/uploads/")) {
      return `http://localhost:5002${url}`;
    }
    return url;
  };

  return (
    <div className="flex gap-3 items-start group/comment py-3 animate-in fade-in duration-200">
      <Avatar
        src={comment.user?.avatar}
        alt={comment.user?.displayName || "User"}
        className="h-8 w-8 rounded-full border border-slate-200 shrink-0"
      />
      <div className="flex-1 min-w-0 relative">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-slate-800">
            {comment.user?.displayName || "User"}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            • {formatRelativeTime(comment.createdAt)}
          </span>
        </div>
        
        {comment.content && (
          <p className="text-xs text-slate-600 leading-relaxed break-words whitespace-pre-line pr-8">
            {comment.content}
          </p>
        )}

        {/* Attachments rendering */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {attachments.map((att) => {
              const isImage = att.fileType?.startsWith("image/");
              const isLink = att.fileType === "link";
              const absoluteUrl = getAttachmentUrl(att.fileUrl);

              if (isImage) {
                return (
                  <a
                    key={att.id}
                    href={absoluteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block max-w-[140px] max-h-[90px] rounded-lg overflow-hidden border border-slate-200 shadow-xs hover:border-slate-300 transition-colors shrink-0"
                    title={att.fileName}
                  >
                    <img
                      src={absoluteUrl}
                      alt={att.fileName}
                      className="object-cover w-full h-full max-h-[90px] hover:scale-105 transition-transform duration-200"
                    />
                  </a>
                );
              }

              if (isLink) {
                return (
                  <a
                    key={att.id}
                    href={att.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-[#1868db] border border-slate-200 text-[10px] font-semibold transition-all max-w-[200px] truncate shadow-2xs"
                    title={att.fileUrl}
                  >
                    <span className="text-xs">🔗</span>
                    <span className="truncate">{att.fileName}</span>
                  </a>
                );
              }

              // Standard file
              return (
                <a
                  key={att.id}
                  href={absoluteUrl}
                  download={att.fileName}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-all max-w-[240px] shadow-2xs group/file"
                  title={`Tải xuống ${att.fileName}`}
                >
                  <div className="h-8 w-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 text-xs font-bold">
                    📄
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold truncate leading-tight text-slate-800 group-hover/file:text-[#1868db] transition-colors">{att.fileName}</p>
                    {att.fileSizeBytes !== null && (
                      <p className="text-[8px] text-slate-400 font-semibold mt-0.5">{formatBytes(att.fileSizeBytes)}</p>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 group-hover/file:text-[#1868db] transition-colors shrink-0">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4m4-5 5 5 5-5m-5 5V3"/></svg>
                  </span>
                </a>
              );
            })}
          </div>
        )}

        {/* Delete comment button (only for the creator) */}
        {!readOnly && currentUser && comment.userId === currentUser.id && (
          <button
            onClick={() => onDeleteComment(comment.id)}
            className="absolute right-0 top-0 opacity-0 group-hover/comment:opacity-100 text-slate-400 hover:text-red-500 cursor-pointer p-1 rounded hover:bg-slate-100 transition-all"
            title="Xóa bình luận"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
