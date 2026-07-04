"use client";

/**
 * @component GanttChartView
 * @description Trực quan hóa tiến độ công việc dưới dạng sơ đồ Gantt.
 * Cho phép xem theo tháng, theo dõi ngày bắt đầu/hạn chót và tiến độ hoàn thành.
 */

import * as React from "react";

import { TaskDetailModal } from "./TaskDetailModal";

import { TaskItem, BoardColumn } from "@/types/task";
import { toUtcLocalDate } from "@/lib/utils";

interface GanttChartViewProps {
  tasks: TaskItem[];
  setTasks?: React.Dispatch<React.SetStateAction<TaskItem[]>>;
  columns: BoardColumn[];
  assignees: any[];
  readOnly?: boolean;
  shareToken?: string;
}

export function GanttChartView({
  tasks,
  setTasks,
  columns,
  assignees,
  readOnly = false,
  shareToken,
}: GanttChartViewProps) {
  const [currentDate, setCurrentDate] = React.useState<Date>(new Date());
  const [selectedTask, setSelectedTask] = React.useState<TaskItem | null>(null);

  const rightScrollRef = React.useRef<HTMLDivElement>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dayNumbers = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const monthLabel = currentDate.toLocaleDateString("vi-VN", { month: "long", year: "numeric" });

  const getSubtaskPercent = (task: TaskItem) => {
    if (!task.subTasks || task.subTasks.length === 0) return 0;
    const completed = task.subTasks.filter((st) => st.isCompleted).length;
    return Math.round((completed / task.subTasks.length) * 100);
  };

  const getPriorityColor = (priority: string | null) => {
    const colors: Record<string, string> = {
      Required: "from-red-500 to-red-600 border-red-700 text-white",
      Critical: "from-red-500 to-red-600 border-red-700 text-white",
      High: "from-red-500 to-red-600 border-red-700 text-white",
      Important: "from-blue-400 to-blue-500 border-blue-600 text-white",
      Medium: "from-blue-400 to-blue-500 border-blue-600 text-white",
      Extended: "from-slate-400 to-slate-500 dark:from-slate-600 dark:to-slate-700 border-slate-600 dark:border-[#2c3338] text-white",
      Low: "from-slate-400 to-slate-500 dark:from-slate-600 dark:to-slate-700 border-slate-600 dark:border-[#2c3338] text-white",
    };
    return colors[priority || ""] || "from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 border-slate-400 dark:border-[#353e47] text-slate-600 dark:text-slate-400";
  };

  const handleUpdateTask = (updatedTask: TaskItem) => {
    if (setTasks) {
      setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    }
    if (selectedTask?.id === updatedTask.id) setSelectedTask(updatedTask);
  };

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-[#1d2125] overflow-hidden p-6 pt-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 dark:border-[#2c3338] pb-4 shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold text-[#292a2e] dark:text-[#deebff] capitalize">{monthLabel}</h2>
          <div className="flex items-center border border-slate-200 dark:border-[#353e47] rounded-[4px] bg-white dark:bg-[#22272b] overflow-hidden shadow-xs">
            <button
              onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
              className="px-2.5 py-1.5 hover:bg-slate-100 dark:hover:bg-[#2c3338] active:bg-slate-200 dark:active:bg-[#353e47] text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-[#353e47] cursor-pointer flex items-center justify-center"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-[#2c3338] active:bg-slate-200 dark:active:bg-[#353e47] text-xs font-bold text-[#292a2e] dark:text-[#deebff] border-r border-slate-200 dark:border-[#353e47] cursor-pointer"
            >
              Hôm nay
            </button>
            <button
              onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
              className="px-2.5 py-1.5 hover:bg-slate-100 dark:hover:bg-[#2c3338] active:bg-slate-200 dark:active:bg-[#353e47] text-slate-600 dark:text-slate-400 cursor-pointer flex items-center justify-center"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-red-500" /> Bắt buộc</div>
          <div className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-blue-500" /> Quan trọng</div>
          <div className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-slate-400 dark:bg-slate-500" /> Mở rộng</div>
        </div>
      </div>

      {/* Gantt Container */}
      <div className="flex-1 overflow-hidden border border-slate-200 dark:border-[#353e47] rounded-lg flex flex-col mt-4 shadow-xs">
        
        {/* Single Scroll Container */}
        <div 
          ref={rightScrollRef}
          className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin relative bg-white dark:bg-[#161a1d]"
        >
          {/* HEADER AREA (sticky top) */}
          <div 
            className="sticky top-0 z-30 h-10 border-b border-slate-200 dark:border-[#353e47] bg-slate-50 dark:bg-[#1d2125] flex shrink-0 w-full"
          >
            {/* Top-Left Header Cell (sticky left & top) */}
            <div className="w-[280px] sticky left-0 z-40 border-r border-slate-200 dark:border-[#353e47] bg-slate-50 dark:bg-[#1d2125] flex items-center px-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider shrink-0 select-none">
              Công việc
            </div>
            
            {/* Days timeline Header */}
            <div 
              className="flex-1 grid select-none"
              style={{ 
                gridTemplateColumns: `repeat(${daysInMonth}, minmax(0, 1fr))`, 
              }}
            >
              {dayNumbers.map((day) => {
                const today = new Date();
                const isToday = year === today.getFullYear() && month === today.getMonth() && day === today.getDate();
                return (
                  <div
                    key={day}
                    className={`border-r border-slate-200 dark:border-[#2c3338] last:border-r-0 flex items-center justify-center text-[10px] font-bold ${
                      isToday ? "bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400" : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </div>

          {/* BODY AREA (scrollable rows) */}
          <div className="divide-y divide-slate-150 dark:divide-[#2c3338] relative w-full">
            {/* Today Line (absolute positioned inside the body container) */}
            {(() => {
              const today = new Date();
              const showTodayLine = year === today.getFullYear() && month === today.getMonth();
              if (showTodayLine) {
                const todayDay = today.getDate();
                return (
                  <div
                    className="absolute top-0 bottom-0 border-l-2 border-dashed border-red-500 z-10 pointer-events-none"
                    style={{ left: `calc(280px + (((${todayDay} - 0.5) / ${daysInMonth}) * (100% - 280px)))` }}
                  />
                );
              }
              return null;
            })()}

            {tasks.map((task) => {
              const rawStart = task.startDate;
              const rawDue = task.dueDate;
              
              const hasDates = !!(rawStart || rawDue);
              let overlapsCurrentMonth = false;
              let startDay = 0;
              let spanDays = 0;
              let sDateObj: Date | null = null;
              let dDateObj: Date | null = null;

              if (hasDates) {
                const effectiveStart = rawStart || rawDue!;
                const effectiveDue = rawDue || rawStart!;
                
                sDateObj = toUtcLocalDate(effectiveStart);
                dDateObj = toUtcLocalDate(effectiveDue);
                
                const sMonth = new Date(year, month, 1);
                const eMonth = new Date(year, month + 1, 0);
                
                if (sDateObj && dDateObj && sDateObj <= eMonth && dDateObj >= sMonth) {
                  overlapsCurrentMonth = true;
                  startDay = sDateObj < sMonth ? 1 : sDateObj.getDate();
                  spanDays = (dDateObj > eMonth ? daysInMonth : dDateObj.getDate()) - startDay + 1;
                }
              }

              const percent = getSubtaskPercent(task);

              return (
                <div 
                  key={task.id} 
                  className="h-14 flex group hover:bg-slate-50/50 dark:hover:bg-[#2c3338]/40 transition-colors w-full"
                >
                  {/* Sticky Left Task Cell */}
                  <div
                    onClick={() => setSelectedTask(task)}
                    className="w-[280px] sticky left-0 z-20 border-r border-slate-200 dark:border-[#353e47] bg-white dark:bg-[#161a1d] group-hover:bg-slate-50/80 dark:group-hover:bg-[#2c3338]/60 flex flex-col justify-center px-4 cursor-pointer transition-colors shrink-0"
                  >
                    <span className="text-xs font-semibold text-[#292a2e] dark:text-[#deebff] truncate" title={task.title}>
                      {task.title}
                    </span>
                  </div>

                  {/* Right Timeline Cell */}
                  <div 
                    onClick={() => setSelectedTask(task)}
                    className="flex-1 relative cursor-pointer flex items-center min-w-0"
                  >
                    {/* Grid Lines */}
                    <div className="absolute inset-0 grid pointer-events-none" style={{ gridTemplateColumns: `repeat(${daysInMonth}, minmax(0, 1fr))` }}>
                      {dayNumbers.map((d) => <div key={d} className="border-r border-slate-100 dark:border-[#2c3338]/50 last:border-r-0 h-full" />)}
                    </div>

                    {hasDates ? (
                      overlapsCurrentMonth && sDateObj && dDateObj ? (
                        <div
                          className={`absolute h-8.5 rounded-md border shadow-sm bg-gradient-to-r flex flex-col justify-between overflow-hidden p-1 select-none ${getPriorityColor(task.priority)}`}
                          style={{ 
                            left: `calc(((${startDay} - 1) / ${daysInMonth}) * 100% + 2px)`, 
                            width: `calc((${spanDays} / ${daysInMonth}) * 100% - 4px)`, 
                            minWidth: "16px" 
                          }}
                          title={`${task.title} (${sDateObj.toLocaleDateString("vi-VN")} - ${dDateObj.toLocaleDateString("vi-VN")})`}
                        >
                          <span className="text-[11px] font-black truncate px-1 select-none leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]">{percent}%</span>
                          <div className="w-full bg-black/20 h-1.25 rounded-sm overflow-hidden">
                            <div className="bg-white h-full transition-all duration-300" style={{ width: `${percent}%` }} />
                          </div>
                        </div>
                      ) : (
                        <div className="absolute left-4 text-[10px] text-[#80838d] dark:text-slate-500 italic pointer-events-none select-none">
                          (Ngoài phạm vi tháng này)
                        </div>
                      )
                    ) : (
                      <div className="absolute h-7 rounded-md border border-dashed border-slate-300 dark:border-[#353e47] bg-slate-50/50 dark:bg-[#22272b]/20 flex items-center justify-center select-none" style={{ left: "12px", right: "12px" }}>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">Chưa thiết lập ngày (Start / Due Date)</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Task Modal */}
      {selectedTask && (
        <TaskDetailModal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          task={selectedTask}
          columns={columns}
          onUpdateTask={handleUpdateTask}
          assignees={assignees}
          readOnly={readOnly}
          shareToken={shareToken}
        />
      )}
    </div>
  );
}
