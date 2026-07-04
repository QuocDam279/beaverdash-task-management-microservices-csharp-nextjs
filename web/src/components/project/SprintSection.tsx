"use client";

import * as React from "react";
import type { SprintDto } from "@/types/api";
import { BacklogTaskRow } from "./BacklogTaskRow";

interface SprintSectionProps {
  sprint: SprintDto;
  onStartSprint: (sprintId: string) => void;
  onCloseSprint: (sprintId: string) => void;
  onEditSprint: (sprint: SprintDto) => void;
  onDeleteSprint: (sprintId: string) => void;
  onTaskClick: (task: any) => void;
  onMoveTasks: (taskIds: string[], sprintId: string | null) => void;
  onCreateTaskClick: (sprintId: string) => void;
  isLeaderOrOwner?: boolean;
}

const formatDateRange = (start: string | null, end: string | null) => {
  if (!start && !end) return "Chưa đặt thời gian";
  const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const startDateStr = start ? new Date(start).toLocaleDateString("vi-VN", options) : "Bắt đầu";
  const endDateStr = end ? new Date(end).toLocaleDateString("vi-VN", options) : "Kết thúc";
  return `${startDateStr} - ${endDateStr}`;
};

export function SprintSection({
  sprint,
  onStartSprint,
  onCloseSprint,
  onEditSprint,
  onDeleteSprint,
  onTaskClick,
  onMoveTasks,
  onCreateTaskClick,
  isLeaderOrOwner = false
}: SprintSectionProps) {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const [isDragOver, setIsDragOver] = React.useState(false);

  const totalTasks = sprint.taskCount;
  const completedTasks = sprint.completedTaskCount;
  const incompleteTasks = totalTasks - completedTasks;
  const progressPercent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData("taskId");
    if (taskId) {
      onMoveTasks([taskId], sprint.id);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`rounded-lg border shadow-xs overflow-hidden transition-all duration-200 ${
        isDragOver
          ? "border-blue-500 bg-blue-50/10 dark:bg-blue-950/5 ring-2 ring-blue-500/10"
          : "border-slate-200 dark:border-[#2c3338] bg-white dark:bg-[#1d2125]"
      }`}
    >
      {/* Header */}
      <div className="px-4 py-3 bg-slate-50/50 dark:bg-[#161a1d] border-b border-slate-200 dark:border-[#2c3338] flex flex-wrap items-center justify-between gap-3 select-none">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          {/* Toggle caret */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-350 cursor-pointer p-0.5 rounded"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className={`transition-transform duration-155 ${isExpanded ? "rotate-90" : ""}`}
            >
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>

          {/* Sprint Name */}
          <span className="text-xs font-bold text-slate-800 dark:text-slate-300">
            {sprint.name}
          </span>

          {/* Date range */}
          <span className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-[#22272b] px-2 py-0.5 rounded border border-slate-200/40 dark:border-[#353e47]">
            {formatDateRange(sprint.startDate, sprint.endDate)}
          </span>

          {/* Status Badge */}
          {sprint.status === "Active" ? (
            <span className="rounded bg-green-50 dark:bg-green-950/20 px-2 py-0.5 text-[9px] font-bold uppercase text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/30 animate-pulse">
              Đang hoạt động
            </span>
          ) : (
            <span className="rounded bg-slate-100 dark:bg-[#22272b] px-2 py-0.5 text-[9px] font-bold uppercase text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-[#353e47]">
              Lên kế hoạch
            </span>
          )}


        </div>

        {/* Right side controls: Stats, actions */}
        <div className="flex items-center gap-3">
          {/* Progress Mini-bar */}
          {totalTasks > 0 && (
            <div className="flex items-center gap-2" title={`Hoàn thành ${completedTasks}/${totalTasks} công việc`}>
              <div className="w-16 h-1.5 bg-slate-200 dark:bg-[#22272b] rounded-full overflow-hidden border border-slate-200/30 dark:border-[#353e47]/30">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400">
                {completedTasks}/{totalTasks}
              </span>
            </div>
          )}

          {/* Action buttons */}
          {isLeaderOrOwner && (
            <div className="flex items-center gap-1.5">
              {sprint.status === "Future" && (
                <button
                  onClick={() => onStartSprint(sprint.id)}
                  className="bg-[#1868db] dark:bg-[#579dff] hover:bg-[#0052cc] dark:hover:bg-blue-400 text-white dark:text-[#1d2125] text-[10px] font-bold px-2 py-1 rounded cursor-pointer transition-colors"
                >
                  Bắt đầu Sprint
                </button>
              )}

              {sprint.status === "Active" && (
                <button
                  onClick={() => onCloseSprint(sprint.id)}
                  className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold px-2 py-1 rounded cursor-pointer transition-colors"
                >
                  Kết thúc Sprint
                </button>
              )}

              {sprint.status === "Future" && (
                <button
                  onClick={() => onEditSprint(sprint)}
                  className="bg-transparent hover:bg-slate-100 dark:hover:bg-[#22272b] text-slate-550 dark:text-slate-400 border border-slate-200 dark:border-[#353e47] text-[10px] font-bold px-2 py-1 rounded cursor-pointer transition-colors"
                >
                  Sửa
                </button>
              )}

              {sprint.status === "Future" && (
                <button
                  onClick={() => onDeleteSprint(sprint.id)}
                  className="bg-transparent hover:bg-red-50 dark:hover:bg-red-950/10 text-red-500 dark:text-red-400 border border-transparent hover:border-red-200 dark:hover:border-red-900/30 text-[10px] font-bold px-2 py-1 rounded cursor-pointer transition-colors"
                >
                  Xóa
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sprint Task List (Collapsible) */}
      {isExpanded && (
        <div className="divide-y divide-slate-100 dark:divide-[#2c3338] min-h-[50px] flex flex-col">
          {sprint.goal && (
            <div className="px-4 py-2.5 bg-slate-50/50 dark:bg-[#161a1d]/30 border-b border-slate-100 dark:border-[#2c3338] text-xs text-slate-550 dark:text-slate-400 flex items-start gap-2 select-text">
              <span className="text-slate-450 dark:text-slate-500 mt-0.5 shrink-0">🎯</span>
              <div>
                <span className="font-bold text-slate-700 dark:text-slate-350 mr-1.5">Mục tiêu Sprint:</span>
                <span className="italic leading-relaxed">{sprint.goal}</span>
              </div>
            </div>
          )}
          {sprint.tasks && sprint.tasks.length > 0 ? (
            sprint.tasks.map((task) => (
              <BacklogTaskRow
                key={task.id}
                task={task}
                onTaskClick={onTaskClick}
                canDrag={sprint.status !== "Closed"}
                sprintStartDate={sprint.startDate}
                sprintEndDate={sprint.endDate}
              />
            ))
          ) : (
            <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500 italic select-none">
              Chưa có công việc nào trong Sprint này. Kéo thả các công việc từ Backlog vào đây hoặc tạo công việc mới.
            </div>
          )}

          {/* Add task button at bottom of Sprint */}
          {sprint.status !== "Closed" && (
            <div className="p-2 bg-slate-50/30 dark:bg-[#1d2125]/20 flex justify-start">
              <button
                onClick={() => onCreateTaskClick(sprint.id)}
                className="flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:text-[#1868db] dark:hover:text-[#579dff] cursor-pointer transition-colors px-2 py-1 hover:bg-slate-100 dark:hover:bg-[#22272b] rounded"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>Tạo công việc mới</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
