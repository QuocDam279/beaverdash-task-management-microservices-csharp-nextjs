"use client";

import * as React from "react";
import { TaskSubtaskComments } from "./TaskSubtaskComments";
import { TaskSubtaskDrawerProperties } from "./TaskSubtaskDrawerProperties";
import { TaskSubtaskDrawerTitle } from "./TaskSubtaskDrawerTitle";
import { SubTask } from "@/types/task";
import { User } from "@/types/auth";
import { useAlertConfirm } from "@/components/providers/AlertConfirmProvider";

/**
 * @component TaskSubtaskDrawer
 * @description Bảng trượt hiển thị chi tiết công việc con và thảo luận bình luận,
 * xuất hiện từ cạnh phải của modal chi tiết công việc chính.
 */

interface TaskSubtaskDrawerProps {
  isOpen: boolean;
  subtask: SubTask | null;
  onClose: () => void;
  taskStartDate?: string | null;
  taskDueDate?: string | null;
  onToggleSubtask: (subTaskId: string) => void;
  onSubtaskTitleChange: (subTaskId: string, title: string) => void;
  onSubtaskAssigneeChange: (subTaskId: string, assigneeId: string) => void;
  onSubtaskDueDateChange: (subTaskId: string, dueDate: string | null) => void;
  onSubtaskPriorityChange: (subTaskId: string, priority: string | null) => void;
  onDeleteSubtask: (subTaskId: string) => void;
  onAddSubtaskComment: (subTaskId: string, content: string, attachments?: any[]) => void;
  onDeleteSubtaskComment: (subTaskId: string, commentId: string) => void;
  currentUser: User | null;
  assignees: any[];
  canManageSubtasks: boolean;
  readOnly?: boolean;
  isPersonalProject?: boolean;
}

export function TaskSubtaskDrawer({
  isOpen,
  subtask,
  onClose,
  taskStartDate,
  taskDueDate,
  onToggleSubtask,
  onSubtaskTitleChange,
  onSubtaskAssigneeChange,
  onSubtaskDueDateChange,
  onSubtaskPriorityChange,
  onDeleteSubtask,
  onAddSubtaskComment,
  onDeleteSubtaskComment,
  currentUser,
  assignees,
  canManageSubtasks,
  readOnly = false,
  isPersonalProject = false,
}: TaskSubtaskDrawerProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { confirm } = useAlertConfirm();

  if (!subtask) return null;

  const canToggle = !readOnly && (canManageSubtasks || (currentUser && subtask.assigneeUserId === currentUser.id));
  const comments = subtask.comments || [];

  return (
    <>
      {/* Backdrop for closing drawer when clicking outside */}
      {isOpen && (
        <div
          onClick={onClose}
          className="absolute inset-0 bg-[#091e42]/20 dark:bg-black/40 backdrop-blur-[1px] z-20 animate-in fade-in duration-200"
        />
      )}

      {/* Drawer Container */}
      <div
        ref={containerRef}
        className={`absolute top-0 right-0 h-full w-full sm:w-[420px] bg-white dark:bg-[#161a1d] border-l border-slate-200 dark:border-[#2c3338] shadow-2xl z-30 flex flex-col transition-transform duration-300 ease-in-out transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-[#2c3338] flex-shrink-0 bg-slate-50/50 dark:bg-[#1d2125]">
          <button
            onClick={onClose}
            className="flex items-center gap-1 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-[#1868db] dark:hover:text-[#579dff] transition-colors cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
            Quay lại công việc chính
          </button>
          
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-[#2c3338] text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-350 transition-all cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        {/* Body Container */}
        <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden min-h-0">
          
          {/* Subtask Title & Status */}
          <div className="space-y-2 flex-shrink-0">
            <div className="flex items-start gap-3 group">
              <input
                type="checkbox"
                checked={subtask.isCompleted}
                onChange={() => onToggleSubtask(subtask.id)}
                disabled={!canToggle}
                className={`h-5 w-5 mt-0.5 rounded accent-[#10b981] shrink-0 ${
                  canToggle ? "cursor-pointer" : "cursor-not-allowed opacity-60"
                }`}
              />
              <div className="flex-1 min-w-0">
                <TaskSubtaskDrawerTitle
                  title={subtask.title}
                  isCompleted={subtask.isCompleted}
                  onUpdateTitle={(title) => onSubtaskTitleChange(subtask.id, title)}
                  readOnly={readOnly || !canManageSubtasks}
                />
              </div>
              
              {canManageSubtasks && !readOnly && (
                <button
                  onClick={async () => {
                    const confirmDelete = await confirm(
                      "Bạn có chắc chắn muốn xóa công việc con này?",
                      {
                        title: "Xóa công việc con",
                        confirmLabel: "Xóa",
                        variant: "danger",
                      }
                    );
                    if (confirmDelete) {
                      onDeleteSubtask(subtask.id);
                      onClose();
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 p-1 rounded hover:bg-slate-100 dark:hover:bg-[#2c3338] transition-all cursor-pointer shrink-0"
                  title="Xóa công việc con"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                </button>
              )}
            </div>
          </div>

          {/* Properties Area Component */}
          <div className="flex-shrink-0">
            <TaskSubtaskDrawerProperties
              subtask={subtask}
              taskStartDate={taskStartDate}
              taskDueDate={taskDueDate}
              onSubtaskAssigneeChange={onSubtaskAssigneeChange}
              onSubtaskDueDateChange={onSubtaskDueDateChange}
              onSubtaskPriorityChange={onSubtaskPriorityChange}
              assignees={assignees}
              canManageSubtasks={canManageSubtasks}
              readOnly={readOnly}
              isPersonalProject={isPersonalProject}
            />
          </div>

          {/* Comments Section */}
          <div className="pt-2 flex-1 flex flex-col min-h-0">
            <div className="flex items-center gap-1.5 px-1 pb-2 flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-500"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
              <h4 className="text-[11px] font-bold text-[#6b6e76] dark:text-slate-400 uppercase tracking-wider">
                Thảo luận ({comments.length})
              </h4>
            </div>

            <TaskSubtaskComments
              subtaskId={subtask.id}
              comments={comments}
              currentUser={currentUser}
              onAddComment={onAddSubtaskComment}
              onDeleteComment={onDeleteSubtaskComment}
              readOnly={readOnly}
            />
          </div>

        </div>
      </div>
    </>
  );
}
