"use client";

import * as React from "react";
import { Card, CardBody } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { TaskItem, BoardColumn } from "@/types/task";

interface BoardTaskCardProps {
  task: TaskItem;
  column: BoardColumn;
  onTaskClick: (task: TaskItem) => void;
  currentUser: any;
  assignees: any[];
}

const renderPriority = (priority: string | null) => {
  if (!priority) return null;
  switch (priority) {
    case "Critical":
      return (
        <span className="flex items-center gap-0.5 rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-extrabold uppercase text-red-700 border border-red-200">
          Crit
        </span>
      );
    case "High":
      return (
        <span className="flex items-center gap-0.5 rounded bg-orange-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-orange-700 border border-orange-200">
          High
        </span>
      );
    case "Medium":
      return (
        <span className="flex items-center gap-0.5 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-blue-700 border border-blue-200">
          Medium
        </span>
      );
    case "Low":
    default:
      return (
        <span className="flex items-center gap-0.5 rounded bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium uppercase text-slate-600 border border-slate-200">
          Low
        </span>
      );
  }
};

const renderDueDate = (dueDateStr: string | null) => {
  if (!dueDateStr) return null;
  const dueDate = new Date(dueDateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const formattedDate = dueDate.toLocaleDateString("vi-VN", {
    month: "numeric",
    day: "numeric",
  });

  let badgeClass = "bg-slate-50 border-slate-200 text-slate-600";
  let text = `${formattedDate}`;

  if (diffDays < 0) {
    badgeClass = "bg-red-50 border-red-200 text-red-700 font-bold";
    text = `Trễ: ${formattedDate}`;
  } else if (diffDays === 0) {
    badgeClass = "bg-amber-50 border-amber-200 text-amber-700 font-bold animate-pulse";
    text = `Hôm nay`;
  } else if (diffDays <= 2) {
    badgeClass = "bg-orange-50 border-orange-200 text-orange-700 font-bold";
    text = `Còn ${diffDays} ngày`;
  }

  return (
    <span className={`flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-wider ${badgeClass}`}>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
      </svg>
      <span>{text}</span>
    </span>
  );
};

/**
 * BoardTaskCard — Thẻ hiển thị thông tin công việc trên bảng Kanban.
 * Tách biệt theo nguyên tắc Single Responsibility để giữ BoardColumnView ngắn gọn.
 */
export function BoardTaskCard({
  task,
  column,
  onTaskClick,
  currentUser,
  assignees,
}: BoardTaskCardProps) {
  const taskCode = `QLDK-${task.id.substring(0, 4).toUpperCase()}`;
  const subtaskCount = (task as any).subTasksCount || 0;
  const completedSubtaskCount = (task as any).completedSubTasksCount || 0;
  const commentCount = (task as any).commentsCount || 0;

  const currentMember = assignees.find((m) => m.id === currentUser?.id);
  const isLeader = currentMember?.role === "leader" || currentMember?.role === "Owner" || assignees.length <= 1;
  const isAssignee = task.assigneeUserId === currentUser?.id;
  const canDrag = isLeader || isAssignee;

  // Lọc ra các thành viên phụ trách subtask duy nhất và không trùng với người phụ trách chính
  const subtaskAssignees = React.useMemo(() => {
    if (!task.subTasks || task.subTasks.length === 0) return [];
    const uniqueUsers: any[] = [];
    const userIds = new Set<string>();
    
    task.subTasks.forEach((st) => {
      if (st.assigneeUserId && st.assigneeUserId !== task.assigneeUserId && !userIds.has(st.assigneeUserId)) {
        userIds.add(st.assigneeUserId);
        const user = st.assigneeUser || assignees.find((a) => a.id === st.assigneeUserId);
        if (user) {
          uniqueUsers.push(user);
        }
      }
    });
    return uniqueUsers;
  }, [task.subTasks, task.assigneeUserId, assignees]);

  return (
    <Card
      onClick={() => onTaskClick(task)}
      draggable={canDrag}
      onDragStart={(e) => {
        if (!canDrag) {
          e.preventDefault();
          return;
        }
        e.dataTransfer.setData("taskId", task.id);
        e.dataTransfer.setData("sourceColumnId", column.id);
      }}
      className={`border border-slate-200/80 bg-white hover:border-slate-300/80 hover:shadow-md transition-all duration-150 rounded-[6px] ${
        canDrag ? "cursor-grab active:cursor-grabbing" : "cursor-default"
      }`}
    >
      <CardBody className="p-2.5 space-y-2">
        <div className="space-y-0.5">
          <h4 className="text-sm font-semibold text-[#292a2e] leading-tight line-clamp-2">
            {task.title}
          </h4>
          {task.description && (
            <p className="text-xs text-slate-500 line-clamp-1 leading-normal">
              {task.description}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {renderPriority(task.priority)}
          {renderDueDate(task.dueDate)}

          {commentCount > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-1 py-0.5 rounded">
              💬 {commentCount}
            </span>
          )}
        </div>

        {subtaskCount > 0 && (
          <div className="space-y-0.5">
            <div className="flex items-center justify-between text-[9px] font-bold text-slate-500">
              <span>Tiến độ công việc con</span>
              <span>{completedSubtaskCount}/{subtaskCount}</span>
            </div>
            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-355"
                style={{ width: `${(completedSubtaskCount / subtaskCount) * 100}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-1.5 border-t border-slate-100">
          <span className="text-[10px] font-bold text-slate-400">
            {taskCode}
          </span>
          <div className="flex items-center gap-1.5">
            {/* Stack avatar công việc phụ (subtasks) */}
            {subtaskAssignees.length > 0 && (
              <div className="flex -space-x-1.5 items-center mr-1" title="Những người thực hiện công việc con">
                {subtaskAssignees.map((user) => (
                  <Avatar
                    key={user.id}
                    src={user.avatar}
                    alt={user.displayName}
                    title={`Người thực hiện công việc con: ${user.displayName}`}
                    className="h-5 w-5 rounded-full border border-white hover:z-10 transition-all scale-95"
                  />
                ))}
              </div>
            )}

            {/* Người phụ trách chính */}
            {task.assigneeUser ? (
              <div className="flex items-center gap-1.5 border-l border-slate-100 pl-1.5">
                <span className="text-[10px] font-semibold text-slate-500 max-w-[80px] truncate">
                  {task.assigneeUser.displayName}
                </span>
                <Avatar
                  src={task.assigneeUser.avatar}
                  alt={task.assigneeUser.displayName}
                  title={`Người phụ trách chính: ${task.assigneeUser.displayName}`}
                  className="h-6 w-6 rounded-full border border-slate-200"
                />
              </div>
            ) : (
              <span className="text-[10px] font-medium italic text-slate-400 pl-1.5">
                Chưa giao việc
              </span>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
