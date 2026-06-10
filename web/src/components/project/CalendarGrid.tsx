"use client";

import * as React from "react";
import { TaskItem } from "@/types/task";
import { Avatar } from "@/components/ui/Avatar";
import { toUtcLocalDate } from "@/lib/utils";

interface CalendarGridProps {
  cells: { date: Date; isCurrentMonth: boolean }[];
  viewMode: "month" | "week";
  tasks: TaskItem[];
  showProjectPrefix?: boolean;
  onTaskClick: (task: TaskItem) => void;
  onTaskDrop: (taskId: string, targetDate: Date) => void;
}

export function CalendarGrid({
  cells,
  viewMode,
  tasks,
  showProjectPrefix = false,
  onTaskClick,
  onTaskDrop,
}: CalendarGridProps) {
  const [hoveredDateStr, setHoveredDateStr] = React.useState<string | null>(null);

  const getLocalDateString = (dateInput: Date | string | null) => {
    if (!dateInput) return "";
    let d: Date;
    if (typeof dateInput === "string") {
      const parsed = toUtcLocalDate(dateInput);
      if (!parsed) return "";
      d = parsed;
    } else {
      d = dateInput;
    }
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const getTaskColorClass = (task: TaskItem) => {
    if (task.completedAt || task.boardColumnId.includes("done")) {
      return "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100/70";
    }
    switch (task.priority) {
      case "Required":
      case "Critical":
      case "High":
        return "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400 hover:bg-red-100/70 font-semibold";
      case "Important":
      case "Medium":
        return "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/40 text-blue-700 dark:text-[#579dff] hover:bg-blue-100/70";
      case "Extended":
      case "Low":
        return "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-[#353e47] text-slate-600 dark:text-slate-400 hover:bg-slate-100/70";
      default:
        return "bg-slate-50 dark:bg-slate-900/40 border-slate-150 dark:border-[#353e47] text-slate-500 dark:text-slate-400 hover:bg-slate-100/50";
    }
  };

  const weekdayHeaders = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ Nhật"];
  const todayStr = getLocalDateString(new Date());

  return (
    <div className="flex-1 min-h-0 w-full overflow-hidden border border-slate-200 dark:border-[#353e47] rounded-lg flex flex-col shadow-xs bg-slate-50/20 dark:bg-[#161a1d]/30">
      <div className="grid grid-cols-7 border-b border-slate-200 dark:border-[#353e47] bg-slate-50/70 dark:bg-[#1d2125] select-none text-center">
        {weekdayHeaders.map((day) => (
          <div key={day} className="py-2.5 text-[11px] font-bold text-[#6b6e76] dark:text-slate-400 border-r border-slate-200 dark:border-[#2c3338] last:border-r-0 uppercase tracking-wide">
            {day}
          </div>
        ))}
      </div>

      <div className={`flex-1 grid grid-cols-7 ${viewMode === "month" ? "grid-rows-5 md:grid-rows-6" : "grid-rows-1"} min-h-[480px] divide-x divide-y divide-slate-200 dark:divide-[#2c3338]`}>
        {cells.map((cell, index) => {
          const dateStr = getLocalDateString(cell.date);
          const isToday = todayStr === dateStr;
          const isHovered = hoveredDateStr === dateStr;
          const cellTasks = tasks.filter((t) => getLocalDateString(t.dueDate) === dateStr);

          return (
            <div
              key={index}
              onDragOver={(e) => {
                e.preventDefault();
                setHoveredDateStr(dateStr);
              }}
              onDragLeave={() => setHoveredDateStr(null)}
              onDrop={(e) => {
                e.preventDefault();
                setHoveredDateStr(null);
                const taskId = e.dataTransfer.getData("text/plain");
                if (taskId) onTaskDrop(taskId, cell.date);
              }}
              className={`p-1.5 flex flex-col justify-between border-b border-r border-slate-200 dark:border-[#2c3338] last:border-r-0 transition-all min-h-[96px] ${
                cell.isCurrentMonth ? "bg-white dark:bg-[#22272b]" : "bg-slate-50/40 dark:bg-[#161a1d]/40 text-slate-400 dark:text-slate-500"
              } ${isHovered ? "bg-blue-50/60 dark:bg-blue-950/20 border-2 border-[#1868db] dark:border-[#579dff] -m-0.5 z-10 rounded-sm" : ""}`}
            >
              <div className="flex justify-between items-center text-[11px] font-bold">
                {isToday ? (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1868db] dark:bg-[#579dff] text-white dark:text-[#1d2125] font-bold">
                    {cell.date.getDate()}
                  </span>
                ) : (
                  <span className={cell.isCurrentMonth ? "text-[#292a2e] dark:text-[#deebff]" : "text-slate-400 dark:text-slate-500"}>
                    {cell.date.getDate()}
                  </span>
                )}
                {cellTasks.length > 0 && (
                  <span className="text-[9px] font-bold text-[#6b6e76] dark:text-slate-400 bg-slate-100 dark:bg-[#2c3338] rounded-full px-1.5 py-0.2">
                    {cellTasks.length} việc
                  </span>
                )}
              </div>

              <div className="flex-1 overflow-y-auto mt-2 space-y-1.5 max-h-[85px] scrollbar-none">
                {cellTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("text/plain", task.id)}
                    onClick={() => onTaskClick(task)}
                    className={`w-full text-left truncate text-[10px] font-bold p-1 px-1.5 rounded-[4px] border flex items-center justify-between cursor-grab active:cursor-grabbing transition-all ${getTaskColorClass(task)}`}
                  >
                    <span className="truncate max-w-[78%]" title={`${(task as any).projectName ? `[${(task as any).projectName}] ` : ""}${(task as any).parentTaskTitle ? `[${(task as any).parentTaskTitle}] ` : ""}${task.title}`}>
                      {showProjectPrefix && (task as any).projectName ? `[${(task as any).projectName}] ` : ""}
                      {(task as any).parentTaskTitle ? `[${(task as any).parentTaskTitle}] ` : ""}
                      {task.title}
                    </span>

                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
