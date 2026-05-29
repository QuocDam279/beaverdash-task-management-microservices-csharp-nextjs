"use client";

/**
 * @component TaskSubtaskItem
 * @description Quản lý hiển thị và tương tác của một công việc con (subtask) riêng lẻ,
 * bao gồm gán người thực hiện, hoàn thành nhanh, xóa subtask và hệ thống bình luận (comments) mở rộng.
 */

import * as React from "react";

import { TaskSubtaskComments } from "./TaskSubtaskComments";
import { Avatar } from "@/components/ui/Avatar";

import { SubTask } from "@/types/task";
import { User } from "@/types/auth";
import { getSubtaskPriorityLabel } from "@/lib/utils";

interface TaskSubtaskItemProps {
  subtask: SubTask;
  taskStartDate?: string | null;
  taskDueDate?: string | null;
  onToggleSubtask: (subTaskId: string) => void;
  onSubtaskAssigneeChange: (subTaskId: string, assigneeId: string) => void;
  onSubtaskDueDateChange: (subTaskId: string, dueDate: string | null) => void;
  onSubtaskPriorityChange: (subTaskId: string, priority: string | null) => void;
  onDeleteSubtask: (subTaskId: string) => void;
  onAddComment: (
    subTaskId: string,
    content: string,
    attachments?: {
      fileName: string;
      fileUrl: string;
      fileType: string;
      fileSizeBytes: number | null;
    }[]
  ) => void;
  onDeleteComment: (subTaskId: string, commentId: string) => void;
  currentUser: User | null;
  allUsers: User[];
  canManage: boolean;
  readOnly?: boolean;
  isPersonalProject?: boolean;
}

export function TaskSubtaskItem({
  subtask,
  taskStartDate,
  taskDueDate,
  onToggleSubtask,
  onSubtaskAssigneeChange,
  onSubtaskDueDateChange,
  onSubtaskPriorityChange,
  onDeleteSubtask,
  onAddComment,
  onDeleteComment,
  currentUser,
  allUsers,
  canManage,
  readOnly = false,
  isPersonalProject = false,
}: TaskSubtaskItemProps) {
  const [isCommentsExpanded, setIsCommentsExpanded] = React.useState(false);
  
  const canToggle = !readOnly && (canManage || (currentUser && subtask.assigneeUserId === currentUser.id));

  const comments = subtask.comments || [];

  return (
    <div className="border border-slate-100 rounded bg-white hover:border-slate-200 transition-all duration-150 p-2 space-y-2">
      {/* Subtask Row */}
      <div className="flex items-center justify-between group">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <input
            type="checkbox"
            checked={subtask.isCompleted}
            onChange={() => onToggleSubtask(subtask.id)}
            disabled={!canToggle}
            className={`h-4 w-4 rounded accent-[#10b981] shrink-0 ${canToggle ? "cursor-pointer" : "cursor-not-allowed opacity-60"}`}
          />
          <span
            className={`text-xs text-[#292a2e] pr-2 leading-normal break-words whitespace-normal ${
              subtask.isCompleted
                ? "line-through text-slate-400 font-medium"
                : "font-semibold"
            }`}
            title={subtask.title}
          >
            {subtask.title}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Comments Toggle Button */}
          <button
            onClick={() => setIsCommentsExpanded(!isCommentsExpanded)}
            className={`p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-[#1868db] flex items-center gap-1 transition-all cursor-pointer ${
              isCommentsExpanded ? "text-[#1868db] bg-slate-50" : ""
            }`}
            title="Bình luận công việc con"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {comments.length > 0 && (
              <span className="text-[10px] font-extrabold bg-[#1868db] text-white h-4 min-w-4 px-1 rounded-full flex items-center justify-center scale-90">
                {comments.length}
              </span>
            )}
          </button>

          {/* Subtask Due Date Picker */}
          <div className={`flex items-center gap-1 bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5 transition-all ${canManage ? "hover:border-slate-200 cursor-pointer" : "opacity-60"}`} title="Hạn chót công việc con">
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="text-slate-400"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <input
              type="date"
              disabled={!canManage}
              value={subtask.dueDate ? subtask.dueDate.substring(0, 10) : ""}
              min={taskStartDate ? taskStartDate.substring(0, 10) : undefined}
              max={taskDueDate ? taskDueDate.substring(0, 10) : undefined}
              onChange={(e) => onSubtaskDueDateChange(subtask.id, e.target.value || null)}
              className={`text-[10px] text-[#292a2e] font-semibold bg-transparent border-none focus:outline-none w-22 ${canManage ? "cursor-pointer" : "cursor-not-allowed"}`}
            />
          </div>

          {/* Subtask Priority Selector */}
          <div className="relative h-6 w-14">
            <select
              value={subtask.priority || ""}
              onChange={(e) => onSubtaskPriorityChange(subtask.id, e.target.value || null)}
              disabled={!canManage}
              className={`absolute inset-0 opacity-0 w-full h-full z-10 ${canManage ? "cursor-pointer" : "cursor-not-allowed"}`}
              title={canManage ? "Thay đổi độ ưu tiên công việc con" : "Độ ưu tiên"}
            >
              <option value="">Không có</option>
              <option value="High">Cao</option>
              <option value="Medium">Trung bình</option>
              <option value="Low">Thấp</option>
            </select>
            {/* Display Badge overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
              {(() => {
                if (!subtask.priority) {
                  return (
                    <div className="flex items-center gap-0.5 border border-dashed border-slate-350 rounded px-1.5 py-0.5 text-slate-400 group-hover:border-slate-400 group-hover:text-slate-500 transition-all text-[9px] font-bold">
                      <span>Ưu tiên</span>
                    </div>
                  );
                }
                const label = getSubtaskPriorityLabel(subtask.priority);
                const displayLabel = subtask.priority.toLowerCase() === "medium" ? "T.Bình" : label;
                const p = subtask.priority.toLowerCase();
                if (p === "high") {
                  return (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-orange-50 border border-orange-200 text-orange-700 uppercase tracking-wide">
                      {displayLabel}
                    </span>
                  );
                }
                if (p === "medium") {
                  return (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 uppercase tracking-wide">
                      {displayLabel}
                    </span>
                  );
                }
                if (p === "low") {
                  return (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-500 uppercase tracking-wide">
                      {displayLabel}
                    </span>
                  );
                }
                return null;
              })()}
            </div>
          </div>

          {/* Subtask Assignee Selector */}
          {!isPersonalProject && (
            <div className="relative h-6 w-6">
              <select
                value={subtask.assigneeUserId || ""}
                onChange={(e) => onSubtaskAssigneeChange(subtask.id, e.target.value)}
                disabled={!canManage}
                className={`absolute inset-0 opacity-0 w-full h-full z-10 ${canManage ? "cursor-pointer" : "cursor-not-allowed"}`}
                title={canManage ? "Giao việc cho thành viên" : "Bạn không có quyền giao việc"}
              >
                <option value="">Chưa giao</option>
                {allUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.displayName}
                  </option>
                ))}
              </select>
              {/* Avatar overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {subtask.assigneeUser ? (
                  <Avatar
                    src={subtask.assigneeUser.avatar}
                    alt={subtask.assigneeUser.displayName}
                    title={`Giao cho: ${subtask.assigneeUser.displayName}`}
                    className="h-5 w-5 rounded-full border border-slate-200"
                  />
                ) : (
                  <div
                    title="Chưa giao việc"
                    className="h-5 w-5 rounded-full border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-400 group-hover:border-slate-400 group-hover:text-slate-500 transition-all"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="8.5" cy="7" r="4" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Delete Button */}
          {canManage && (
            <button
              onClick={() => onDeleteSubtask(subtask.id)}
              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 p-1 rounded hover:bg-slate-100 transition-all cursor-pointer"
              title="Xóa công việc con"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Expanded Comments Section */}
      {isCommentsExpanded && (
        <TaskSubtaskComments
          subtaskId={subtask.id}
          comments={comments}
          currentUser={currentUser}
          onAddComment={onAddComment}
          onDeleteComment={onDeleteComment}
          readOnly={readOnly}
        />
      )}
    </div>
  );
}
