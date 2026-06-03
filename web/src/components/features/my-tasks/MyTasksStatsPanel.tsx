"use client";

/**
 * @component MyTasksStatsPanel
 * @description Thống kê tiến độ công việc và danh sách công việc cần lưu ý (quá hạn, sắp đến hạn 3 ngày) của người dùng.
 */

import * as React from "react";
import { TaskItem } from "@/types/task";

interface MyTasksStatsPanelProps {
  tasks: TaskItem[];
  onTaskClick: (task: TaskItem) => void;
}

export function MyTasksStatsPanel({ tasks, onTaskClick }: MyTasksStatsPanelProps) {
  const statsAndAttention = React.useMemo(() => {
    const now = new Date();
    
    const threeDaysFromNow = new Date(now);
    threeDaysFromNow.setDate(now.getDate() + 3);
    threeDaysFromNow.setHours(23, 59, 59, 999);

    let completed = 0;
    let uncompleted = 0;
    const overdueList: any[] = [];
    const upcomingList: any[] = [];

    tasks.forEach((t: any) => {
      if (t.isCompleted) {
        completed++;
      } else {
        uncompleted++;
        
        if (t.dueDate) {
          const dueDate = new Date(t.dueDate);
          if (dueDate < now) {
            overdueList.push(t);
          } else if (dueDate <= threeDaysFromNow) {
            upcomingList.push(t);
          }
        }
      }
    });

    const total = tasks.length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      uncompleted,
      percent,
      overdueList,
      upcomingList,
    };
  }, [tasks]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 shrink-0">
      <style>{`
        .scrollbar-hover-only {
          scrollbar-width: none;
        }
        .scrollbar-hover-only::-webkit-scrollbar {
          width: 4px;
          height: 4px;
          display: none;
        }
        .scrollbar-hover-only:hover {
          scrollbar-width: thin;
        }
        .scrollbar-hover-only:hover::-webkit-scrollbar {
          display: block;
        }
      `}</style>

      {/* Progress Donut Chart */}
      <div className="border border-slate-200 rounded-lg p-5 bg-slate-50/40 flex items-center justify-between gap-6 shadow-2xs h-72">
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-800">Tiến độ công việc</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <span className="h-3 w-3 rounded-full bg-slate-200 border border-slate-300" />
              <span className="text-slate-600 font-medium">Tổng số:</span>
              <span className="font-bold text-slate-800">{statsAndAttention.total}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="h-3 w-3 rounded-full bg-emerald-500 border border-emerald-600" />
              <span className="text-slate-600 font-medium">Đã hoàn thành:</span>
              <span className="font-bold text-slate-800">{statsAndAttention.completed}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="h-3 w-3 rounded-full bg-amber-500 border border-amber-600" />
              <span className="text-slate-600 font-medium">Chưa hoàn thành:</span>
              <span className="font-bold text-slate-800">{statsAndAttention.uncompleted}</span>
            </div>
          </div>
        </div>

        {/* SVG Donut Chart */}
        <div className="relative h-40 w-40 flex items-center justify-center shrink-0">
          <svg className="absolute transform -rotate-90 w-full h-full" viewBox="0 0 120 120">
            {/* Background circle represents Uncompleted (Amber) if tasks exist, else neutral gray */}
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="transparent"
              stroke={statsAndAttention.total > 0 ? "#f59e0b" : "#e2e8f0"}
              strokeWidth="10"
            />
            {/* Foreground circle represents Completed (Emerald Green) */}
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="transparent"
              stroke="#10b981"
              strokeWidth="10"
              strokeDasharray="314.16"
              strokeDashoffset={314.16 - (statsAndAttention.percent / 100) * 314.16}
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
            />
          </svg>
          <div className="text-center">
            <span className="text-4xl font-extrabold text-slate-800">{statsAndAttention.percent}%</span>
            <span className="block text-xs uppercase tracking-wider font-bold text-slate-400 mt-1">Xong</span>
          </div>
        </div>
      </div>

      {/* Attention Tasks List */}
      <div className="border border-slate-200 rounded-lg p-5 bg-slate-50/40 flex flex-col h-72 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-1.5 shrink-0">
          <span>Công việc cần chú ý</span>
          {(statsAndAttention.overdueList.length > 0 || statsAndAttention.upcomingList.length > 0) && (
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          )}
        </h3>

        <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1 scrollbar-hover-only">
          {statsAndAttention.overdueList.length === 0 && statsAndAttention.upcomingList.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-2 text-xs text-slate-500">
              <span className="text-xl mb-1">🎉</span>
              <span className="font-semibold text-emerald-600">Tuyệt vời!</span>
              <span className="text-[10px] text-slate-400 mt-0.5">Không có việc nào quá hạn hoặc sắp đến hạn trong 3 ngày.</span>
            </div>
          ) : (
            <>
              {/* Overdue Items */}
              {statsAndAttention.overdueList.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onTaskClick(item)}
                  className="flex items-center justify-between p-2 rounded-md bg-red-50 border border-red-100 hover:bg-red-100/50 hover:border-red-200 transition-colors cursor-pointer text-xs"
                >
                  <div className="flex flex-col min-w-0 max-w-[70%]">
                    <span className="font-bold text-red-900 truncate">{item.title}</span>
                    <span className="text-[10px] text-red-700/80 truncate">Công việc: {item.parentTaskTitle} | Dự án: {item.projectName}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="bg-red-100 text-red-800 border border-red-200 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded">Quá hạn</span>
                    <span className="text-red-700 font-bold text-[10px]">
                      {(() => {
                        const date = new Date(item.dueDate);
                        return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
                      })()}
                    </span>
                  </div>
                </div>
              ))}

              {/* Upcoming Items */}
              {statsAndAttention.upcomingList.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onTaskClick(item)}
                  className="flex items-center justify-between p-2 rounded-md bg-amber-50 border border-amber-100 hover:bg-amber-100/50 hover:border-amber-200 transition-colors cursor-pointer text-xs"
                >
                  <div className="flex flex-col min-w-0 max-w-[70%]">
                    <span className="font-bold text-amber-900 truncate">{item.title}</span>
                    <span className="text-[10px] text-amber-700/80 truncate">Công việc: {item.parentTaskTitle} | Dự án: {item.projectName}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="bg-amber-100 text-amber-800 border border-amber-200 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded">Gần hạn</span>
                    <span className="text-amber-700 font-bold text-[10px]">
                      {(() => {
                        const date = new Date(item.dueDate);
                        return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
                      })()}
                    </span>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
