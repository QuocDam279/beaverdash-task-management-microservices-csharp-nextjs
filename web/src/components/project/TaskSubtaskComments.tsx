"use client";

/**
 * @component TaskSubtaskComments
 * @description Quản lý hiển thị danh sách bình luận của subtask và tích hợp form thêm bình luận mới.
 */

import * as React from "react";

import { TaskSubtaskCommentForm, StagedAttachment } from "./TaskSubtaskCommentForm";
import { TaskSubtaskCommentItem } from "./TaskSubtaskCommentItem";

import { Comment } from "@/types/task";
import { User } from "@/types/auth";

interface TaskSubtaskCommentsProps {
  subtaskId: string;
  comments: Comment[];
  currentUser: User | null;
  onAddComment: (
    subTaskId: string,
    content: string,
    attachments?: StagedAttachment[]
  ) => void;
  onDeleteComment: (subTaskId: string, commentId: string) => void;
  readOnly?: boolean;
}

export function TaskSubtaskComments({
  subtaskId,
  comments,
  currentUser,
  onAddComment,
  onDeleteComment,
  readOnly = false,
}: TaskSubtaskCommentsProps) {
  const handleCommentSubmit = (content: string, stagedAtts: StagedAttachment[]) => {
    onAddComment(subtaskId, content, stagedAtts);
  };

  return (
    <div className="pl-7 pt-2 pb-1 border-t border-slate-100/50 space-y-2.5 animate-in slide-in-from-top-1 duration-150">
      {/* Comments List */}
      {comments.length > 0 ? (
        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
          {comments.map((comment) => (
            <TaskSubtaskCommentItem
              key={comment.id}
              comment={comment}
              currentUser={currentUser}
              onDeleteComment={(commentId) => onDeleteComment(subtaskId, commentId)}
              readOnly={readOnly}
            />
          ))}
        </div>
      ) : (
        <p className="text-[10px] text-slate-400 font-medium italic py-1">
          Chưa có bình luận nào cho công việc con này.
        </p>
      )}

      {/* Comment Form */}
      {!readOnly && (
        <TaskSubtaskCommentForm
          subtaskId={subtaskId}
          onSubmit={handleCommentSubmit}
        />
      )}
    </div>
  );
}
