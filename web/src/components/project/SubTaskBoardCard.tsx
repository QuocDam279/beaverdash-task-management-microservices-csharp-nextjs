"use client";

import * as React from "react";
import { Card, CardBody } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { TaskItem, BoardColumn, SubTask } from "@/types/task";
import { getTaskPriorityLabel, toUtcLocalDate } from "@/lib/utils";

interface SubTaskBoardCardProps {
  subTask: any; // SubTaskBoardDto
  parentTask: TaskItem;
  column?: BoardColumn | null;
  onTaskClick: (task: TaskItem) => void;
  currentUser: any;
  assignees: any[];
  readOnly?: boolean;
}



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
    // No warning on completed
  } else if (diffDays < 0) {
    badgeClass = "bg-red-50 dark:bg-red-950/20 border-red-200/50 dark:border-red-900/35 text-red-700 dark:text-red-400 font-bold";
    text = `Trễ: ${formattedDate}`;
  } else if (diffDays === 0) {
    badgeClass = "bg-amber-50 dark:bg-amber-950/20 border-amber-200/50 dark:border-amber-900/35 text-amber-700 dark:text-amber-400 font-bold animate-pulse";
    text = `Hôm nay`;
  } else if (diffDays <= 2) {
    badgeClass = "bg-orange-50 dark:bg-orange-950/20 border-orange-200/50 dark:border-orange-900/35 text-orange-700 dark:text-orange-400 font-bold";
    text = `Còn ${diffDays}n`;
  }

  return (
    <span className={`flex items-center gap-0.5 rounded border px-1 py-0.2 text-[9px] uppercase tracking-wider ${badgeClass}`}>
      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
      </svg>
      <span>{text}</span>
    </span>
  );
};

export function SubTaskBoardCard({
  subTask,
  parentTask,
  column,
  onTaskClick,
  currentUser,
  assignees,
  readOnly = false,
}: SubTaskBoardCardProps) {
  const canDrag = !readOnly;
  const assignee = subTask.assigneeUserId 
    ? assignees.find((a) => a.id === subTask.assigneeUserId) || {
        displayName: subTask.assigneeName,
        avatar: subTask.assigneeAvatar,
      }
    : null;

  return (
    <Card
      onClick={() => onTaskClick(parentTask)}
      draggable={canDrag}
      onDragStart={(e) => {
        if (!canDrag) {
          e.preventDefault();
          return;
        }
        e.dataTransfer.setData("subtaskid", subTask.id);
        e.dataTransfer.setData("sourcecolumnid", column?.id || "");
      }}
      className={`border border-slate-200/60 dark:border-[#353e47]/80 bg-white dark:bg-[#2c3338] hover:border-slate-300 dark:hover:border-slate-500 hover:shadow transition-all duration-150 rounded-[4px] p-2 ${
        canDrag ? "cursor-grab active:cursor-grabbing" : "cursor-default"
      }`}
    >
      <div className="space-y-1.5">
        <div className="flex items-start gap-1.5 justify-between">
          <div className="flex items-start gap-1.5">
            <span className={`mt-0.5 flex-shrink-0 flex items-center justify-center w-3.5 h-3.5 rounded-sm border ${
              subTask.isCompleted 
                ? "bg-emerald-500 border-emerald-500 text-white" 
                : "border-slate-300 dark:border-slate-650"
            }`}>
              {subTask.isCompleted && (
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              )}
            </span>
            <span className={`text-xs font-medium text-[#292a2e] dark:text-[#deebff] leading-tight line-clamp-2 ${
              subTask.isCompleted ? "line-through text-slate-400 dark:text-slate-500" : ""
            }`}>
              {subTask.title}
            </span>
          </div>
          {assignee && (
            <Avatar
              src={assignee.avatar}
              alt={assignee.displayName}
              title={`Người thực hiện: ${assignee.displayName}`}
              className="h-4.5 w-4.5 rounded-full border border-white dark:border-[#2c3338] flex-shrink-0"
            />
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1">
          {renderDueDate(subTask.dueDate, column?.isDone ?? subTask.isCompleted)}
        </div>
      </div>
    </Card>
  );
}
