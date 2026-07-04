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
  const [hoveredTask, setHoveredTask] = React.useState<{ task: TaskItem; x: number; y: number } | null>(null);
  const tooltipRef = React.useRef<HTMLDivElement>(null);
  const [tooltipPos, setTooltipPos] = React.useState({ top: 0, left: 0 });

  const [activeMoreDate, setActiveMoreDate] = React.useState<{ date: Date; tasks: TaskItem[] } | null>(null);

  React.useEffect(() => {
    if (hoveredTask) {
      const tooltipHeight = tooltipRef.current?.offsetHeight || 180;
      const tooltipWidth = tooltipRef.current?.offsetWidth || 256;
      
      let top = hoveredTask.y + 12;
      let left = hoveredTask.x + 12;

      if (top + tooltipHeight > window.innerHeight) {
        top = hoveredTask.y - tooltipHeight - 12;
      }
      if (left + tooltipWidth > window.innerWidth) {
        left = hoveredTask.x - tooltipWidth - 12;
      }

      if (top < 0) top = 12;
      if (left < 0) left = 12;

      setTooltipPos({ top, left });
    }
  }, [hoveredTask]);

  const formatDueDate = (dateStr: string | null) => {
    if (!dateStr) return "Không có hạn chót";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${hours}:${minutes} ngày ${day}/${month}/${date.getFullYear()}`;
  };

  const getPriorityInfo = (priority: string | null) => {
    switch (priority) {
      case "Required":
      case "Critical":
      case "High":
        return { label: "Bắt buộc", color: "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/40" };
      case "Important":
      case "Medium":
        return { label: "Quan trọng", color: "bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/40" };
      case "Extended":
      case "Low":
        return { label: "Mở rộng", color: "bg-slate-50 dark:bg-slate-900/40 text-slate-650 dark:text-slate-450 border-slate-200 dark:border-[#353e47]" };
      default:
        return { label: "Không có", color: "bg-slate-50 dark:bg-slate-900/40 text-slate-500 dark:text-slate-450 border-slate-200 dark:border-[#353e47]" };
    }
  };


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
    const isCompleted = task.completedAt || task.boardColumnId.includes("done") || (task as any).isCompleted === true;
    if (isCompleted) {
      return "bg-emerald-600 dark:bg-emerald-700 text-white border-emerald-700 dark:border-emerald-800 hover:bg-emerald-700 dark:hover:bg-emerald-800 line-through opacity-85";
    }
    const priority = task.priority;
    if (priority === "Required" || priority === "Critical" || priority === "High") {
      return "bg-red-600 dark:bg-red-700 text-white border-red-700 dark:border-red-800 hover:bg-red-700 dark:hover:bg-red-800 font-bold";
    }
    if (priority === "Important" || priority === "Medium") {
      return "bg-blue-600 dark:bg-blue-700 text-white border-blue-700 dark:border-blue-800 hover:bg-blue-700 dark:hover:bg-blue-800 font-semibold";
    }
    if (priority === "Extended" || priority === "Low") {
      return "bg-slate-500 dark:bg-slate-600 text-white border-slate-600 dark:border-slate-700 hover:bg-slate-600 dark:hover:bg-slate-700";
    }
    return "bg-slate-400 dark:bg-slate-500 text-white border-slate-500 dark:border-slate-600 hover:bg-slate-500 dark:hover:bg-slate-600";
  };

  const weekdayHeaders = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ Nhật"];
  const todayStr = getLocalDateString(new Date());

  return (
    <div className="w-full border border-slate-200 dark:border-[#353e47] rounded-lg flex flex-col shadow-xs bg-slate-50/20 dark:bg-[#161a1d]/30">
      <div className="grid grid-cols-7 border-b border-slate-200 dark:border-[#353e47] bg-slate-50/70 dark:bg-[#1d2125] select-none text-center">
        {weekdayHeaders.map((day) => (
          <div key={day} className="py-2.5 text-[11px] font-bold text-[#6b6e76] dark:text-slate-400 border-r border-slate-200 dark:border-[#2c3338] last:border-r-0 uppercase tracking-wide">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 divide-x divide-y divide-slate-200 dark:divide-[#2c3338]">
        {cells.map((cell, index) => {
          const dateStr = getLocalDateString(cell.date);
          const isToday = todayStr === dateStr;
          const cellTasks = cell.isCurrentMonth 
            ? tasks.filter((t) => getLocalDateString(t.dueDate) === dateStr)
            : [];

          const showMore = cellTasks.length > 3;
          const visibleTasks = showMore ? cellTasks.slice(0, 3) : cellTasks;

          return (
            <div
              key={index}
              className={`p-1.5 flex flex-col justify-start gap-1 border-b border-r border-slate-200 dark:border-[#2c3338] last:border-r-0 transition-all min-h-[96px] ${
                cell.isCurrentMonth 
                  ? "bg-white dark:bg-[#22272b] hover:bg-slate-50/30 dark:hover:bg-[#2c3338]/10" 
                  : "bg-slate-50/40 dark:bg-[#161a1d]/40 text-slate-400 dark:text-slate-500"
              }`}
            >
              <div className="flex justify-between items-center text-[11px] font-bold w-full">
                {cell.isCurrentMonth ? (
                  isToday ? (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1868db] dark:bg-[#579dff] text-white dark:text-[#1d2125] font-bold">
                      {cell.date.getDate()}
                    </span>
                  ) : (
                    <span className="text-[#292a2e] dark:text-[#deebff]">
                      {cell.date.getDate()}
                    </span>
                  )
                ) : (
                  <span className="invisible">&nbsp;</span>
                )}
                {cellTasks.length > 0 && (
                  <span className="text-[9px] font-bold text-[#6b6e76] dark:text-slate-400 bg-slate-100 dark:bg-[#2c3338] rounded-full px-1.5 py-0.2">
                    {cellTasks.length} việc
                  </span>
                )}
              </div>

              <div className="w-full mt-1 space-y-1 pb-1">
                {visibleTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => onTaskClick(task)}
                    onMouseEnter={(e) => {
                      setHoveredTask({
                        task,
                        x: e.clientX,
                        y: e.clientY,
                      });
                    }}
                    onMouseMove={(e) => {
                      setHoveredTask((prev) => prev ? { ...prev, x: e.clientX, y: e.clientY } : null);
                    }}
                    onMouseLeave={() => setHoveredTask(null)}
                    className={`w-full text-left px-1.5 py-0.5 rounded-[3px] border text-[9.5px] font-bold cursor-pointer transition-all truncate hover:shadow-2xs select-none ${getTaskColorClass(task)}`}
                    title=""
                  >
                    {task.title}
                  </div>
                ))}

                {showMore && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMoreDate({
                        date: cell.date,
                        tasks: cellTasks
                      });
                    }}
                    className="w-full text-left text-[9px] font-extrabold text-[#1868db] dark:text-[#579dff] hover:underline cursor-pointer pt-0.5"
                  >
                    + {cellTasks.length - 3} thêm
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {hoveredTask && (
        <div
          ref={tooltipRef}
          style={{
            position: "fixed",
            top: tooltipPos.top,
            left: tooltipPos.left,
          }}
          className="w-64 p-3 bg-white dark:bg-[#1d2125] border border-slate-200 dark:border-[#353e47] rounded-lg shadow-xl z-50 pointer-events-none flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-100 text-xs text-[#292a2e] dark:text-[#deebff]"
        >
          {/* Header with Title and Status */}
          <div className="flex flex-col gap-1">
            <span className="font-extrabold text-slate-800 dark:text-[#deebff] leading-tight break-words">
              {hoveredTask.task.title}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              {(() => {
                const info = getPriorityInfo(hoveredTask.task.priority);
                return (
                  <span className={`px-1.5 py-0.2 text-[8px] font-extrabold uppercase border rounded-sm ${info.color}`}>
                    {info.label}
                  </span>
                );
              })()}
              {(() => {
                const isCompleted = hoveredTask.task.completedAt || hoveredTask.task.boardColumnId.includes("done") || (hoveredTask.task as any).isCompleted === true;
                return (
                  <span className={`px-1.5 py-0.2 text-[8px] font-extrabold uppercase border rounded-sm ${
                    isCompleted 
                      ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40" 
                      : "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/40"
                  }`}>
                    {isCompleted ? "Đã xong" : "Chưa xong"}
                  </span>
                );
              })()}
            </div>
          </div>

          <div className="h-[1px] bg-slate-100 dark:bg-[#2c3338]" />

          {/* Details list */}
          <div className="space-y-1.5 font-semibold text-slate-600 dark:text-slate-400">
            {showProjectPrefix && (hoveredTask.task as any).projectName && (
              <div className="flex items-center gap-1.5 truncate">
                <svg className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <span className="font-bold text-slate-700 dark:text-[#deebff] truncate">
                  {(hoveredTask.task as any).projectName}
                </span>
              </div>
            )}

            {(hoveredTask.task as any).parentTaskTitle && (
              <div className="flex items-center gap-1.5 truncate">
                <svg className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="truncate">
                  {(hoveredTask.task as any).parentTaskTitle}
                </span>
              </div>
            )}
          </div>

          {(() => {
            const avatar = (hoveredTask.task as any).assigneeAvatar || hoveredTask.task.assigneeUser?.avatar;
            const displayName = (hoveredTask.task as any).assigneeName || hoveredTask.task.assigneeUser?.displayName;
            if (!avatar && !displayName) return null;
            return (
              <>
                <div className="h-[1px] bg-slate-100 dark:bg-[#2c3338]" />
                <div className="flex items-center gap-2">
                  <svg className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <div className="flex items-center gap-1.5">
                    {avatar && (
                      <Avatar
                        src={avatar}
                        alt={displayName || "Thành viên"}
                        className="h-4 w-4 rounded-full border border-slate-100 dark:border-[#353e47]"
                      />
                    )}
                    <span className="text-slate-500 dark:text-slate-400 font-semibold truncate max-w-[150px]">
                      {displayName || "Thành viên"}
                    </span>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {activeMoreDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with blur */}
          <div 
            className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setActiveMoreDate(null)} 
          />
          
          {/* Centered Modal Card */}
          <div
            className="relative bg-white dark:bg-[#1c2126] w-full max-w-sm rounded-xl border border-slate-200 dark:border-[#353e47] shadow-2xl flex flex-col p-4 animate-in fade-in zoom-in-95 duration-150 text-xs text-[#292a2e] dark:text-[#deebff]"
          >
            {/* Header */}
            <div className="flex justify-between items-center pb-2.5 mb-3 border-b border-slate-100 dark:border-[#2c3338]">
              <div>
                <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wide block mb-0.5">Danh sách công việc</span>
                <span className="text-xs font-extrabold text-slate-850 dark:text-white capitalize">
                  {activeMoreDate.date.toLocaleDateString("vi-VN", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <button
                onClick={() => setActiveMoreDate(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer flex items-center justify-center p-1 rounded-full hover:bg-slate-50 dark:hover:bg-[#2c3338] transition-colors"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Scrollable Event List */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5 max-h-64 custom-scrollbar">
              {activeMoreDate.tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => {
                    onTaskClick(task);
                    setActiveMoreDate(null);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-md border text-[11px] font-bold cursor-pointer transition-all hover:shadow-2xs select-none truncate ${getTaskColorClass(task)}`}
                >
                  {task.title}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
