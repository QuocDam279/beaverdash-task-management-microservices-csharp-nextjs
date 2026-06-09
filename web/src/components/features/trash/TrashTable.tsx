"use client";

import * as React from "react";

import { TrashTask } from "@/hooks/useTrashTasks";

export interface TrashTableProps {
  tasks: TrashTask[];
  selectedIds: string[];
  onSelectRow: (id: string) => void;
  onSelectAll: (checked: boolean) => void;
  onRestore: (id: string) => void;
  onPermanentDelete: (id: string) => void;
}

/**
 * @component TrashTable
 * @description Bảng dữ liệu danh sách các công việc đã bị xóa mềm.
 */
export function TrashTable({
  tasks,
  selectedIds,
  onSelectRow,
  onSelectAll,
  onRestore,
  onPermanentDelete,
}: TrashTableProps) {
  const isAllSelected = tasks.length > 0 && selectedIds.length === tasks.length;
  const isSomeSelected = selectedIds.length > 0 && selectedIds.length < tasks.length;

  const handleSelectAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSelectAll(e.target.checked);
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto border border-slate-200 dark:border-[#2c3338] rounded-lg shadow-2xs custom-chat-scrollbar" style={{ scrollbarGutter: "stable" }}>
      {tasks.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-400 dark:text-slate-500 italic bg-white dark:bg-[#1d2125] select-none">
          Không tìm thấy công việc nào phù hợp với bộ lọc
        </div>
      ) : (
        <table className="w-full text-left border-collapse bg-white dark:bg-[#1d2125]">
          <thead>
            <tr className="bg-slate-50/75 dark:bg-[#161a1d] text-[10px] font-bold text-[#6b6e76] dark:text-[#8c9bab] uppercase tracking-wider border-b border-slate-200 dark:border-[#2c3338] select-none">
              {/* Checkbox Header */}
              <th className="w-12 px-4 py-3.5 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isSomeSelected;
                  }}
                  onChange={handleSelectAllChange}
                  className="h-3.5 w-3.5 rounded border-slate-350 dark:border-[#454f59] text-[#1868db] dark:text-[#579dff] focus:ring-[#1868db] dark:focus:ring-[#579dff] cursor-pointer"
                />
              </th>
              <th className="px-6 py-3.5">Tiêu đề công việc</th>
              <th className="px-6 py-3.5">Cột trạng thái</th>
              <th className="px-6 py-3.5">Thời gian xóa</th>
              <th className="px-6 py-3.5 w-44">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-[#2c3338] text-xs font-semibold text-[#292a2e] dark:text-[#deebff]">
            {tasks.map((task) => {
              const isChecked = selectedIds.includes(task.id);
              const formattedTime = new Date(task.deletedAt).toLocaleString("vi-VN", {
                year: "numeric",
                month: "numeric",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <tr
                  key={task.id}
                  className={`hover:bg-slate-50/50 dark:hover:bg-[#2c3338]/40 transition-colors group ${
                    isChecked ? "bg-blue-50/20 dark:bg-blue-950/15 hover:bg-blue-50/30 dark:hover:bg-blue-950/25" : ""
                  }`}
                >
                  {/* Checkbox Row */}
                  <td className="px-4 py-4 text-center select-none" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onSelectRow(task.id)}
                      className="h-3.5 w-3.5 rounded border-slate-350 dark:border-[#454f59] text-[#1868db] dark:text-[#579dff] focus:ring-[#1868db] dark:focus:ring-[#579dff] cursor-pointer"
                    />
                  </td>

                  {/* Tiêu đề & Dự án phụ */}
                  <td className="px-6 py-4 max-w-sm">
                    <div className="flex flex-col gap-1 min-w-0">
                      <span
                        className="font-bold text-slate-800 dark:text-[#deebff] truncate"
                        title={task.title}
                      >
                        {task.title}
                      </span>
                      <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-wide">
                        {task.projectName}
                      </span>
                    </div>
                  </td>

                  {/* Badge Trạng thái */}
                  <td className="px-6 py-4 select-none">
                    {task.isCompleted ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                        Đã hoàn thành
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-50 dark:bg-[#2c3338] text-slate-500 dark:text-[#a5adba] border border-slate-200 dark:border-[#353e47]">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
                        Chưa thực hiện
                      </span>
                    )}
                  </td>

                  {/* Thời gian xóa */}
                  <td className="px-6 py-4 text-slate-400 dark:text-slate-500 font-medium select-none">
                    {formattedTime}
                  </td>

                  {/* Nút hành động */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5">
                      {/* Khôi phục */}
                      <button
                        onClick={() => onRestore(task.id)}
                        className="text-slate-500 dark:text-[#a5adba] hover:text-[#1868db] dark:hover:text-[#579dff] hover:bg-slate-100/80 dark:hover:bg-[#2c3338]/60 px-2 py-1 rounded transition-colors cursor-pointer text-xs font-bold flex items-center gap-1 border border-transparent hover:border-slate-200 dark:hover:border-[#353e47]"
                        title="Khôi phục công việc về bảng"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="23 4 23 10 17 10"></polyline>
                          <polyline points="1 20 1 14 7 14"></polyline>
                          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                        </svg>
                        Khôi phục
                      </button>

                      {/* Xóa vĩnh viễn */}
                      {task.canPermanentDelete && (
                        <button
                          onClick={() => onPermanentDelete(task.id)}
                          className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-all duration-150 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-[#f87171] hover:bg-red-50 dark:hover:bg-red-950/20 p-1.5 rounded border border-transparent hover:border-red-200 dark:hover:border-red-900 cursor-pointer"
                          title="Xóa vĩnh viễn khỏi cơ sở dữ liệu"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      )}
                    </div>
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
