"use client";

/**
 * @component MyTasksList
 * @description Hiển thị danh sách công việc được gom nhóm, hỗ trợ click mở chi tiết và checkbox hoàn thành nhanh.
 */

import * as React from "react";
import { getTaskPriorityLabel } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  projectId: string;
  projectName: string;
  columnName: string;
  columnIsDone: boolean;
  priority: string | null;
  dueDate: string | null;
}

interface MyTasksListProps {
  groupedTasks: {
    overdue: Task[];
    today: Task[];
    upcoming: Task[];
    later: Task[];
  };
  selectedTaskId: string | null;
  onTaskClick: (taskId: string) => void;
}

export function MyTasksList({
  groupedTasks,
  selectedTaskId,
  onTaskClick,
}: MyTasksListProps) {
  const groups = [
    {
      title: "Quá hạn",
      data: groupedTasks.overdue,
      color: "bg-rose-500 text-rose-700",
      empty: "Không có công việc quá hạn",
    },
    {
      title: "Hôm nay",
      data: groupedTasks.today,
      color: "bg-[#1868db] text-[#1868db]",
      empty: "Không có công việc trong hôm nay",
    },
    {
      title: "Tuần này",
      data: groupedTasks.upcoming,
      color: "bg-purple-500 text-purple-700",
      empty: "Không có công việc nào trong tuần này",
    },
    {
      title: "Khác / Chưa có hạn chót",
      data: groupedTasks.later,
      color: "bg-slate-400 text-slate-600",
      empty: "Không có công việc nào khác",
    },
  ];

  const formatDisplayDate = (dateStr: string | null) => {
    if (!dateStr) return "Không hạn chót";
    return new Date(dateStr).toLocaleDateString("vi-VN");
  };

  const getPriorityStyle = (priority: string | null) => {
    if (!priority) return "bg-slate-50 text-slate-400 border-slate-100";
    const p = priority.toLowerCase();
    if (p === "required") {
      return "bg-red-50 text-red-700 border-red-200";
    }
    if (p === "important") {
      return "bg-blue-50 text-blue-700 border-blue-200";
    }
    if (p === "extended") {
      return "bg-slate-50 text-slate-600 border-slate-200";
    }
    return "bg-slate-50 text-slate-400 border-slate-100";
  };

  const getPriorityLabel = (priority: string | null) => {
    return getTaskPriorityLabel(priority);
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-5 custom-chat-scrollbar">
      {groups.map((group, idx) => (
        <div key={idx} className="space-y-1.5">
          <div className="flex items-center gap-1.5 pl-1">
            <span className={`h-1.5 w-1.5 rounded-full ${group.color.split(" ")[0]}`} />
            <h3 className={`text-[10px] font-extrabold uppercase tracking-wider ${group.color.split(" ")[1]}`}>
              {group.title} ({group.data.length})
            </h3>
          </div>
          <div className="border border-slate-200/60 rounded-md overflow-hidden divide-y divide-slate-100 bg-white">
            {group.data.length > 0 ? (
              group.data.map((task) => {
                const isSelected = selectedTaskId === task.id;
                return (
                  <div
                    key={task.id}
                    onClick={() => onTaskClick(task.id)}
                    className={`px-3 py-2.5 hover:bg-slate-50/70 transition-all flex items-center justify-between gap-3 cursor-pointer group relative ${
                      isSelected
                        ? "bg-slate-50/90 border-l-[3px] border-[#1868db]"
                        : "border-l-[3px] border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">


                      {/* Title & tags */}
                      <span
                        className={`text-xs font-semibold truncate transition-colors ${
                          task.columnIsDone
                            ? "line-through text-slate-400"
                            : "text-[#292a2e]"
                        }`}
                      >
                        {task.title}
                      </span>
                      <span className="px-1.5 py-0.5 rounded-[3px] text-[8px] font-extrabold bg-slate-100 text-slate-600 border border-slate-200/60 uppercase shrink-0">
                        {task.projectName}
                      </span>
                      <span className="px-1 py-0.5 rounded-[3px] text-[8px] font-bold bg-blue-50 text-[#1868db] border border-blue-100/50 shrink-0">
                        {task.columnName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      {task.priority && (
                        <span
                          className={`px-1.5 py-0.5 rounded-[3px] text-[8px] font-extrabold border ${getPriorityStyle(
                            task.priority
                          )}`}
                        >
                          {getPriorityLabel(task.priority)}
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-extrabold shrink-0 ${
                          !task.columnIsDone &&
                          task.dueDate &&
                          new Date(task.dueDate) < new Date()
                            ? "text-red-500"
                            : "text-slate-400"
                        }`}
                      >
                        {formatDisplayDate(task.dueDate)}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-3 text-center text-xs text-slate-400 italic bg-slate-50/10">
                {group.empty}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
