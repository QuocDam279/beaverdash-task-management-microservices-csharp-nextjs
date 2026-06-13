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
    <div className="flex-1 flex flex-col min-h-0 space-y-3 animate-in fade-in duration-200">
      {/* Comment Form */}
      {!readOnly && (
        <div className="pb-1 flex-shrink-0">
          <TaskSubtaskCommentForm
            subtaskId={subtaskId}
            onSubmit={handleCommentSubmit}
          />
        </div>
      )}

      {/* Comments List */}
      {comments.length > 0 ? (
        <div className="flex-1 overflow-y-auto min-h-0 divide-y divide-slate-100/80 dark:divide-[#2c3338] border-t border-slate-100 dark:border-[#2c3338] pt-1 scrollbar-thin">
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
        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium italic py-1 px-1 flex-shrink-0">
          Chưa có thảo luận nào cho nhiệm vụ này.
        </p>
      )}
    </div>
  );
}
