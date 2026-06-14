"use client";

import * as React from "react";
import { Avatar } from "@/components/ui/Avatar";
import { SubTask } from "@/types/task";

/**
 * @component TaskSubtaskDrawerProperties
 * @description Thành phần con của TaskSubtaskDrawer hiển thị và cập nhật các thuộc tính của nhiệm vụ.
 */

interface TaskSubtaskDrawerPropertiesProps {
  subtask: SubTask;
  taskStartDate?: string | null;
  taskDueDate?: string | null;
  onSubtaskAssigneeChange: (subTaskId: string, assigneeId: string) => void;
  onSubtaskDueDateChange: (subTaskId: string, dueDate: string | null) => void;
  assignees: any[];
  canManageSubtasks: boolean;
  readOnly?: boolean;
  isPersonalProject?: boolean;
}

export function TaskSubtaskDrawerProperties({
  subtask,
  taskStartDate,
  taskDueDate,
  onSubtaskAssigneeChange,
  onSubtaskDueDateChange,
  assignees,
  canManageSubtasks,
  readOnly = false,
  isPersonalProject = false,
}: TaskSubtaskDrawerPropertiesProps) {
  const [localDueDate, setLocalDueDate] = React.useState(subtask.dueDate ? subtask.dueDate.substring(0, 10) : "");

  React.useEffect(() => {
    setLocalDueDate(subtask.dueDate ? subtask.dueDate.substring(0, 10) : "");
  }, [subtask.dueDate]);
  return (
    <div className="bg-slate-50/50 dark:bg-[#22272b]/50 border border-slate-100 dark:border-[#2c3338] rounded-lg p-3 space-y-3.5">
      <h4 className="text-[10px] font-bold text-[#6b6e76] dark:text-slate-400 uppercase tracking-wider">
        Thuộc tính nhiệm vụ
      </h4>
      
      <div className="grid grid-cols-1 gap-3 text-xs">
        {/* Assignee */}
        {!isPersonalProject && (
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Người thực hiện:</span>
            <div className="relative h-7 w-40 flex items-center justify-end">
              <select
                value={subtask.assigneeUserId || ""}
                onChange={(e) => onSubtaskAssigneeChange(subtask.id, e.target.value)}
                disabled={!canManageSubtasks || readOnly}
                className={`absolute inset-0 opacity-0 w-full h-full z-10 ${
                  canManageSubtasks && !readOnly ? "cursor-pointer" : "cursor-not-allowed"
                }`}
              >
                <option value="">Chưa giao</option>
                {assignees.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.displayName}
                  </option>
                ))}
              </select>
              
              <div className="flex items-center gap-1.5 pointer-events-none bg-white dark:bg-[#2c3338] border border-slate-200 dark:border-[#353e47] px-2 py-0.5 rounded shadow-2xs">
                {subtask.assigneeUser ? (
                  <>
                    <Avatar
                      src={subtask.assigneeUser.avatar}
                      alt={subtask.assigneeUser.displayName}
                      className="h-4 w-4 rounded-full"
                    />
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate max-w-[100px]">
                      {subtask.assigneeUser.displayName}
                    </span>
                  </>
                ) : (
                  <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">Chưa giao</span>
                )}
                {canManageSubtasks && !readOnly && <span className="text-[9px] text-slate-400 dark:text-slate-500">▼</span>}
              </div>
            </div>
          </div>
        )}

        {/* Due Date */}
        <div className="flex items-center justify-between">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Hạn chót:</span>
          <div className="flex items-center gap-1 bg-white dark:bg-[#2c3338] border border-slate-200 dark:border-[#353e47] rounded px-2 py-0.5 shadow-2xs">
            <svg
              width="11"
              height="11"
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
              disabled={!canManageSubtasks || readOnly}
              value={localDueDate}
              min={taskStartDate ? taskStartDate.substring(0, 10) : undefined}
              max={taskDueDate ? taskDueDate.substring(0, 10) : undefined}
              onChange={(e) => setLocalDueDate(e.target.value)}
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
              className="text-[11px] text-[#292a2e] dark:text-[#deebff] font-bold bg-transparent border-none focus:outline-none w-24 cursor-pointer"
            />
          </div>
        </div>


      </div>
    </div>
  );
}
