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
}

export function TaskSidebarProperties({
  task,
  columns,
  assignees,
  onStatusChange,
  onAssigneeChange,
  onPriorityChange,
  onDateChange,
}: TaskSidebarPropertiesProps) {
  const { user: currentUser } = useAuth();

  const currentMember = assignees.find((m) => m.id === currentUser?.id);
  const isLeader = currentMember?.role === "leader" || currentMember?.role === "Owner" || assignees.length <= 1;
  const isAssignee = task.assigneeUserId === currentUser?.id;
  const isUnassigned = !task.assigneeUserId;
  const isAssigneeDropdownDisabled = !isLeader && !isUnassigned && !isAssignee;
  const canModifyProperties = isLeader || isAssignee;

  const formatDateForInput = (dateStr: string | null) => {
    if (!dateStr) return "";
    return dateStr.substring(0, 10);
  };

  return (
    <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-slate-100 bg-[#fafbfc] overflow-y-auto p-6 space-y-5">
      {/* Status Field */}
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-[#6b6e76] uppercase tracking-wider block">
          Trạng thái (Cột)
        </label>
        <select
          value={task.boardColumnId}
          onChange={(e) => onStatusChange(e.target.value)}
          disabled={!canModifyProperties}
          className={`w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-[4px] bg-white text-[#292a2e] font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1868db] focus-visible:border-transparent transition-all ${
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

      {/* Assignee Field */}
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-[#6b6e76] uppercase tracking-wider block">
          Người thực hiện
        </label>
        <div className="relative">
          <select
            value={task.assigneeUserId || ""}
            onChange={(e) => onAssigneeChange(e.target.value)}
            disabled={isAssigneeDropdownDisabled}
            className={`w-full pl-8 pr-2.5 py-1.5 text-xs border border-slate-200 rounded-[4px] bg-white text-[#292a2e] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1868db] focus-visible:border-transparent transition-all appearance-none ${isAssigneeDropdownDisabled ? "cursor-not-allowed opacity-75" : "cursor-pointer"}`}
          >
            <option value="">Chưa phân công</option>
            {assignees.map((user) => {
              const isSelf = user.id === currentUser?.id;
              if (!isLeader && !isSelf) {
                return null;
              }
              return (
                <option key={user.id} value={user.id}>
                  {user.displayName}
                </option>
              );
            })}
          </select>
          {/* Custom Avatar Indicator on dropdown */}
          <div className="absolute left-2 top-2 h-4.5 w-4.5 rounded-full overflow-hidden pointer-events-none flex items-center justify-center">
            {task.assigneeUser ? (
              <Avatar
                src={task.assigneeUser.avatar}
                alt={task.assigneeUser.displayName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-slate-200 rounded-full flex items-center justify-center text-[8px] font-bold text-slate-500">
                ?
              </div>
            )}
          </div>
          <div className="pointer-events-none absolute right-2.5 top-2.5 flex items-center text-slate-400">
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>
      </div>

      {/* Priority Field */}
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-[#6b6e76] uppercase tracking-wider block">
          Độ ưu tiên
        </label>
        <select
          value={task.priority || "Low"}
          onChange={(e) => onPriorityChange(e.target.value)}
          disabled={!canModifyProperties}
          className={`w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-[4px] bg-white text-[#292a2e] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1868db] focus-visible:border-transparent transition-all ${
            !canModifyProperties ? "cursor-not-allowed opacity-75" : "cursor-pointer"
          }`}
        >
          <option value="Low">Thấp (Low)</option>
          <option value="Medium">Trung bình (Medium)</option>
          <option value="High">Cao (High)</option>
          <option value="Critical">Khẩn cấp (Critical)</option>
        </select>
      </div>

      {/* Dates (Start / Due Date) */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-[#6b6e76] uppercase tracking-wider block">
            Ngày bắt đầu
          </label>
          <input
            type="date"
            value={formatDateForInput(task.startDate)}
            min={task.projectStartDate ? formatDateForInput(task.projectStartDate) : undefined}
            max={task.dueDate ? formatDateForInput(task.dueDate) : (task.projectDueDate ? formatDateForInput(task.projectDueDate) : undefined)}
            onChange={(e) => onDateChange("startDate", e.target.value)}
            disabled={!canModifyProperties}
            className={`w-full px-2 py-1.5 text-[11px] border border-slate-200 rounded-[4px] bg-white text-[#292a2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1868db] focus-visible:border-transparent transition-all ${
              !canModifyProperties ? "cursor-not-allowed opacity-75" : "cursor-pointer"
            }`}
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-[#6b6e76] uppercase tracking-wider block">
            Hạn chót
          </label>
          <input
            type="date"
            value={formatDateForInput(task.dueDate)}
            min={task.startDate ? formatDateForInput(task.startDate) : (task.projectStartDate ? formatDateForInput(task.projectStartDate) : undefined)}
            max={task.projectDueDate ? formatDateForInput(task.projectDueDate) : undefined}
            onChange={(e) => onDateChange("dueDate", e.target.value)}
            disabled={!canModifyProperties}
            className={`w-full px-2 py-1.5 text-[11px] border border-slate-200 rounded-[4px] bg-white text-[#292a2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1868db] focus-visible:border-transparent transition-all ${
              !canModifyProperties ? "cursor-not-allowed opacity-75" : "cursor-pointer"
            }`}
          />
        </div>
      </div>

      {/* Creation Audit Metadata */}
      <div className="pt-4 border-t border-slate-100 text-[10px] font-medium text-slate-400 space-y-1 leading-snug">
        <div>
          Tạo bởi:{" "}
          <span className="font-semibold text-slate-500">
            {task.createdByUser?.displayName || "Hệ thống"}
          </span>
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
