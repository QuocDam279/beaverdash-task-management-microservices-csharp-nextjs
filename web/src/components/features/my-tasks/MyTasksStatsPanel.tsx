"use client";

/**
 * @component MyTasksStatsPanel
 * @description Thống kê tiến độ công việc và danh sách công việc cần lưu ý (quá hạn và hoàn thành trong ngày) của người dùng.
 */

import * as React from "react";
import { TaskItem } from "@/types/task";
import { toUtcLocalDate } from "@/lib/utils";

interface MyTasksStatsPanelProps {
  tasks: TaskItem[];
  onTaskClick: (task: TaskItem) => void;
  stats?: {
    totalTasksCount: number;
    completedTasksCount: number;
    uncompletedTasksCount: number;
    overdueTasks: TaskItem[];
    todayTasks: TaskItem[];
    upcomingTasks?: TaskItem[];
  } | null;
}

export function MyTasksStatsPanel({ tasks, onTaskClick, stats }: MyTasksStatsPanelProps) {
  const [activeTab, setActiveTab] = React.useState<"overdue" | "today" | "upcoming" | null>(null);

  const statsAndAttention = React.useMemo(() => {
    if (stats) {
      const completed = stats.completedTasksCount;
      const uncompleted = stats.uncompletedTasksCount;
      const inactive = (stats as any).inactiveTasksCount ?? 0;
      const total = completed + uncompleted + inactive;
      const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
      return {
        total,
        completed,
        uncompleted,
        inactive,
        percent,
        overdueList: stats.overdueTasks || [],
        todayList: stats.todayTasks || [],
        upcomingList: stats.upcomingTasks || [],
      };
    }

    let completed = 0;
    let uncompleted = 0;
    const overdueList: TaskItem[] = [];
    const todayList: TaskItem[] = [];
    const upcomingList: TaskItem[] = [];

    tasks.forEach((t: TaskItem) => {
      if (t.isCompleted) {
        completed++;
      } else {
        uncompleted++;
      }
    });

    const total = tasks.length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      uncompleted,
      inactive: 0,
      percent,
      overdueList,
      todayList,
      upcomingList,
    };
  }, [tasks, stats]);

  const currentTab = activeTab || (() => {
    if (statsAndAttention.overdueList.length > 0) return "overdue";
    if (statsAndAttention.todayList.length > 0) return "today";
    if (statsAndAttention.upcomingList.length > 0) return "upcoming";
    return "overdue";
  })();

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
              <span className="text-slate-600 font-medium">Đã hoàn thành (hoạt động):</span>
              <span className="font-bold text-slate-800">{statsAndAttention.completed}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="h-3 w-3 rounded-full bg-amber-500 border border-amber-600" />
              <span className="text-slate-600 font-medium">Chưa hoàn thành (hoạt động):</span>
              <span className="font-bold text-slate-800">{statsAndAttention.uncompleted}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="h-3 w-3 rounded-full bg-slate-400 border border-slate-500" />
              <span className="text-slate-600 font-medium">Chưa hoạt động:</span>
              <span className="font-bold text-slate-800">{statsAndAttention.inactive}</span>
            </div>
          </div>
        </div>

        {/* SVG Donut Chart */}
        <div className="relative h-40 w-40 flex items-center justify-center shrink-0">
          <svg className="absolute transform -rotate-90 w-full h-full" viewBox="0 0 120 120">
            {statsAndAttention.total === 0 ? (
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="transparent"
                stroke="#e2e8f0"
                strokeWidth="10"
              />
            ) : (
              <>
                {/* Segment 3: Inactive */}
                {statsAndAttention.inactive > 0 && (
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="transparent"
                    stroke="#94a3b8"
                    strokeWidth="10"
                    strokeDasharray={`${(statsAndAttention.inactive / statsAndAttention.total) * 314.16} 314.16`}
                    strokeDashoffset={-(((statsAndAttention.completed + statsAndAttention.uncompleted) / statsAndAttention.total) * 314.16)}
                    strokeLinecap="round"
                    className="transition-all duration-500 ease-out"
                  />
                )}
                {/* Segment 2: Uncompleted */}
                {statsAndAttention.uncompleted > 0 && (
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="transparent"
                    stroke="#f59e0b"
                    strokeWidth="10"
                    strokeDasharray={`${(statsAndAttention.uncompleted / statsAndAttention.total) * 314.16} 314.16`}
                    strokeDashoffset={-((statsAndAttention.completed / statsAndAttention.total) * 314.16)}
                    strokeLinecap="round"
                    className="transition-all duration-500 ease-out"
                  />
                )}
                {/* Segment 1: Completed */}
                {statsAndAttention.completed > 0 && (
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="transparent"
                    stroke="#10b981"
                    strokeWidth="10"
                    strokeDasharray={`${(statsAndAttention.completed / statsAndAttention.total) * 314.16} 314.16`}
                    strokeDashoffset="0"
                    strokeLinecap="round"
                    className="transition-all duration-500 ease-out"
                  />
                )}
              </>
            )}
          </svg>
          <div className="text-center">
            <span className="text-4xl font-extrabold text-slate-800">{statsAndAttention.percent}%</span>
            <span className="block text-xs uppercase tracking-wider font-bold text-slate-400 mt-1">Xong</span>
          </div>
        </div>
      </div>

      {/* Attention Tasks List */}
      <div className="border border-slate-200 rounded-lg p-5 bg-slate-50/40 flex flex-col h-72 shadow-2xs">
        {/* Header and Tabs */}
        <div className="shrink-0 space-y-3 mb-3">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <span>Công việc cần chú ý</span>
            {(statsAndAttention.overdueList.length > 0 || statsAndAttention.todayList.length > 0) && (
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            )}
          </h3>
          
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hover-only text-[10px] font-bold">
            <button
              onClick={() => setActiveTab("overdue")}
              className={`px-2.5 py-1 rounded-full border transition-all cursor-pointer select-none ${
                currentTab === "overdue"
                  ? "bg-red-100 text-red-800 border-red-200 shadow-3xs"
                  : "bg-white text-slate-500 border-slate-200 hover:bg-slate-100"
              }`}
            >
              Quá hạn ({statsAndAttention.overdueList.length})
            </button>
            <button
              onClick={() => setActiveTab("today")}
              className={`px-2.5 py-1 rounded-full border transition-all cursor-pointer select-none ${
                currentTab === "today"
                  ? "bg-amber-100 text-amber-800 border-amber-200 shadow-3xs"
                  : "bg-white text-slate-500 border-slate-200 hover:bg-slate-100"
              }`}
            >
              Hôm nay ({statsAndAttention.todayList.length})
            </button>
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`px-2.5 py-1 rounded-full border transition-all cursor-pointer select-none ${
                currentTab === "upcoming"
                  ? "bg-blue-100 text-blue-800 border-blue-200 shadow-3xs"
                  : "bg-white text-slate-500 border-slate-200 hover:bg-slate-100"
              }`}
            >
              Sắp tới ({statsAndAttention.upcomingList.length})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1 scrollbar-hover-only">
          {(() => {
            const list = 
              currentTab === "overdue" ? statsAndAttention.overdueList :
              currentTab === "today" ? statsAndAttention.todayList :
              statsAndAttention.upcomingList;

            if (list.length === 0) {
              return (
                <div className="h-full flex flex-col items-center justify-center text-center py-4 text-xs text-slate-500">
                  <span className="text-xl mb-1">🎉</span>
                  <span className="font-semibold text-emerald-600">Trống trải!</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">Không có công việc nào trong danh mục này.</span>
                </div>
              );
            }

            return list.map((item) => {
              let cardBg = "bg-purple-50 border-purple-100 hover:bg-purple-100/50 hover:border-purple-200";
              let titleColor = "text-purple-900";
              let subtitleColor = "text-purple-700/80";
              let badgeBg = "bg-purple-100 text-purple-800 border-purple-200";
              let badgeText = "Khẩn cấp";
              let rightText = item.priority === "Required" ? "Bắt buộc" : "Quan trọng";
              let rightColor = "text-purple-700 font-bold text-[10px]";

              if (currentTab === "overdue") {
                cardBg = "bg-red-50 border-red-100 hover:bg-red-100/50 hover:border-red-200";
                titleColor = "text-red-900";
                subtitleColor = "text-red-700/80";
                badgeBg = "bg-red-100 text-red-800 border-red-200";
                badgeText = "Quá hạn";
                const date = toUtcLocalDate(item.dueDate);
                rightText = date ? `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}` : "";
                rightColor = "text-red-700 font-bold text-[10px]";
              } else if (currentTab === "today") {
                cardBg = "bg-amber-50 border-amber-100 hover:bg-amber-100/50 hover:border-amber-200";
                titleColor = "text-amber-900";
                subtitleColor = "text-amber-700/80";
                badgeBg = "bg-amber-100 text-amber-800 border-amber-200";
                badgeText = "Hôm nay";
                const date = new Date(item.dueDate || "");
                rightText = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
                rightColor = "text-amber-700 font-bold text-[10px]";
              } else if (currentTab === "upcoming") {
                cardBg = "bg-blue-50 border-blue-100 hover:bg-blue-100/50 hover:border-blue-200";
                titleColor = "text-blue-900";
                subtitleColor = "text-blue-700/80";
                badgeBg = "bg-blue-100 text-blue-800 border-blue-200";
                badgeText = "Sắp tới";
                const date = toUtcLocalDate(item.dueDate);
                rightText = date ? `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}` : "";
                rightColor = "text-blue-700 font-bold text-[10px]";
              }

              return (
                <div
                  key={item.id}
                  onClick={() => onTaskClick(item)}
                  className={`flex items-center justify-between p-2 rounded-md border transition-colors cursor-pointer text-xs ${cardBg}`}
                >
                  <div className="flex flex-col min-w-0 max-w-[70%]">
                    <span className={`font-bold truncate ${titleColor}`}>{item.title}</span>
                    <span className={`text-[10px] truncate ${subtitleColor}`}>
                      Công việc: {item.parentTaskTitle} | Dự án: {item.projectName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`border text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${badgeBg}`}>
                      {badgeText}
                    </span>
                    <span className={rightColor}>{rightText}</span>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>
    </div>
  );
}
