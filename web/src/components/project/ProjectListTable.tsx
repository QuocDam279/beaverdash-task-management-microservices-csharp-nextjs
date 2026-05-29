"use client";

/**
 * @component ProjectListTable
 * @description Hiển thị bảng công việc mật độ cao dạng spreadsheet.
 */

import * as React from "react";
import { TaskItem, BoardColumn } from "@/types/task";
import { Avatar } from "@/components/ui/Avatar";
import { getTaskPriorityLabel } from "@/lib/utils";

interface ProjectListTableProps {
  tasks: TaskItem[];
  columns: BoardColumn[];
  onTaskClick: (task: TaskItem) => void;
  isPersonalProject?: boolean;
  showProjectColumn?: boolean;
}

export function ProjectListTable({
  tasks,
  columns,
  onTaskClick,
  isPersonalProject = false,
  showProjectColumn = false,
}: ProjectListTableProps) {
  const getStatusName = (columnId: string): string => {
    return columns.find((c) => c.id === columnId)?.name || "Chưa rõ";
  };

  const renderPriorityBadge = (priority: string | null) => {
    if (!priority) return null;
    const p = priority.toLowerCase();
    const label = getTaskPriorityLabel(priority);
    let badgeClass = "bg-slate-50 text-slate-600 border-slate-200 font-medium";
    if (p === "required") {
      badgeClass = "bg-red-50 text-red-700 border-red-200 font-extrabold";
    } else if (p === "important") {
      badgeClass = "bg-blue-50 text-blue-700 border-blue-200 font-bold";
    } else if (p === "extended") {
      badgeClass = "bg-slate-50 text-slate-600 border-slate-200 font-medium";
    }
    return (
      <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] uppercase border tracking-wide ${badgeClass}`}>
        {label}
      </span>
    );
  };

  const renderStatusBadge = (columnId: string, columnName?: string) => {
    const name = columnName || getStatusName(columnId);
    let badgeClass = "bg-slate-100 text-slate-700 border-slate-200";
    if (name.includes("Hoàn thành") || name.toLowerCase().includes("done")) {
      badgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200 font-bold";
    } else if (name.includes("Đang") || name.toLowerCase().includes("progress")) {
      badgeClass = "bg-blue-50 text-blue-700 border-blue-200 font-bold";
    }
    return (
      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] uppercase border tracking-wider font-semibold ${badgeClass}`}>
        {name}
      </span>
    );
  };

  const renderDate = (dateStr: string | null, isDueDate = false) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const text = `${day}/${month}`;
    if (isDueDate) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      if (target < today) {
        return <span className="text-red-600 font-bold font-sans" title="Quá hạn">{text} ⚠️</span>;
      }
    }
    return <span className="text-slate-600 font-medium">{text}</span>;
  };

  const getTaskAssignees = (task: TaskItem) => {
    const list: any[] = [];
    const seen = new Set<string>();
    
    if (task.assigneeUser && task.assigneeUser.id) {
      seen.add(task.assigneeUser.id);
      list.push(task.assigneeUser);
    } else if ((task as any).assigneeUserId) {
      seen.add((task as any).assigneeUserId);
      list.push({
        id: (task as any).assigneeUserId,
        displayName: (task as any).assigneeName || "Thành viên",
        avatar: (task as any).assigneeAvatar,
      });
    }
    
    if (task.subTasks) {
      task.subTasks.forEach((st) => {
        if (st.assigneeUserId && !seen.has(st.assigneeUserId)) {
          seen.add(st.assigneeUserId);
          list.push(st.assigneeUser || {
            id: st.assigneeUserId,
            displayName: (st as any).assigneeName || "Thành viên",
            avatar: (st as any).assigneeAvatar,
          });
        }
      });
    }
    return list;
  };

  return (
    <div className="flex-1 min-h-0 overflow-auto border border-slate-200 rounded-[6px] shadow-2xs">
      {tasks.length === 0 ? (
        <div className="py-16 text-center text-slate-500 font-semibold italic">
          Không có công việc nào thỏa mãn bộ lọc.
        </div>
      ) : (
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider sticky top-0 z-10 select-none">
            <tr>
              <th className="py-2.5 px-4 w-[35%] min-w-[200px]">
                Tiêu đề
              </th>
              {showProjectColumn && (
                <th className="py-2.5 px-4 w-[12%] min-w-[100px]">
                  Dự án
                </th>
              )}
              {!isPersonalProject && (
                <th className="py-2.5 px-4 w-[15%] min-w-[120px] text-center">
                  Người thực hiện
                </th>
              )}
              <th className="py-2.5 px-4 w-[15%] min-w-[120px] text-center">
                Trạng thái
              </th>
              <th className="py-2.5 px-4 w-[12%] min-w-[100px] text-center">
                Ưu tiên
              </th>
              <th className="py-2.5 px-4 w-[9%] min-w-[80px]">Bắt đầu</th>
              <th className="py-2.5 px-4 w-[9%] min-w-[85px]">
                Hạn chót
              </th>
              <th className="py-2.5 px-4 w-[9%] min-w-[80px] text-center">Việc con</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {tasks.map((t) => {
              const subTasksCount = (t as any).subTasksCount || (t.subTasks ? t.subTasks.length : 0);
              const completedSubTasksCount = (t as any).completedSubTasksCount || (t.subTasks ? t.subTasks.filter(st => st.isCompleted).length : 0);
              const taskAssignees = getTaskAssignees(t);
              
              return (
                <tr
                  key={t.id}
                  onClick={() => onTaskClick(t)}
                  className="hover:bg-blue-50/20 transition-colors cursor-pointer"
                >
                  <td className="py-3 px-4 font-semibold text-[#292a2e] max-w-xs truncate">
                    {t.title}
                  </td>
                  {showProjectColumn && (
                    <td className="py-3 px-4 text-slate-500 font-bold max-w-xs truncate">
                      {(t as any).projectName || "-"}
                    </td>
                  )}
                  {!isPersonalProject && (
                    <td className="py-3 px-4 text-center">
                      <div className="flex -space-x-1.5 justify-center items-center">
                        {taskAssignees.length > 0 ? (
                          taskAssignees.map((user) => (
                            <Avatar
                              key={user.id}
                              src={user.avatar}
                              alt={user.displayName}
                              title={user.displayName}
                              className="h-6 w-6 rounded-full border border-white hover:z-10 transition-all scale-95"
                            />
                          ))
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </div>
                    </td>
                  )}
                  <td className="py-3 px-4 text-center">{renderStatusBadge(t.boardColumnId, (t as any).columnName)}</td>
                  <td className="py-3 px-4 text-center">{renderPriorityBadge(t.priority)}</td>
                  <td className="py-3 px-4">{renderDate(t.startDate)}</td>
                  <td className="py-3 px-4">{renderDate(t.dueDate, true)}</td>
                  <td className="py-3 px-4 text-center">
                    {subTasksCount > 0 && (
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="font-bold text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-sm">
                          {completedSubTasksCount}/{subTasksCount}
                        </span>
                        {(() => {
                          const unassignedCount = t.subTasks
                            ? t.subTasks.filter((st) => !st.assigneeUserId && !st.isCompleted).length
                            : 0;
                          if (unassignedCount > 0) {
                            return (
                              <span 
                                className="text-amber-600 bg-amber-50 border border-amber-200 px-1 py-[1px] rounded text-[9px] font-bold flex items-center" 
                                title={`Có ${unassignedCount} công việc con chưa phân công`}
                              >
                                ⚠️ {unassignedCount}
                              </span>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    )}
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
