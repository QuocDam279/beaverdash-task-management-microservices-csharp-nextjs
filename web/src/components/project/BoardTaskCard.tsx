"use client";

import * as React from "react";
import { Card, CardBody } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { TaskItem, BoardColumn } from "@/types/task";
import { getTaskPriorityLabel, toUtcLocalDate } from "@/lib/utils";

interface BoardTaskCardProps {
  task: TaskItem;
  column?: BoardColumn | null;
  onTaskClick: (task: TaskItem) => void;
  currentUser: any;
  assignees: any[];
  readOnly?: boolean;
  isPersonalProject?: boolean;
}

const renderPriority = (priority: string | null) => {
  if (!priority) return null;
  const p = priority.toLowerCase();
  const label = getTaskPriorityLabel(priority);
  if (p === "required") {
    return (
      <span className="flex items-center gap-0.5 rounded bg-red-50 dark:bg-red-950/20 px-1.5 py-0.5 text-[10px] font-extrabold uppercase text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/40">
        {label}
      </span>
    );
  }
  if (p === "important") {
    return (
      <span className="flex items-center gap-0.5 rounded bg-blue-50 dark:bg-blue-950/20 px-1.5 py-0.5 text-[10px] font-bold uppercase text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40">
        {label}
      </span>
    );
  }
  if (p === "extended") {
    return (
      <span className="flex items-center gap-0.5 rounded bg-slate-50 dark:bg-slate-900/40 px-1.5 py-0.5 text-[10px] font-medium uppercase text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-[#353e47]">
        {label}
      </span>
    );
  }
  return null;
};

const renderDueDate = (dueDateStr: string | null, isDone: boolean = false) => {
  if (!dueDateStr) return null;
  const dueDate = toUtcLocalDate(dueDateStr);
  if (!dueDate) return null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const formattedDate = dueDate.toLocaleDateString("vi-VN", {
    month: "numeric",
    day: "numeric",
  });

  let badgeClass = "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-[#353e47] text-slate-600 dark:text-slate-400";
  let text = `${formattedDate}`;

  if (isDone) {
    // Không hiển thị cảnh báo trễ khi công việc ở cột hoàn thành
  } else if (diffDays < 0) {
    badgeClass = "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400 font-bold";
    text = `Trễ: ${formattedDate}`;
  } else if (diffDays === 0) {
    badgeClass = "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40 text-amber-700 dark:text-amber-400 font-bold animate-pulse";
    text = `Hôm nay`;
  } else if (diffDays <= 2) {
    badgeClass = "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/40 text-orange-700 dark:text-orange-400 font-bold";
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
  readOnly = false,
  isPersonalProject = false,
}: BoardTaskCardProps) {
  const subtaskCount = (task as any).subTasksCount || 0;
  const completedSubtaskCount = (task as any).completedSubTasksCount || 0;
  const commentCount = (task as any).commentsCount || 0;

  const currentMember = assignees.find((m) => m.id === currentUser?.id);
  const isLeader = currentMember?.role === "leader" || currentMember?.role === "Owner" || assignees.length <= 1;
  const canDrag = !readOnly;

  // Lọc ra các thành viên phụ trách subtask duy nhất và không trùng với người phụ trách chính
  const subtaskAssignees = React.useMemo(() => {
    if (!task.subTasks || task.subTasks.length === 0) return [];
    const uniqueUsers: any[] = [];
    const userIds = new Set<string>();
    
    task.subTasks.forEach((st) => {
      if (st.assigneeUserId && !userIds.has(st.assigneeUserId)) {
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
        e.dataTransfer.setData("taskid", task.id);
        e.dataTransfer.setData("sourcecolumnid", column?.id || "");
      }}
      className={`border border-slate-200/80 dark:border-[#353e47] bg-white dark:bg-[#2c3338] hover:border-slate-300/80 dark:hover:border-slate-500 hover:shadow-md transition-all duration-150 rounded-[6px] ${
        canDrag ? "cursor-grab active:cursor-grabbing" : "cursor-default"
      }`}
    >
      <CardBody className="p-2.5 space-y-2">
        <div className="space-y-0.5">
          <h4 className="text-sm font-semibold text-[#292a2e] dark:text-[#deebff] leading-tight line-clamp-2">
            {task.title}
          </h4>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {renderPriority(task.priority)}
          {renderDueDate(task.dueDate, column?.isDone ?? task.isCompleted)}

          {commentCount > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-[#353e47] px-1 py-0.5 rounded">
              💬 {commentCount}
            </span>
          )}
        </div>

        {subtaskCount > 0 && (
          <div className="space-y-0.5">
            <div className="flex items-center justify-between text-[9px] font-bold text-slate-500 dark:text-slate-400">
              <span>Tiến độ nhiệm vụ</span>
              <div className="flex items-center gap-1.5">
                {(() => {
                  const unassignedCount = task.subTasks
                    ? task.subTasks.filter((st) => !st.assigneeUserId && !st.isCompleted).length
                    : 0;
                  if (unassignedCount > 0) {
                    return (
                      <span 
                        className="text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded px-1 py-[1px] text-[8px] flex items-center gap-0.5 font-bold" 
                        title={`Có ${unassignedCount} nhiệm vụ chưa được phân công`}
                      >
                        ⚠️ {unassignedCount} chưa giao
                      </span>
                    );
                  }
                  return null;
                })()}
                <span>{completedSubtaskCount}/{subtaskCount}</span>
              </div>
            </div>
            <div className="w-full h-1 bg-slate-100 dark:bg-[#22272b] rounded-full overflow-hidden border border-slate-200/50 dark:border-[#353e47]/30">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-355"
                style={{ width: `${(completedSubtaskCount / subtaskCount) * 100}%` }}
              />
            </div>
          </div>
        )}


        {!isPersonalProject && subtaskAssignees.length > 0 && (
          <div className="flex items-center justify-end pt-1.5 border-t border-slate-100 dark:border-[#353e47]">
            <div className="flex items-center gap-1.5">
              {/* Stack avatar công việc phụ (subtasks) */}
              <div className="flex -space-x-1.5 items-center mr-1" title="Những người thực hiện nhiệm vụ">
                {subtaskAssignees.map((user) => (
                  <Avatar
                    key={user.id}
                    src={user.avatar}
                    alt={user.displayName}
                    title={`Người thực hiện nhiệm vụ: ${user.displayName}`}
                    className="h-5 w-5 rounded-full border border-white dark:border-[#2c3338] hover:z-10 transition-all scale-95"
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
