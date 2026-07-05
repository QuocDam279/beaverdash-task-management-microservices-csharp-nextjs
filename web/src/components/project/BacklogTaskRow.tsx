"use client";

import * as React from "react";
import type { BacklogTaskDto, SprintDto } from "@/types/api";
import { toUtcLocalDate } from "@/lib/utils";

interface BacklogTaskRowProps {
  task: BacklogTaskDto;
  onTaskClick: (task: any) => void;
  canDrag?: boolean;
  sprintStartDate?: string | null;
  sprintEndDate?: string | null;
  showStatus?: boolean;
  sprints?: SprintDto[];
  onMoveToSprint?: (sprintId: string) => void;
}

const renderPriorityBadge = (priority: string | null) => {
  if (!priority) return null;
  const p = priority.toLowerCase();
  
  if (p === "required") {
    return (
      <span className="rounded bg-red-50 dark:bg-red-950/20 px-2 py-0.5 text-[9px] font-extrabold uppercase text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/40">
        Bắt buộc
      </span>
    );
  }
  if (p === "important") {
    return (
      <span className="rounded bg-blue-50 dark:bg-blue-950/20 px-2 py-0.5 text-[9px] font-bold uppercase text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40">
        Quan trọng
      </span>
    );
  }
  if (p === "extended") {
    return (
      <span className="rounded bg-slate-50 dark:bg-slate-900/40 px-2 py-0.5 text-[9px] font-medium uppercase text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-[#353e47]">
        Mở rộng
      </span>
    );
  }
  return null;
};

const renderDueDateBadge = (dueDateStr: string | null) => {
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

  if (diffDays < 0) {
    badgeClass = "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400 font-bold";
    text = `Trễ: ${formattedDate}`;
  } else if (diffDays === 0) {
    badgeClass = "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40 text-amber-700 dark:text-amber-400 font-bold";
    text = `Hôm nay`;
  } else if (diffDays <= 2) {
    badgeClass = "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/40 text-orange-700 dark:text-orange-400 font-bold";
    text = `Còn ${diffDays} ngày`;
  }

  return (
    <span className={`flex items-center gap-1 rounded border px-1.5 py-0.5 text-[9px] uppercase tracking-wider ${badgeClass}`}>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
      </svg>
      <span>{text}</span>
    </span>
  );
};

export function BacklogTaskRow({
  task,
  onTaskClick,
  canDrag = true,
  sprintStartDate,
  sprintEndDate,
  showStatus = true,
  sprints,
  onMoveToSprint
}: BacklogTaskRowProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const { subTasksCount, completedSubTasksCount } = task;

  const sStart = toUtcLocalDate(sprintStartDate);
  const sEnd = toUtcLocalDate(sprintEndDate);
  const tStart = toUtcLocalDate(task.startDate);
  const tDue = toUtcLocalDate(task.dueDate);

  let hasMismatch = false;
  if (sStart && tStart && tStart.getTime() < sStart.getTime()) {
    hasMismatch = true;
  }
  if (sEnd && tDue && tDue.getTime() > sEnd.getTime()) {
    hasMismatch = true;
  }

  return (
    <div
      onClick={() => onTaskClick(task)}
      draggable={canDrag}
      onDragStart={(e) => {
        if (!canDrag) return;
        e.dataTransfer.setData("text/plain", task.id);
        e.dataTransfer.setData("taskId", task.id);
      }}
      className={`group flex items-center justify-between p-2.5 bg-white dark:bg-[#22272b] hover:bg-slate-50 dark:hover:bg-[#2c3338] border-b border-slate-100 dark:border-[#2c3338] transition-colors cursor-pointer select-none first:rounded-t-[7px] ${
        canDrag ? "active:cursor-grabbing" : ""
      } ${menuOpen ? "relative z-30" : ""}`}
    >
      {/* Left side: Drag handle, title, column name */}
      <div className="flex items-center gap-2 min-w-0 flex-1 mr-4">
        {/* Drag handle */}
        {canDrag && (
          <div className="text-slate-350 dark:text-slate-650 cursor-grab group-hover:text-slate-400 dark:group-hover:text-slate-500 mr-0.5">
            <svg width="12" height="16" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="9" cy="5" r="2" />
              <circle cx="15" cy="5" r="2" />
              <circle cx="9" cy="12" r="2" />
              <circle cx="15" cy="12" r="2" />
              <circle cx="9" cy="19" r="2" />
              <circle cx="15" cy="19" r="2" />
            </svg>
          </div>
        )}

        {/* Task Title */}
        <span className="text-xs font-semibold text-slate-800 dark:text-slate-300 truncate group-hover:text-[#1868db] dark:group-hover:text-[#579dff] transition-colors">
          {task.title}
        </span>

        {/* Column Badge */}
        {showStatus && (
          <span className="rounded-[3px] bg-slate-100 dark:bg-[#1d2125] text-slate-550 dark:text-slate-400 px-1.5 py-0.5 text-[9px] font-medium border border-slate-200/60 dark:border-[#353e47]">
            {task.columnName}
          </span>
        )}
      </div>

      {/* Right side: Priority, due date, subtasks progress */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Quick move to sprint dropdown */}
        {onMoveToSprint && sprints && sprints.filter(s => s.status !== "Closed").length > 0 && (
          <div className="relative md:opacity-0 md:group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:text-white dark:hover:text-[#1d2125] hover:bg-[#1868db] dark:hover:bg-[#579dff] border border-slate-250 dark:border-[#353e47] rounded bg-white dark:bg-[#22272b] cursor-pointer transition-colors shadow-sm"
              title="Đưa vào Sprint"
            >
              <span>+ Sprint</span>
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 bottom-full mb-1 w-44 max-h-48 overflow-y-auto bg-white dark:bg-[#1c2024] border border-slate-250 dark:border-[#353e47] rounded shadow-lg py-1 z-50 animate-in fade-in slide-in-from-bottom-1 duration-100 scrollbar-thin">
                  <div className="sticky top-0 bg-white dark:bg-[#1c2024] px-2.5 py-1 text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-[#2c3338] mb-1 z-10">
                    Chọn Sprint
                  </div>
                  {sprints
                    .filter((s) => s.status !== "Closed")
                    .map((sprint) => (
                      <button
                        key={sprint.id}
                        onClick={() => {
                          onMoveToSprint(sprint.id);
                          setMenuOpen(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 text-[11px] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#2c3338] hover:text-[#1868db] dark:hover:text-[#579dff] transition-colors flex items-center justify-between cursor-pointer"
                      >
                        <span className="truncate font-semibold">{sprint.name}</span>
                        {sprint.status === "Active" && (
                          <span className="text-[7px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-1 py-0.5 rounded font-extrabold uppercase scale-90">
                            Active
                          </span>
                        )}
                      </button>
                    ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Date Mismatch Warning */}
        {hasMismatch && (
          <span 
            className="flex items-center gap-1 rounded bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-amber-700 dark:text-amber-400 animate-pulse shrink-0"
            title="Thời gian công việc lệch với khoảng thời gian của Sprint"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span>Lệch ngày Sprint</span>
          </span>
        )}

        {/* Priority */}
        {renderPriorityBadge(task.priority)}

        {/* Due Date */}
        {renderDueDateBadge(task.dueDate)}

        {/* Subtasks progress */}
        {subTasksCount > 0 && (
          <div className="flex items-center gap-1.5" title="Tiến độ nhiệm vụ">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
              {completedSubTasksCount}/{subTasksCount}
            </span>
            <div className="w-12 h-1 bg-slate-100 dark:bg-[#1d2125] rounded-full overflow-hidden border border-slate-200/40 dark:border-[#353e47]/30">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${(completedSubTasksCount / subTasksCount) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
