"use client";

import * as React from "react";
import { Avatar } from "@/components/ui/Avatar";

export interface BoardToolbarProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  assignees: any[];
  selectedAssignee: string | null;
  setSelectedAssignee: (id: string | null) => void;
  selectedPriority: string | null;
  setSelectedPriority: (p: string | null) => void;
  selectedDueDateFilter: string | null;
  setSelectedDueDateFilter: (d: string | null) => void;
  onResetFilters: () => void;
  onCreateTaskClick: () => void;
  readOnly?: boolean;
  isPersonalProject?: boolean;
  sortBy?: string;
  onSortChange?: (val: string) => void;
}

/**
 * BoardToolbar — Thanh công cụ lọc và tương tác trên bảng Kanban.
 * Tách biệt theo quy định CODING_CONVENTIONS.md nhằm giữ file dưới 200 dòng.
 */
export function BoardToolbar({
  searchQuery,
  setSearchQuery,
  assignees,
  selectedAssignee,
  setSelectedAssignee,
  selectedPriority,
  setSelectedPriority,
  selectedDueDateFilter,
  setSelectedDueDateFilter,
  onResetFilters,
  onCreateTaskClick,
  readOnly = false,
  isPersonalProject = false,
  sortBy = "manual",
  onSortChange = () => {},
}: BoardToolbarProps) {
  const hasActiveFilters =
    !!searchQuery ||
    (!isPersonalProject && !!selectedAssignee) ||
    !!selectedPriority ||
    !!selectedDueDateFilter;


  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm kiếm nhanh..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-48 px-3 py-1.5 pl-8 text-xs border border-slate-300 rounded-[4px] bg-white text-[#292a2e] focus:outline-none focus:ring-1 focus:ring-[#1868db] placeholder:text-slate-400"
          />
          <svg className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>

        {/* Priority Filter */}
        <div className="relative">
          <svg className="absolute left-2.5 top-[9px] h-3.5 w-3.5 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21v8h-6l-1-1H5v6h-2z" />
          </svg>
          <select
            value={selectedPriority || ""}
            onChange={(e) => setSelectedPriority(e.target.value || null)}
            className="pl-7 pr-3 py-1.5 text-xs border border-slate-300 rounded-[4px] bg-white text-[#292a2e] focus:outline-none focus:ring-1 focus:ring-[#1868db] cursor-pointer"
          >
            <option value="">Tất cả độ ưu tiên</option>
            <option value="Required">Bắt buộc</option>
            <option value="Important">Quan trọng</option>
            <option value="Extended">Mở rộng</option>
          </select>
        </div>

        {/* Due Date Filter */}
        <div className="relative">
          <svg className="absolute left-2.5 top-[9px] h-3.5 w-3.5 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <select
            value={selectedDueDateFilter || ""}
            onChange={(e) => setSelectedDueDateFilter(e.target.value || null)}
            className="pl-7 pr-3 py-1.5 text-xs border border-slate-300 rounded-[4px] bg-white text-[#292a2e] focus:outline-none focus:ring-1 focus:ring-[#1868db] cursor-pointer"
          >
            <option value="">Tất cả hạn chót</option>
            <option value="overdue">Quá hạn</option>
            <option value="upcoming7">Sắp đến hạn (7 ngày)</option>
          </select>
        </div>

        {/* Sort Selector */}
        <div className="relative">
          <svg className="absolute left-2.5 top-[9px] h-3.5 w-3.5 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
          </svg>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="pl-7 pr-3 py-1.5 text-xs border border-slate-300 rounded-[4px] bg-white text-[#292a2e] focus:outline-none focus:ring-1 focus:ring-[#1868db] cursor-pointer font-semibold"
          >
            <option value="manual">Sắp xếp: Thủ công</option>
            <option value="dueDate">Sắp xếp: Hạn chót</option>
            <option value="priority">Sắp xếp: Độ ưu tiên</option>
          </select>
        </div>


        {/* Divider */}
        {!isPersonalProject && (
          <div className="h-6 w-[1px] bg-slate-200 mx-1 hidden sm:block" />
        )}

        {/* Assignees circles */}
        {!isPersonalProject && (
          <div className="flex items-center gap-1">
            <span className="text-xs text-[#505258] font-semibold mr-1">Người thực hiện:</span>
            <div className="flex -space-x-1.5 items-center">
              {assignees.map((user) => {
                const isSelected = selectedAssignee === user.id;
                return (
                  <button
                    key={user.id}
                    onClick={() => setSelectedAssignee(isSelected ? null : user.id)}
                    title={user.displayName}
                    className={`h-7 w-7 rounded-full border-2 transition-all cursor-pointer ${
                      isSelected ? "border-[#1868db] scale-110 z-10" : "border-white hover:border-slate-300"
                    }`}
                  >
                    <Avatar
                      src={user.avatar}
                      alt={user.displayName}
                      className="h-full w-full rounded-full"
                    />
                  </button>
                );
              })}
              
              {/* Unassigned button (avatar trống) */}
              <button
                onClick={() => setSelectedAssignee(selectedAssignee === "unassigned" ? null : "unassigned")}
                title="Công việc hoặc subtask chưa phân công"
                className={`h-7 w-7 rounded-full border-2 border-dashed transition-all cursor-pointer flex items-center justify-center bg-slate-50 hover:bg-slate-100 hover:border-slate-400 ml-1.5 ${
                  selectedAssignee === "unassigned" ? "border-[#1868db] bg-blue-50/50 scale-110 z-10" : "border-slate-300"
                }`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={selectedAssignee === "unassigned" ? "text-[#1868db]" : "text-slate-400"}>
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </button>
            </div>
          </div>
        )}


        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="ml-2 text-xs font-semibold text-[#1868db] hover:underline cursor-pointer flex items-center gap-1"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            Xóa bộ lọc
          </button>
        )}
      </div>

      {/* Create Task Button */}
      {!readOnly && (
        <button
          onClick={onCreateTaskClick}
          className="bg-[#1868db] hover:bg-[#0052cc] text-white text-xs font-bold px-3 py-1.5 rounded-[4px] cursor-pointer transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Tạo công việc</span>
        </button>
      )}
    </div>
  );
}
