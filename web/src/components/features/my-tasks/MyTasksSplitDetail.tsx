"use client";

/**
 * @component MyTasksSplitDetail
 * @description Hiển thị chi tiết công việc được chọn bên cột phải trong giao diện Split-Screen.
 */

import * as React from "react";
import {
  TaskDetailTitle,
  TaskDetailDescription,
  TaskSubtasks,
  TaskSidebarProperties,
} from "@/components/project";

interface MyTasksSplitDetailProps {
  selectedTask: any;
  columns: any[];
  assignees: any[];
  currentUser: any;
  onClose: () => void;
  onUpdateDetails: (updates: any) => void;
  onStatusChange: (columnId: string) => void;
  onToggleSubtask: (subTaskId: string) => void;
  onSubtaskAssigneeChange: (subTaskId: string, assigneeId: string) => void;
  onSubtaskDueDateChange: (subTaskId: string, dueDate: string | null) => void;
  onSubtaskPriorityChange: (subTaskId: string, priority: string | null) => void;
  onAddSubtask: (title: string, priority: string | null) => void;
  onDeleteSubtask: (subTaskId: string) => void;
  onAddSubtaskComment: (subTaskId: string, content: string) => void;
  onDeleteSubtaskComment: (subTaskId: string, commentId: string) => void;
  onDeleteTask: () => void;
}

export function MyTasksSplitDetail({
  selectedTask,
  columns,
  assignees,
  currentUser,
  onClose,
  onUpdateDetails,
  onStatusChange,
  onToggleSubtask,
  onSubtaskAssigneeChange,
  onSubtaskDueDateChange,
  onSubtaskPriorityChange,
  onAddSubtask,
  onDeleteSubtask,
  onAddSubtaskComment,
  onDeleteSubtaskComment,
  onDeleteTask,
}: MyTasksSplitDetailProps) {
  if (!selectedTask) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/20 select-none font-sans">
        <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3.5 border border-slate-200/50 shadow-2xs">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        </div>
        <h3 className="text-xs font-bold text-[#292a2e]">Chưa chọn công việc</h3>
        <p className="text-[11px] text-slate-400 max-w-xs mt-1 leading-normal">
          Nhấp vào một công việc ở danh sách bên trái để xem, cập nhật thuộc tính và quản lý các công việc con nhanh chóng.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-h-0 bg-white border-l border-slate-200 font-sans">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-slate-150 px-4 py-2.5 bg-slate-50/60 shrink-0 select-none">
        <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
          Chi tiết công việc
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onDeleteTask}
            className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
            title="Xóa công việc"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
            title="Đóng chi tiết"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      {/* Main split details content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-chat-scrollbar">
          <TaskDetailTitle
            title={selectedTask.title}
            onUpdateTitle={(title) => onUpdateDetails({ title })}
          />
          <TaskDetailDescription
            description={selectedTask.description}
            onUpdateDescription={(description) =>
              onUpdateDetails({ description: description || "" })
            }
          />
          <TaskSubtasks
            subtasks={selectedTask.subTasks || []}
            taskStartDate={selectedTask.startDate}
            taskDueDate={selectedTask.dueDate}
            onToggleSubtask={onToggleSubtask}
            onSubtaskAssigneeChange={onSubtaskAssigneeChange}
            onSubtaskDueDateChange={onSubtaskDueDateChange}
            onSubtaskPriorityChange={onSubtaskPriorityChange}
            onAddSubtask={onAddSubtask}
            onDeleteSubtask={onDeleteSubtask}
            onAddSubtaskComment={onAddSubtaskComment}
            onDeleteSubtaskComment={onDeleteSubtaskComment}
            currentUser={currentUser}
            assignees={assignees}
            canManageSubtasks={true}
            isPersonalProject={selectedTask.teamId === null || !selectedTask.teamId}
          />
        </div>

        <TaskSidebarProperties
          task={selectedTask}
          columns={columns}
          onStatusChange={onStatusChange}
          onAssigneeChange={(assigneeId) =>
            onUpdateDetails({
              assigneeUserId: assigneeId || "00000000-0000-0000-0000-000000000000",
            })
          }
          onPriorityChange={(priority) => onUpdateDetails({ priority })}
          onDateChange={(field, value) =>
            onUpdateDetails({
              [field]: value ? new Date(value).toISOString() : null,
            })
          }
          assignees={assignees}
        />
      </div>
    </div>
  );
}
