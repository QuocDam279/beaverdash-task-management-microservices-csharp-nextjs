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
  activeSprintName?: string | null;
  activeSprintEndDate?: string | null;
  sprints?: any[];
  selectedSprintId?: string;
  setSelectedSprintId?: (id: string) => void;
  onCloseSprintClick?: () => void;
  groupBy?: string;
  onGroupByChange?: (val: string) => void;
}

/**
 * BoardToolbar — Thanh công cụ lọc và tương tác trên bảng Kanban,
 * sử dụng kiểu bộ lọc flyout và nút sắp xếp tuỳ chỉnh giống trang công việc cá nhân.
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
  // onCreateTaskClick,
  readOnly = false,
  isPersonalProject = false,
  sortBy = "dueDate",
  onSortChange = () => {},
  activeSprintName = null,
  activeSprintEndDate = null,
  sprints = [],
  selectedSprintId = "active",
  setSelectedSprintId = () => {},
  onCloseSprintClick,
  groupBy = "none",
  onGroupByChange = () => {},
}: BoardToolbarProps) {
  // Popover State
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const [isViewOptionsOpen, setIsViewOptionsOpen] = React.useState(false);

  const closePopovers = () => {
    setIsFilterOpen(false);
    setIsViewOptionsOpen(false);
  };

  const hasAnyFilterActive =
    !!selectedPriority ||
    !!selectedDueDateFilter;

  const hasActiveFilters =
    !!searchQuery ||
    (!isPersonalProject && !!selectedAssignee) ||
    hasAnyFilterActive;

  const getSprintDaysLeft = (endDateStr: string | null) => {
    if (!endDateStr) return null;
    const endDate = new Date(endDateStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return "Đã quá hạn";
    if (diffDays === 0) return "Hôm nay kết thúc";
    return `Còn ${diffDays} ngày`;
  };

  return (
    <div className="flex flex-col gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-[#2c3338] select-none">
      {/* Row 1: Sprint selector, close sprint, days left, and Assignees filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left Side: Sprint Group */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Sprint Filter Dropdown */}
          <div className="relative select-none">
            <select
              value={selectedSprintId}
              onChange={(e) => setSelectedSprintId(e.target.value)}
              className="appearance-none pl-8 pr-8 py-1.5 rounded-[4px] bg-indigo-50/60 hover:bg-indigo-100/70 dark:bg-indigo-950/10 dark:hover:bg-indigo-900/20 border border-indigo-150 dark:border-indigo-900/30 text-xs font-bold text-indigo-700 dark:text-indigo-300 focus:outline-none transition-all cursor-pointer"
            >
              <option value="active" className="bg-white dark:bg-[#22272b] text-[#292a2e] dark:text-[#deebff] font-semibold">
                Sprint đang hoạt động {activeSprintName ? `(${activeSprintName})` : "(Trống)"}
              </option>
              <option value="00000000-0000-0000-0000-000000000000" className="bg-white dark:bg-[#22272b] text-[#292a2e] dark:text-[#deebff]">
                Product Backlog (Danh sách tồn đọng)
              </option>
              {sprints && sprints.length > 0 && (
                <optgroup label="Danh sách Sprint" className="bg-white dark:bg-[#22272b] text-slate-400 dark:text-slate-500 font-bold">
                  {sprints
                    .filter((s) => s.status !== "Active")
                    .map((s) => (
                      <option key={s.id} value={s.id} className="text-[#292a2e] dark:text-[#deebff] font-medium">
                        {s.name} {s.status === "Closed" ? "(Đã đóng)" : "(Chưa chạy)"}
                      </option>
                    ))
                  }
                </optgroup>
              )}
            </select>
            <div className="absolute left-2.5 top-2 pointer-events-none select-none">
              {(() => {
                if (selectedSprintId === "active") {
                  return (
                    <svg className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                  );
                }
                if (selectedSprintId === "00000000-0000-0000-0000-000000000000") {
                  return (
                    <svg className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <polygon points="12 2 2 7 12 12 22 7 12 2" />
                      <polyline points="2 17 12 22 22 17" />
                      <polyline points="2 12 12 17 22 12" />
                    </svg>
                  );
                }
                const isClosed = sprints.find(s => s.id === selectedSprintId)?.status === "Closed";
                if (isClosed) {
                  return (
                    <svg className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                      <path d="m9 13 2 2 4-4" />
                    </svg>
                  );
                }
                return (
                  <svg className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                );
              })()}
            </div>
            <svg className="absolute right-2 top-2.5 h-3 w-3 text-indigo-500 pointer-events-none select-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>

          {/* Active Sprint Days Left Badge */}
          {selectedSprintId === "active" && activeSprintEndDate && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-indigo-50/60 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 text-[10.5px] font-bold border border-indigo-100 dark:border-indigo-900/40" title="Thời hạn Sprint">
              <svg className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>{getSprintDaysLeft(activeSprintEndDate)}</span>
            </span>
          )}

          {/* Complete Sprint Button (only visible for active sprint view) */}
          {selectedSprintId === "active" && activeSprintName && !readOnly && onCloseSprintClick && (
            <button
              onClick={onCloseSprintClick}
              className="px-2.5 py-1.5 text-xs font-bold border border-red-200 dark:border-red-900/30 text-red-650 dark:text-red-400 bg-red-50/20 dark:bg-red-950/10 hover:bg-red-50 dark:hover:bg-red-950/35 hover:border-red-300 dark:hover:border-red-900/50 rounded-[4px] cursor-pointer transition-colors flex items-center gap-1.5"
              title="Kết thúc Sprint này và xử lý các công việc dở dang"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>Kết thúc Sprint</span>
            </button>
          )}
        </div>

        {/* Right Side: Team Filters */}
        {!isPersonalProject && assignees && assignees.length > 0 && (
          <div className="flex items-center gap-3">
            <div className="h-4 w-[1px] bg-slate-200 dark:bg-[#353e47] hidden sm:block" />
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold hidden md:inline">Thực hiện:</span>
              <div className="flex -space-x-1.5 items-center">
                {assignees.map((user) => {
                  const isSelected = selectedAssignee === user.id;
                  return (
                    <button
                      key={user.id}
                      onClick={() => setSelectedAssignee(isSelected ? null : user.id)}
                      title={user.displayName}
                      className={`h-7 w-7 rounded-full border-2 transition-all cursor-pointer ${
                        isSelected ? "border-[#1868db] dark:border-[#579dff] scale-110 z-10" : "border-white dark:border-[#22272b] hover:border-slate-300 dark:hover:border-[#353e47]"
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
                
                {/* Unassigned button */}
                <button
                  onClick={() => setSelectedAssignee(selectedAssignee === "unassigned" ? null : "unassigned")}
                  title="Công việc hoặc subtask chưa phân công"
                  className={`h-7 w-7 rounded-full border-2 border-dashed transition-all cursor-pointer flex items-center justify-center bg-slate-50 dark:bg-[#22272b] hover:bg-slate-100 dark:hover:bg-[#2c3338] hover:border-slate-400 dark:hover:border-[#353e47] ml-1.5 ${
                    selectedAssignee === "unassigned" ? "border-[#1868db] dark:border-[#579dff] bg-blue-50/50 dark:bg-blue-950/20 scale-110 z-10" : "border-slate-300 dark:border-[#353e47]"
                  }`}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={selectedAssignee === "unassigned" ? "text-[#1868db] dark:text-[#579dff]" : "text-slate-400"}>
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Row 2: Search, Filters & View Options */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* Left: Search Bar */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Tìm kiếm nhanh..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-1.5 pl-8 text-xs border border-slate-200 dark:border-[#353e47] rounded-[4px] bg-white dark:bg-[#22272b] text-[#292a2e] dark:text-[#deebff] focus:outline-none focus:ring-1 focus:ring-[#1868db] dark:focus:ring-[#579dff] placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
          <svg className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>

        {/* Right: Consolidated Filter & View Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {/* 1. Filter Button */}
          <div className="relative">
            <button
              onClick={() => {
                setIsFilterOpen(!isFilterOpen);
                setIsViewOptionsOpen(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs border rounded-[4px] font-semibold bg-white dark:bg-[#22272b] cursor-pointer transition-all ${
                hasAnyFilterActive
                  ? "border-[#1868db] dark:border-[#579dff] text-[#1868db] dark:text-[#579dff] bg-blue-50/30 dark:bg-blue-950/20"
                  : "border-slate-200 dark:border-[#353e47] text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-500"
              }`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              <span>Bộ lọc</span>
              {hasAnyFilterActive && (
                <span className="h-1.5 w-1.5 rounded-full bg-[#1868db] dark:bg-[#579dff] ml-0.5 animate-pulse" />
              )}
            </button>

            {isFilterOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={closePopovers} />
                <div className="absolute right-0 mt-1.5 w-56 rounded-md border border-slate-200 dark:border-[#353e47] bg-white dark:bg-[#22272b] shadow-lg z-20 py-2.5 animate-in fade-in slide-in-from-top-1 duration-150 text-xs text-[#292a2e] dark:text-[#deebff]">
                  
                  {/* PRIORITY SECTION */}
                  <div className="px-3 pb-2">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase block mb-1.5">Đo độ ưu tiên</span>
                    <div className="space-y-1">
                      {[
                        { value: "", label: "Tất cả độ ưu tiên" },
                        { value: "Required", label: "Bắt buộc" },
                        { value: "Important", label: "Quan trọng" },
                        { value: "Extended", label: "Mở rộng" },
                      ].map((item) => (
                        <div
                          key={item.value}
                          onClick={() => {
                            setSelectedPriority(item.value || null);
                            closePopovers();
                          }}
                          className={`px-2.5 py-1.5 rounded hover:bg-slate-50 dark:hover:bg-[#2c3338] cursor-pointer flex items-center justify-between transition-colors ${
                            (selectedPriority || "") === item.value ? "text-[#1868db] dark:text-[#579dff] bg-blue-50/20 dark:bg-blue-950/10 font-bold" : "text-slate-600 dark:text-slate-400 font-medium"
                          }`}
                        >
                          <span>{item.label}</span>
                          {(selectedPriority || "") === item.value && <span className="text-[#1868db] dark:text-[#579dff]">✓</span>}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="h-[1px] bg-slate-100 dark:bg-[#353e47] my-1.5" />

                  {/* DUE DATE SECTION */}
                  <div className="px-3 pt-1">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase block mb-1.5">Hạn chót</span>
                    <div className="space-y-1">
                      {[
                        { value: "", label: "Tất cả hạn chót" },
                        { value: "overdue", label: "Quá hạn" },
                        { value: "upcoming7", label: "Sắp đến hạn (7 ngày)" },
                      ].map((item) => (
                        <div
                          key={item.value}
                          onClick={() => {
                            setSelectedDueDateFilter(item.value || null);
                            closePopovers();
                          }}
                          className={`px-2.5 py-1.5 rounded hover:bg-slate-50 dark:hover:bg-[#2c3338] cursor-pointer flex items-center justify-between transition-colors ${
                            (selectedDueDateFilter || "") === item.value ? "text-[#1868db] dark:text-[#579dff] bg-blue-50/20 dark:bg-blue-950/10 font-bold" : "text-slate-600 dark:text-slate-400 font-medium"
                          }`}
                        >
                          <span>{item.label}</span>
                          {(selectedDueDateFilter || "") === item.value && <span className="text-[#1868db] dark:text-[#579dff]">✓</span>}
                        </div>
                      ))}
                    </div>
                  </div>

                  {hasAnyFilterActive && (
                    <>
                      <div className="h-[1px] bg-slate-150 dark:bg-[#353e47] my-1.5" />
                      <div className="px-3 pt-1">
                        <button
                          onClick={() => {
                            setSelectedPriority(null);
                            setSelectedDueDateFilter(null);
                            closePopovers();
                          }}
                          className="w-full py-1.5 px-2 text-center text-red-650 dark:text-red-405 font-bold bg-red-50/30 dark:bg-red-950/20 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition-colors cursor-pointer"
                        >
                          Xóa bộ lọc
                        </button>
                      </div>
                    </>
                  )}

                </div>
              </>
            )}
          </div>

          {/* 2. Display Options Button (Group by & Sort by combined) */}
          <div className="relative">
            <button
              onClick={() => {
                setIsViewOptionsOpen(!isViewOptionsOpen);
                setIsFilterOpen(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs border rounded-[4px] font-semibold bg-white dark:bg-[#22272b] cursor-pointer transition-all ${
                groupBy !== "none" || sortBy !== "dueDate"
                  ? "border-[#1868db] dark:border-[#579dff] text-[#1868db] dark:text-[#579dff] bg-blue-50/30 dark:bg-blue-950/20"
                  : "border-slate-200 dark:border-[#353e47] text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-500"
              }`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" />
              </svg>
              <span>Hiển thị</span>
              {(groupBy !== "none" || sortBy !== "dueDate") && (
                <span className="h-1.5 w-1.5 rounded-full bg-[#1868db] dark:bg-[#579dff] ml-0.5 animate-pulse" />
              )}
            </button>

            {isViewOptionsOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={closePopovers} />
                <div className="absolute right-0 mt-1.5 w-56 rounded-md border border-slate-200 dark:border-[#353e47] bg-white dark:bg-[#22272b] shadow-lg z-20 py-2.5 animate-in fade-in slide-in-from-top-1 duration-150 text-xs text-[#292a2e] dark:text-[#deebff]">
                  
                  {/* GROUP BY SECTION */}
                  <div className="px-3 pb-2">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase block mb-1.5">Nhóm theo</span>
                    <div className="space-y-1">
                      {[
                        { value: "none", label: "Bình thường" },
                        { value: "subtask", label: "Nhiệm vụ" },
                      ].map((item) => (
                        <div
                          key={item.value}
                          onClick={() => {
                            onGroupByChange(item.value);
                            closePopovers();
                          }}
                          className={`px-2.5 py-1.5 rounded hover:bg-slate-50 dark:hover:bg-[#2c3338] cursor-pointer flex items-center justify-between transition-colors ${
                            groupBy === item.value ? "text-[#1868db] dark:text-[#579dff] bg-blue-50/20 dark:bg-blue-950/10 font-bold" : "text-slate-600 dark:text-slate-400 font-medium"
                          }`}
                        >
                          <span>{item.label}</span>
                          {groupBy === item.value && <span className="text-[#1868db] dark:text-[#579dff]">✓</span>}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="h-[1px] bg-slate-100 dark:bg-[#353e47] my-1.5" />

                  {/* SORT BY SECTION */}
                  <div className="px-3 pt-1">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase block mb-1.5">Sắp xếp theo</span>
                    <div className="space-y-1">
                      {[
                        { value: "dueDate", label: "Hạn chót" },
                        { value: "priority", label: "Độ ưu tiên" },
                      ].map((item) => (
                        <div
                          key={item.value}
                          onClick={() => {
                            onSortChange(item.value);
                            closePopovers();
                          }}
                          className={`px-2.5 py-1.5 rounded hover:bg-slate-50 dark:hover:bg-[#2c3338] cursor-pointer flex items-center justify-between transition-colors ${
                            sortBy === item.value ? "text-[#1868db] dark:text-[#579dff] bg-blue-50/20 dark:bg-blue-950/10 font-bold" : "text-slate-600 dark:text-slate-400 font-medium"
                          }`}
                        >
                          <span>{item.label}</span>
                          {sortBy === item.value && <span className="text-[#1868db] dark:text-[#579dff]">✓</span>}
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </>
            )}
          </div>

          {/* Clear Filters Link */}
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="ml-1 text-xs font-semibold text-[#1868db] dark:text-[#579dff] hover:underline cursor-pointer flex items-center gap-1"
              title="Xóa tất cả bộ lọc và tìm kiếm"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              <span className="hidden md:inline">Xóa bộ lọc</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
