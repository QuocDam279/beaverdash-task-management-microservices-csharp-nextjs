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
  currentUser: User;
  onDeleteComment: (commentId: string) => void;
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
}: TaskSubtaskCommentItemProps) {
  const attachments = comment.attachments || [];

  return (
    <div className="flex gap-2.5 items-start group/comment">
      <Avatar
        src={comment.user?.avatar}
        alt={comment.user?.displayName || "User"}
        className="h-5 w-5 rounded-full border border-slate-200 mt-0.5 shrink-0"
      />
      <div className="flex-1 bg-slate-50 rounded px-2.5 py-1.5 min-w-0 relative pr-6">
        <div className="flex items-baseline justify-between gap-2 mb-0.5">
          <span className="text-[10px] font-bold text-slate-700 truncate">
            {comment.user?.displayName || "User"}
          </span>
          <span className="text-[8px] font-semibold text-slate-400 shrink-0">
            {formatRelativeTime(comment.createdAt)}
          </span>
        </div>
        <p className="text-[11px] text-slate-600 leading-normal break-words whitespace-pre-line">
          {comment.content}
        </p>

        {/* Attachments rendering */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2 pt-1 border-t border-slate-200/50">
            {attachments.map((att) => {
              const isImage = att.fileType?.startsWith("image/");
              const isLink = att.fileType === "link";

              if (isImage) {
                return (
                  <a
                    key={att.id}
                    href={att.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block max-w-[120px] max-h-[80px] rounded overflow-hidden border border-slate-250 hover:opacity-90 transition-opacity"
                    title={att.fileName}
                  >
                    <img
                      src={att.fileUrl}
                      alt={att.fileName}
                      className="object-cover w-full h-full max-h-[80px]"
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
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-white hover:bg-[#1868db]/10 text-slate-700 hover:text-[#1868db] border border-slate-200 text-[10px] font-semibold transition-all max-w-[180px] truncate"
                    title={att.fileUrl}
                  >
                    <span className="scale-90">🔗</span>
                    <span className="truncate">{att.fileName}</span>
                  </a>
                );
              }

              // Standard file
              return (
                <a
                  key={att.id}
                  href={att.fileUrl}
                  download={att.fileName}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-2 py-1.5 rounded bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 transition-all max-w-[200px]"
                  title={`Tải xuống ${att.fileName}`}
                >
                  <span className="text-base shrink-0">📄</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-bold truncate leading-none text-slate-800">{att.fileName}</p>
                    {att.fileSizeBytes !== null && (
                      <p className="text-[8px] text-slate-400 font-semibold mt-1">{formatBytes(att.fileSizeBytes)}</p>
                    )}
                  </div>
                  <span className="text-[9px] text-slate-400 shrink-0">⬇️</span>
                </a>
              );
            })}
          </div>
        )}

        {/* Delete comment button (only for the creator) */}
        {comment.userId === currentUser.id && (
          <button
            onClick={() => onDeleteComment(comment.id)}
            className="absolute right-1.5 top-1.5 opacity-0 group-hover/comment:opacity-100 text-slate-400 hover:text-red-500 cursor-pointer p-0.5 rounded transition-all"
            title="Xóa bình luận"
          >
            <svg
              width="10"
              height="10"
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
