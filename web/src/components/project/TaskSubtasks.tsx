"use client";

/**
 * @component TaskSubtasks
 * @description Quản lý danh sách các công việc con (subtasks), bao gồm hiển thị tiến độ hoàn thành,
 * cho phép tích chọn hoàn thành nhanh, thêm mới, xóa công việc con và bình luận trong công việc con.
 */

import * as React from "react";

import { TaskSubtaskItem } from "./TaskSubtaskItem";

import { SubTask } from "@/types/task";
import { User } from "@/types/auth";

interface TaskSubtasksProps {
  subtasks: SubTask[];
  taskStartDate?: string | null;
  taskDueDate?: string | null;
  onToggleSubtask: (subTaskId: string) => void;
  onSubtaskAssigneeChange: (subTaskId: string, assigneeId: string) => void;
  onSubtaskDueDateChange: (subTaskId: string, dueDate: string | null) => void;
  onAddSubtask: (title: string) => void;
  onDeleteSubtask: (subTaskId: string) => void;
  onAddSubtaskComment: (
    subTaskId: string,
    content: string,
    attachments?: {
      fileName: string;
      fileUrl: string;
      fileType: string;
      fileSizeBytes: number | null;
    }[]
  ) => void;
  onDeleteSubtaskComment: (subTaskId: string, commentId: string) => void;
  currentUser: User;
  assignees: any[];
  canManageSubtasks: boolean;
}

export function TaskSubtasks({
  subtasks,
  taskStartDate,
  taskDueDate,
  onToggleSubtask,
  onSubtaskAssigneeChange,
  onSubtaskDueDateChange,
  onAddSubtask,
  onDeleteSubtask,
  onAddSubtaskComment,
  onDeleteSubtaskComment,
  currentUser,
  assignees,
  canManageSubtasks,
}: TaskSubtasksProps) {
  const [newSubtaskTitle, setNewSubtaskTitle] = React.useState("");

  const completedCount = subtasks.filter((st) => st.isCompleted).length;
  const totalCount = subtasks.length;
  const progressPercentage =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    onAddSubtask(newSubtaskTitle.trim());
    setNewSubtaskTitle("");
  };

  return (
    <div className="space-y-3 pt-2 border-t border-slate-100">
      {/* Title & Count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="text-slate-500"
          >
            <path d="m9 11-4 4 4 4m6-14 4 4-4 4" />
          </svg>
          <label className="text-[11px] font-bold text-[#6b6e76] uppercase tracking-wider block">
            Công việc con (Subtasks)
          </label>
        </div>
        {totalCount > 0 && (
          <span className="text-[11px] font-bold text-[#505258] bg-slate-100 px-2 py-0.5 rounded-full">
            {completedCount}/{totalCount} hoàn thành ({progressPercentage}%)
          </span>
        )}
      </div>

      {/* Progress Bar */}
      {totalCount > 0 && (
        <div className="w-full bg-slate-150 h-1.5 rounded-full overflow-hidden border border-slate-200/20">
          <div
            style={{ width: `${progressPercentage}%` }}
            className="bg-[#10b981] h-full rounded-full transition-all duration-300"
          />
        </div>
      )}

      {/* Subtasks List */}
      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {subtasks.length > 0 ? (
          subtasks.map((st) => (
            <TaskSubtaskItem
              key={st.id}
              subtask={st}
              taskStartDate={taskStartDate}
              taskDueDate={taskDueDate}
              onToggleSubtask={onToggleSubtask}
              onSubtaskAssigneeChange={onSubtaskAssigneeChange}
              onSubtaskDueDateChange={onSubtaskDueDateChange}
              onDeleteSubtask={onDeleteSubtask}
              onAddComment={onAddSubtaskComment}
              onDeleteComment={onDeleteSubtaskComment}
              currentUser={currentUser}
              allUsers={assignees}
              canManage={canManageSubtasks}
            />
          ))
        ) : (
          <div className="text-center py-6 border-2 border-dashed border-slate-200/50 rounded-lg text-slate-400 text-xs font-medium">
            {canManageSubtasks ? "Chưa có công việc con nào. Nhập tiêu đề bên dưới để tạo!" : "Chưa có công việc con nào."}
          </div>
        )}
      </div>

      {/* Add Input */}
      {canManageSubtasks && (
        <form onSubmit={handleSubmit} className="flex gap-2 pt-1.5">
          <input
            type="text"
            placeholder="Thêm công việc con..."
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-[4px] bg-white text-[#292a2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1868db] focus-visible:border-transparent transition-all placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={!newSubtaskTitle.trim()}
            className="bg-[#1868db] hover:bg-[#0052cc] disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold px-3 py-1.5 rounded-[4px] transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Thêm
          </button>
        </form>
      )}
    </div>
  );
}
