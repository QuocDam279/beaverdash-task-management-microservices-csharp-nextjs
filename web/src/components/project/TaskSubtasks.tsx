"use client";

/**
 * @component TaskSubtasks
 * @description Quản lý danh sách các nhiệm vụ (subtasks), bao gồm hiển thị tiến độ hoàn thành,
 * cho phép tích chọn hoàn thành nhanh, thêm mới, xóa nhiệm vụ và bình luận trong nhiệm vụ.
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
  currentUser: User | null;
  assignees: any[];
  canManageSubtasks: boolean;
  readOnly?: boolean;
  isPersonalProject?: boolean;
  activeSubtaskId?: string | null;
  onSelectSubtask?: (subTaskId: string | null) => void;
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
  currentUser,
  assignees,
  canManageSubtasks,
  readOnly = false,
  isPersonalProject = false,
  activeSubtaskId = null,
  onSelectSubtask,
}: TaskSubtasksProps) {
  const [newSubtaskTitle, setNewSubtaskTitle] = React.useState("");

  const sortedSubtasks = React.useMemo(() => {
    return [...subtasks].sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });
  }, [subtasks]);

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
    <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-[#2c3338] flex-1 flex flex-col min-h-0">
      {/* Title & Count */}
      <div className="flex items-center justify-between flex-shrink-0">
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
          <label className="text-[11px] font-bold text-[#6b6e76] dark:text-slate-400 uppercase tracking-wider block">
            Nhiệm vụ
          </label>
        </div>
        {totalCount > 0 && (
          <span className="text-[11px] font-bold text-[#505258] dark:text-slate-355 bg-slate-100 dark:bg-[#22272b] px-2 py-0.5 rounded-full">
            {completedCount}/{totalCount} hoàn thành ({progressPercentage}%)
          </span>
        )}
      </div>

      {/* Progress Bar */}
      {totalCount > 0 && (
        <div className="w-full bg-slate-150 dark:bg-[#2c3338] h-1.5 rounded-full overflow-hidden border border-slate-200/20 dark:border-[#353e47]/30 flex-shrink-0">
          <div
            style={{ width: `${progressPercentage}%` }}
            className="bg-[#10b981] h-full rounded-full transition-all duration-300"
          />
        </div>
      )}

      {/* Add Input */}
      {canManageSubtasks && !readOnly && (
        <form onSubmit={handleSubmit} className="flex gap-2 pt-1.5 flex-shrink-0">
          <input
            type="text"
            placeholder="Thêm nhiệm vụ..."
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            className="flex-1 px-3 py-1.5 text-xs border border-slate-200 dark:border-[#353e47] rounded-[4px] bg-white dark:bg-[#22272b] text-[#292a2e] dark:text-[#deebff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1868db] dark:focus-visible:ring-[#579dff] focus-visible:border-transparent transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />

          <button
            type="submit"
            disabled={!newSubtaskTitle.trim()}
            className="bg-[#1868db] dark:bg-[#579dff] hover:bg-[#0052cc] dark:hover:bg-blue-400 disabled:bg-slate-200 dark:disabled:bg-[#2c3338] disabled:text-slate-400 dark:disabled:text-slate-600 text-white dark:text-[#1d2125] text-xs font-bold px-3 py-1.5 rounded-[4px] transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
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

      {/* Subtasks List */}
      <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin space-y-2.5 min-h-0">
        {sortedSubtasks.length > 0 ? (
          sortedSubtasks.map((st) => (
            <TaskSubtaskItem
              key={st.id}
              subtask={st}
              taskStartDate={taskStartDate}
              taskDueDate={taskDueDate}
              onToggleSubtask={onToggleSubtask}
              onSubtaskAssigneeChange={onSubtaskAssigneeChange}
              onSubtaskDueDateChange={onSubtaskDueDateChange}
              onDeleteSubtask={onDeleteSubtask}
              currentUser={currentUser}
              allUsers={assignees}
              canManage={canManageSubtasks && !readOnly}
              readOnly={readOnly}
              isPersonalProject={isPersonalProject}
              isActive={st.id === activeSubtaskId}
              onSelect={() => onSelectSubtask?.(st.id === activeSubtaskId ? null : st.id)}
            />
          ))
        ) : (
          <div className="text-center py-6 border-2 border-dashed border-slate-200/50 dark:border-[#353e47]/50 rounded-lg text-slate-400 dark:text-slate-500 text-xs font-medium animate-in fade-in duration-200 flex-shrink-0">
            {canManageSubtasks ? "Chưa có nhiệm vụ nào. Nhập tiêu đề ở trên để tạo!" : "Chưa có nhiệm vụ nào."}
          </div>
        )}
      </div>
    </div>
  );
}
