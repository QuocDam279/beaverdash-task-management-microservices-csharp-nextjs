"use client";

/**
 * @component TaskSidebarProperties
 * @description Hiển thị và cập nhật các thuộc tính của công việc như Trạng thái,
 * Người thực hiện, Độ ưu tiên, Ngày bắt đầu, Hạn chót và Thông tin lịch sử chỉnh sửa.
 */

import * as React from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Avatar } from "@/components/ui/Avatar";

import { TaskItem, BoardColumn } from "@/types/task";

interface TaskSidebarPropertiesProps {
  task: TaskItem;
  columns: BoardColumn[];
  assignees: any[];
  onStatusChange: (columnId: string) => void;
  onAssigneeChange: (assigneeId: string) => void;
  onPriorityChange: (priority: string) => void;
  onDateChange: (field: "startDate" | "dueDate", value: string) => void;
  readOnly?: boolean;
}

const formatDateForInput = (dateStr: string | null) => {
  if (!dateStr) return "";
  return dateStr.substring(0, 10);
};

export function TaskSidebarProperties({
  task,
  columns,
  assignees,
  onStatusChange,
  onAssigneeChange,
  onPriorityChange,
  onDateChange,
  readOnly = false,
}: TaskSidebarPropertiesProps) {
  const { user: currentUser } = useAuth();

  const currentMember = assignees.find((m) => m.id === currentUser?.id);
  const isLeader = currentMember?.role === "leader" || currentMember?.role === "Owner" || assignees.length <= 1;
  const canModifyProperties = !readOnly;

  const [localStartDate, setLocalStartDate] = React.useState(formatDateForInput(task.startDate));
  const [localDueDate, setLocalDueDate] = React.useState(formatDateForInput(task.dueDate));

  React.useEffect(() => {
    setLocalStartDate(formatDateForInput(task.startDate));
  }, [task.startDate]);

  React.useEffect(() => {
    setLocalDueDate(formatDateForInput(task.dueDate));
  }, [task.dueDate]);

  const handleStartDateBlur = () => {
    if (localStartDate !== formatDateForInput(task.startDate)) {
      onDateChange("startDate", localStartDate);
    }
  };

  const handleDueDateBlur = () => {
    if (localDueDate !== formatDateForInput(task.dueDate)) {
      onDateChange("dueDate", localDueDate);
    }
  };

  return (
    <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-slate-100 dark:border-[#2c3338] bg-[#fafbfc] dark:bg-[#1d2125] overflow-y-auto p-6 space-y-5">
      {/* Status Field */}
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-[#6b6e76] dark:text-slate-400 uppercase tracking-wider block">
          Trạng thái (Cột)
        </label>
        <select
          value={task.boardColumnId}
          onChange={(e) => onStatusChange(e.target.value)}
          disabled={!canModifyProperties}
          className={`w-full px-2.5 py-1.5 text-xs border border-slate-200 dark:border-[#353e47] rounded-[4px] bg-white dark:bg-[#22272b] text-[#292a2e] dark:text-[#deebff] font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1868db] dark:focus-visible:ring-[#579dff] focus-visible:border-transparent transition-all ${
            !canModifyProperties ? "cursor-not-allowed opacity-75" : "cursor-pointer"
          }`}
        >
          {columns.map((col) => (
            <option key={col.id} value={col.id}>
              {col.name}
            </option>
          ))}
        </select>
      </div>



      {/* Priority Field */}
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-[#6b6e76] dark:text-slate-400 uppercase tracking-wider block">
          Độ ưu tiên
        </label>
        <select
          value={task.priority || ""}
          onChange={(e) => onPriorityChange(e.target.value)}
          disabled={!canModifyProperties}
          className={`w-full px-2.5 py-1.5 text-xs border border-slate-200 dark:border-[#353e47] rounded-[4px] bg-white dark:bg-[#22272b] text-[#292a2e] dark:text-[#deebff] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1868db] dark:focus-visible:ring-[#579dff] focus-visible:border-transparent transition-all ${
            !canModifyProperties ? "cursor-not-allowed opacity-75" : "cursor-pointer"
          }`}
        >
          <option value="">Không có</option>
          <option value="Required">Bắt buộc</option>
          <option value="Important">Quan trọng</option>
          <option value="Extended">Mở rộng</option>
        </select>
      </div>

      {/* Dates (Start / Due Date) */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-[#6b6e76] dark:text-slate-400 uppercase tracking-wider block">
            Ngày bắt đầu
          </label>
          <input
            type="date"
            value={localStartDate}
            min={task.projectStartDate ? formatDateForInput(task.projectStartDate) : undefined}
            max={localDueDate ? localDueDate : (task.projectDueDate ? formatDateForInput(task.projectDueDate) : undefined)}
            onChange={(e) => setLocalStartDate(e.target.value)}
            onBlur={handleStartDateBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.currentTarget.blur();
              }
            }}
            disabled={!canModifyProperties}
            className={`w-full px-2 py-1.5 text-[11px] border border-slate-200 dark:border-[#353e47] rounded-[4px] bg-white dark:bg-[#22272b] text-[#292a2e] dark:text-[#deebff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1868db] dark:focus-visible:ring-[#579dff] focus-visible:border-transparent transition-all ${
              !canModifyProperties ? "cursor-not-allowed opacity-75" : "cursor-pointer"
            }`}
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-[#6b6e76] dark:text-slate-400 uppercase tracking-wider block">
            Hạn chót
          </label>
          <input
            type="date"
            value={localDueDate}
            min={localStartDate ? localStartDate : (task.projectStartDate ? formatDateForInput(task.projectStartDate) : undefined)}
            max={task.projectDueDate ? formatDateForInput(task.projectDueDate) : undefined}
            onChange={(e) => setLocalDueDate(e.target.value)}
            onBlur={handleDueDateBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.currentTarget.blur();
              }
            }}
            disabled={!canModifyProperties}
            className={`w-full px-2 py-1.5 text-[11px] border border-slate-200 dark:border-[#353e47] rounded-[4px] bg-white dark:bg-[#22272b] text-[#292a2e] dark:text-[#deebff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1868db] dark:focus-visible:ring-[#579dff] focus-visible:border-transparent transition-all ${
              !canModifyProperties ? "cursor-not-allowed opacity-75" : "cursor-pointer"
            }`}
          />
        </div>
      </div>

      {/* Creation Audit Metadata */}
      <div className="pt-4 border-t border-slate-100 dark:border-[#2c3338] text-[10px] font-medium text-slate-400 dark:text-slate-500 space-y-2 leading-snug">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span>Tạo bởi:</span>
          {task.createdByUser?.displayName ? (
            <div className="flex items-center gap-1">
              <Avatar
                src={task.createdByUser.avatar}
                alt={task.createdByUser.displayName}
                className="h-4.5 w-4.5 rounded-full border border-slate-200 dark:border-[#353e47]"
              />
              <span className="font-semibold text-slate-600 dark:text-slate-300">
                {task.createdByUser.displayName}
              </span>
            </div>
          ) : (
            <span className="font-semibold text-slate-500 dark:text-slate-400">Hệ thống</span>
          )}
        </div>
        <div>
          Ngày tạo:{" "}
          <span>
            {new Date(task.createdAt).toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </span>
        </div>
        <div>
          Cập nhật cuối:{" "}
          <span>
            {new Date(task.updatedAt).toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>
    </div>
  );
}
