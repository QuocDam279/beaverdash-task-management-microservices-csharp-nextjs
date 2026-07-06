"use client";

/**
 * @component TaskSubtaskItem
 * @description Quản lý hiển thị và tương tác của một nhiệm vụ (subtask) riêng lẻ,
 * bao gồm gán người thực hiện, hoàn thành nhanh, xóa subtask và hệ thống bình luận (comments) mở rộng.
 */

import * as React from "react";

import { Avatar } from "@/components/ui/Avatar";

import { SubTask } from "@/types/task";
import { User } from "@/types/auth";
import { useAlertConfirm } from "@/components/providers/AlertConfirmProvider";

interface TaskSubtaskItemProps {
  subtask: SubTask;
  taskStartDate?: string | null;
  taskDueDate?: string | null;
  onToggleSubtask: (subTaskId: string) => void;
  onSubtaskAssigneeChange: (subTaskId: string, assigneeId: string) => void;
  onSubtaskDueDateChange: (subTaskId: string, dueDate: string | null) => void;
  onDeleteSubtask: (subTaskId: string) => void;
  currentUser: User | null;
  allUsers: any[];
  canManage: boolean;
  readOnly?: boolean;
  isPersonalProject?: boolean;
  isActive?: boolean;
  onSelect?: () => void;
  parentCreatedByUserId?: string;
}

export function TaskSubtaskItem({
  subtask,
  taskStartDate,
  taskDueDate,
  onToggleSubtask,
  onSubtaskAssigneeChange,
  onSubtaskDueDateChange,
  onDeleteSubtask,
  currentUser,
  allUsers,
  canManage,
  readOnly = false,
  isPersonalProject = false,
  isActive = false,
  onSelect,
  parentCreatedByUserId,
}: TaskSubtaskItemProps) {
  const { confirm } = useAlertConfirm();
  const currentMember = allUsers.find((u) => u.id === currentUser?.id);
  const isLeader = currentMember?.role === "leader" || currentMember?.role === "Owner" || allUsers.length <= 1;
  const isTaskCreator = parentCreatedByUserId === currentUser?.id;
  const canModifyAssigneeDirectly = isLeader || isTaskCreator;
  const canToggle = !readOnly && (isLeader || isTaskCreator || (currentUser && subtask.assigneeUserId === currentUser.id));
  const comments = subtask.comments || [];

  const [localDueDate, setLocalDueDate] = React.useState(subtask.dueDate ? subtask.dueDate.substring(0, 10) : "");

  React.useEffect(() => {
    setLocalDueDate(subtask.dueDate ? subtask.dueDate.substring(0, 10) : "");
  }, [subtask.dueDate]);

  return (
    <div
      onClick={onSelect}
      className={`relative border rounded-lg transition-all duration-150 p-3 flex items-center justify-between group cursor-pointer select-none pl-4 ${
        isActive
          ? "border-slate-200 dark:border-[#353e47] bg-slate-50/40 dark:bg-[#22272b]/40 shadow-[0_1px_4px_rgba(0,0,0,0.02)]"
          : "border-slate-200/70 dark:border-[#2c3338] bg-white dark:bg-[#22272b] hover:border-slate-350 dark:hover:border-slate-500 hover:bg-slate-50/50 dark:hover:bg-[#2c3338]/80 hover:shadow-sm"
      }`}
    >
      {isActive && <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#1868db] dark:bg-[#579dff] rounded-l-lg" />}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <input
          type="checkbox"
          checked={subtask.isCompleted}
          onChange={(e) => {
            e.stopPropagation();
            onToggleSubtask(subtask.id);
          }}
          onClick={(e) => e.stopPropagation()}
          disabled={!canToggle}
          className={`h-4 w-4 rounded accent-[#10b981] shrink-0 ${
            canToggle ? "cursor-pointer" : "cursor-not-allowed opacity-60"
          }`}
        />
        <span
          className={`text-xs text-[#292a2e] dark:text-[#deebff] pr-2 leading-normal break-words whitespace-normal font-semibold ${
            subtask.isCompleted ? "line-through text-slate-400 dark:text-slate-500 font-medium" : ""
          }`}
          title={subtask.title}
        >
          {subtask.title}
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* Comments Toggle / Display Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.();
          }}
          className={`p-1 rounded hover:bg-slate-150 dark:hover:bg-[#353e47] flex items-center gap-1 transition-all cursor-pointer ${
            isActive ? "text-[#1868db] dark:text-[#579dff] font-bold" : "text-slate-400 dark:text-slate-500 hover:text-[#1868db] dark:hover:text-[#579dff]"
          }`}
          title="Xem bình luận & thảo luận"
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
            <span
              className={`text-[9px] font-extrabold h-4 min-w-4 px-1 rounded-full flex items-center justify-center scale-90 ${
                isActive ? "bg-[#1868db] dark:bg-[#579dff] text-white dark:text-[#1d2125]" : "bg-slate-100 dark:bg-[#353e47] text-slate-500 dark:text-slate-400"
              }`}
            >
              {comments.length}
            </span>
          )}
        </button>

        {/* Subtask Due Date Picker */}
        <div
          onClick={(e) => e.stopPropagation()}
          className={`flex items-center gap-1 bg-slate-50 dark:bg-[#2c3338] border border-slate-200/70 dark:border-[#353e47] rounded px-1.5 py-0.5 transition-all ${
            canModifyAssigneeDirectly ? "hover:border-slate-300 dark:hover:border-slate-500 hover:bg-slate-100/50 dark:hover:bg-[#353e47]/50 cursor-pointer" : "opacity-60"
          }`}
          title="Hạn chót nhiệm vụ"
        >
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
            disabled={!canModifyAssigneeDirectly}
            value={localDueDate}
            min={taskStartDate ? taskStartDate.substring(0, 10) : undefined}
            max={taskDueDate ? taskDueDate.substring(0, 10) : undefined}
            onChange={(e) => {
              const val = e.target.value;
              setLocalDueDate(val);
              if (val === "" || val.length === 10) {
                const normalizedProp = subtask.dueDate ? subtask.dueDate.substring(0, 10) : "";
                if (val !== normalizedProp) {
                  onSubtaskDueDateChange(subtask.id, val || null);
                }
              }
            }}
            onBlur={() => {
              const normalizedProp = subtask.dueDate ? subtask.dueDate.substring(0, 10) : "";
              if (localDueDate !== normalizedProp) {
                onSubtaskDueDateChange(subtask.id, localDueDate || null);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.currentTarget.blur();
              }
            }}
            className={`text-[10px] text-[#292a2e] dark:text-[#deebff] font-semibold bg-transparent border-none focus:outline-none w-22 ${
              canModifyAssigneeDirectly ? "cursor-pointer" : "cursor-not-allowed"
            }`}
          />
        </div>
 


        {/* Subtask Assignee Selector */}
        {!isPersonalProject && (
          <div className="relative flex items-center" onClick={(e) => e.stopPropagation()}>
            {canModifyAssigneeDirectly ? (
              <div className="relative h-6 w-6">
                <select
                  value={subtask.assigneeUserId || ""}
                  onChange={(e) => onSubtaskAssigneeChange(subtask.id, e.target.value)}
                  disabled={!canManage}
                  className={`absolute inset-0 opacity-0 w-full h-full z-10 ${
                    canManage ? "cursor-pointer" : "cursor-not-allowed"
                  }`}
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
                      className="h-5 w-5 rounded-full border border-slate-200 dark:border-[#353e47]"
                    />
                  ) : (
                    <div
                      title="Chưa giao việc"
                      className="h-5 w-5 rounded-full border-2 border-dashed border-slate-300 dark:border-[#353e47] bg-slate-50 dark:bg-[#2c3338] flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:border-slate-400 dark:group-hover:border-slate-450 group-hover:text-slate-500 dark:group-hover:text-slate-350 transition-all"
                    >
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                      >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="8.5" cy="7" r="4" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[11px] font-semibold">
                {!subtask.assigneeUserId ? (
                  <button
                    onClick={() => currentUser && onSubtaskAssigneeChange(subtask.id, currentUser.id)}
                    className="text-[#1868db] dark:text-[#579dff] hover:underline cursor-pointer border border-[#1868db]/30 dark:border-[#579dff]/30 px-2 py-0.5 rounded-[4px] bg-blue-50/30 dark:bg-blue-950/10 text-[10px]"
                    title="Nhận thực hiện nhiệm vụ này"
                  >
                    Nhận nhiệm vụ
                  </button>
                ) : subtask.assigneeUserId === currentUser?.id ? (
                  <div className="flex items-center gap-1">
                    <Avatar
                      src={subtask.assigneeUser?.avatar}
                      alt={subtask.assigneeUser?.displayName || ""}
                      className="h-5 w-5 rounded-full border border-slate-200 dark:border-[#353e47]"
                    />
                    <button
                      onClick={async () => {
                        const confirmLeave = await confirm(
                          "Bạn có chắc chắn muốn hủy nhận (rời khỏi) nhiệm vụ này?",
                          {
                            title: "Hủy nhận nhiệm vụ",
                            confirmLabel: "Rời nhiệm vụ",
                            variant: "danger",
                          }
                        );
                        if (confirmLeave) {
                          onSubtaskAssigneeChange(subtask.id, "");
                        }
                      }}
                      className="text-red-500 hover:text-red-750 hover:underline cursor-pointer text-[10px]"
                      title="Hủy nhận nhiệm vụ"
                    >
                      Rời
                    </button>
                  </div>
                ) : (
                  <Avatar
                    src={subtask.assigneeUser?.avatar}
                    alt={subtask.assigneeUser?.displayName || ""}
                    title={`Người thực hiện: ${subtask.assigneeUser?.displayName}`}
                    className="h-5 w-5 rounded-full border border-slate-200 dark:border-[#353e47] opacity-80 cursor-default select-none pointer-events-none"
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* Delete Button */}
        {canModifyAssigneeDirectly && (
          <button
            onClick={async (e) => {
              e.stopPropagation();
              const confirmDelete = await confirm(
                "Bạn có chắc chắn muốn xóa nhiệm vụ này?",
                {
                  title: "Xóa nhiệm vụ",
                  confirmLabel: "Xóa",
                  variant: "danger",
                }
              );
              if (confirmDelete) {
                onDeleteSubtask(subtask.id);
              }
            }}
            className="opacity-0 group-hover:opacity-100 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 p-1 rounded hover:bg-slate-100 dark:hover:bg-[#353e47] transition-all cursor-pointer"
            title="Xóa nhiệm vụ"
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
  );
}
