"use client";

/**
 * @component GanttChartView
 * @description Trực quan hóa tiến độ công việc dưới dạng sơ đồ Gantt.
 * Cho phép xem theo tháng, theo dõi ngày bắt đầu/hạn chót và tiến độ hoàn thành.
 */

import * as React from "react";

import { TaskDetailModal } from "./TaskDetailModal";

import { TaskItem, BoardColumn } from "@/types/task";

interface GanttChartViewProps {
  tasks: TaskItem[];
  setTasks: React.Dispatch<React.SetStateAction<TaskItem[]>>;
  columns: BoardColumn[];
  assignees: any[];
}

export function GanttChartView({ tasks, setTasks, columns, assignees }: GanttChartViewProps) {
  const [currentDate, setCurrentDate] = React.useState<Date>(new Date(2026, 4, 22));
  const [selectedTask, setSelectedTask] = React.useState<TaskItem | null>(null);

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
      Critical: "from-red-500 to-red-600 border-red-700 text-white",
      High: "from-orange-400 to-orange-500 border-orange-600 text-white",
      Medium: "from-blue-400 to-blue-500 border-blue-600 text-white",
    };
    return colors[priority || ""] || "from-slate-400 to-slate-500 border-slate-600 text-white";
  };

  const handleUpdateTask = (updatedTask: TaskItem) => {
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    if (selectedTask?.id === updatedTask.id) setSelectedTask(updatedTask);
  };

  return (
    <div className="flex flex-col h-full w-full bg-white overflow-hidden p-6 pt-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4 shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold text-[#292a2e] capitalize">{monthLabel}</h2>
          <div className="flex items-center border border-slate-200 rounded-[4px] bg-white overflow-hidden shadow-xs">
            <button
              onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
              className="px-2.5 py-1.5 hover:bg-slate-100 active:bg-slate-200 text-slate-600 border-r border-slate-200 cursor-pointer flex items-center justify-center"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              onClick={() => setCurrentDate(new Date(2026, 4, 22))}
              className="px-3 py-1.5 hover:bg-slate-100 active:bg-slate-200 text-xs font-bold text-[#292a2e] border-r border-slate-200 cursor-pointer"
            >
              Hôm nay
            </button>
            <button
              onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
              className="px-2.5 py-1.5 hover:bg-slate-100 active:bg-slate-200 text-slate-600 cursor-pointer flex items-center justify-center"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500">
          <div className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-red-500" /> Khẩn cấp</div>
          <div className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-orange-500" /> Cao</div>
          <div className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-blue-500" /> Trung bình</div>
          <div className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-slate-400" /> Thấp</div>
        </div>
      </div>

      {/* Gantt Container */}
      <div className="flex-1 overflow-hidden border border-slate-200 rounded-lg flex mt-4 shadow-xs">
        {/* LEFT TASK LIST */}
        <div className="w-[280px] border-r border-slate-200 bg-slate-50/50 flex flex-col shrink-0">
          <div className="h-10 border-b border-slate-200 bg-slate-50 flex items-center px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Công việc
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-150 scrollbar-none select-none">
            {tasks.map((task) => {
              const taskCode = task.id.startsWith("task-")
                ? `QLDK-${100 + parseInt(task.id.split("-")[1])}`
                : `QLDK-${task.id.substring(0, 4).toUpperCase()}`;
              return (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="h-14 px-4 flex flex-col justify-center hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  <span className="text-[10px] font-bold text-slate-400 mb-0.5">{taskCode}</span>
                  <span className="text-xs font-semibold text-[#292a2e] truncate" title={task.title}>{task.title}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT TIMELINE GRID */}
        <div className="flex-1 overflow-auto flex flex-col scrollbar-thin">
          {/* Header */}
          <div
            className="h-10 border-b border-slate-200 bg-slate-50/50 grid shrink-0"
            style={{ gridTemplateColumns: `repeat(${daysInMonth}, 36px)`, width: `${daysInMonth * 36}px` }}
          >
            {dayNumbers.map((day) => {
              const isToday = year === 2026 && month === 4 && day === 22;
              return (
                <div
                  key={day}
                  className={`border-r border-slate-200 last:border-r-0 flex items-center justify-center text-[10px] font-bold ${
                    isToday ? "bg-red-50 text-red-600" : "text-slate-500"
                  }`}
                >
                  {day}
                </div>
              );
            })}
          </div>

          {/* Grid Rows */}
          <div className="flex-1 divide-y divide-slate-150 relative bg-white" style={{ width: `${daysInMonth * 36}px` }}>
            {/* Today Line */}
            {year === 2026 && month === 4 && (
              <div
                className="absolute top-0 bottom-0 border-l-2 border-dashed border-red-500 z-10 pointer-events-none"
                style={{ left: `${(22 - 1) * 36 + 18}px` }}
              />
            )}

            {tasks.map((task) => {
              let startDay = 0, spanDays = 0, hasDates = false;
              if (task.startDate && task.dueDate) {
                const sDate = new Date(task.startDate), dDate = new Date(task.dueDate);
                const sMonth = new Date(year, month, 1), eMonth = new Date(year, month + 1, 0);
                if (sDate <= eMonth && dDate >= sMonth) {
                  hasDates = true;
                  startDay = sDate < sMonth ? 1 : sDate.getDate();
                  spanDays = (dDate > eMonth ? daysInMonth : dDate.getDate()) - startDay + 1;
                }
              }
              const percent = getSubtaskPercent(task);

              return (
                <div key={task.id} onClick={() => setSelectedTask(task)} className="h-14 relative hover:bg-slate-50/50 cursor-pointer flex items-center">
                  <div className="absolute inset-0 grid pointer-events-none" style={{ gridTemplateColumns: `repeat(${daysInMonth}, 36px)` }}>
                    {dayNumbers.map((d) => <div key={d} className="border-r border-slate-100 last:border-r-0 h-full" />)}
                  </div>
                  {hasDates ? (
                    <div
                      className={`absolute h-7 rounded-md border shadow-xs bg-gradient-to-r flex flex-col justify-between overflow-hidden p-0.5 select-none ${getPriorityColor(task.priority)}`}
                      style={{ left: `${(startDay - 1) * 36 + 3}px`, width: `${spanDays * 36 - 6}px`, minWidth: "30px" }}
                      title={`${task.title} (${new Date(task.startDate!).toLocaleDateString("vi-VN")} - ${new Date(task.dueDate!).toLocaleDateString("vi-VN")})`}
                    >
                      <span className="text-[9px] font-extrabold truncate px-1 mt-0.5">{percent}%</span>
                      <div className="w-full bg-black/15 h-1 rounded-sm overflow-hidden">
                        <div className="bg-white h-full transition-all duration-300" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  ) : (
                    <div className="absolute h-7 rounded-md border border-dashed border-slate-300 bg-slate-50/50 flex items-center justify-center select-none" style={{ left: "12px", right: "12px" }}>
                      <span className="text-[10px] font-bold text-slate-400">Chưa thiết lập ngày (Start / Due Date)</span>
                    </div>
                  )}
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
        />
      )}
    </div>
  );
}
