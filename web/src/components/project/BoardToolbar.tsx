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
  onCreateTaskClick,
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
}: BoardToolbarProps) {
  // Popover State
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const [isSortOpen, setIsSortOpen] = React.useState(false);
  const [activeSubMenu, setActiveSubMenu] = React.useState<string | null>(null);

  const closePopovers = () => {
    setIsFilterOpen(false);
    setIsSortOpen(false);
    setActiveSubMenu(null);
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
    <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-[#2c3338] select-none">
      <div className="flex flex-wrap items-center gap-3">
        {/* Sprint Filter Dropdown */}
        <div className="relative mr-1 select-none">
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
          <div className="absolute left-2.5 top-1.5 text-xs pointer-events-none select-none">
            {selectedSprintId === "active" ? "🏃" : selectedSprintId === "00000000-0000-0000-0000-000000000000" ? "📅" : sprints.find(s => s.id === selectedSprintId)?.status === "Closed" ? "📁" : "🔮"}
          </div>
          <svg className="absolute right-2 top-2 h-3.5 w-3.5 text-indigo-500 pointer-events-none select-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>

        {/* Complete Sprint Button (only visible for active sprint view) */}
        {selectedSprintId === "active" && activeSprintName && !readOnly && onCloseSprintClick && (
          <button
            onClick={onCloseSprintClick}
            className="px-3 py-1.5 text-xs font-bold border border-red-200 dark:border-red-900/30 text-red-650 dark:text-red-400 bg-red-50/20 dark:bg-red-950/10 hover:bg-red-50 dark:hover:bg-red-950/35 hover:border-red-300 dark:hover:border-red-900/50 rounded-[4px] cursor-pointer transition-colors flex items-center gap-1.5"
            title="Kết thúc Sprint này và xử lý các công việc dở dang"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>Kết thúc Sprint</span>
          </button>
        )}

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm kiếm nhanh..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-48 px-3 py-1.5 pl-8 text-xs border border-slate-200 dark:border-[#353e47] rounded-[4px] bg-white dark:bg-[#22272b] text-[#292a2e] dark:text-[#deebff] focus:outline-none focus:ring-1 focus:ring-[#1868db] dark:focus:ring-[#579dff] placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
          <svg className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>

        {/* 1. Filter Button */}
        <div className="relative">
          <button
            onClick={() => {
              setIsFilterOpen(!isFilterOpen);
              setIsSortOpen(false);
              setActiveSubMenu(null);
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
              <div
                className="absolute left-0 mt-1.5 w-48 rounded-md border border-slate-200 dark:border-[#353e47] bg-white dark:bg-[#22272b] shadow-lg z-20 py-1 animate-in fade-in slide-in-from-top-1 duration-150 text-xs text-[#292a2e] dark:text-[#deebff]"
                onMouseLeave={() => setActiveSubMenu(null)}
              >
                {/* Độ ưu tiên */}
                <div
                  className="relative px-3 py-2 hover:bg-slate-50 dark:hover:bg-[#2c3338] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer flex items-center justify-between font-semibold"
                  onMouseEnter={() => setActiveSubMenu("priority")}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveSubMenu(activeSubMenu === "priority" ? null : "priority");
                  }}
                >
                  <span>Độ ưu tiên</span>
                  <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 font-normal">
                    <span className="text-[10px]">
                      {!selectedPriority ? "Tất cả" : selectedPriority === "Required" ? "Bắt buộc" : selectedPriority === "Important" ? "Quan trọng" : "Mở rộng"}
                    </span>
                    <span className="text-[9px]">▶</span>
                  </div>

                  {activeSubMenu === "priority" && (
                    <div
                      className="absolute left-full top-0 ml-1 w-48 rounded-md border border-slate-200 dark:border-[#353e47] bg-white dark:bg-[#22272b] shadow-lg py-1 z-30 animate-in fade-in slide-in-from-left-1 duration-100"
                      onClick={(e) => e.stopPropagation()}
                    >
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
                          className={`px-3 py-2 hover:bg-slate-50 dark:hover:bg-[#2c3338] text-left cursor-pointer flex items-center justify-between ${
                            (selectedPriority || "") === item.value ? "text-[#1868db] dark:text-[#579dff] bg-blue-50/20 dark:bg-blue-950/10 font-bold" : "text-slate-600 dark:text-slate-400 font-medium"
                          }`}
                        >
                          <span>{item.label}</span>
                          {(selectedPriority || "") === item.value && <span className="text-[#1868db] dark:text-[#579dff]">✓</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Hạn chót */}
                <div
                  className="relative px-3 py-2 hover:bg-slate-50 dark:hover:bg-[#2c3338] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer flex items-center justify-between font-semibold"
                  onMouseEnter={() => setActiveSubMenu("dueDate")}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveSubMenu(activeSubMenu === "dueDate" ? null : "dueDate");
                  }}
                >
                  <span>Hạn chót</span>
                  <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 font-normal">
                    <span className="text-[10px]">
                      {!selectedDueDateFilter ? "Tất cả" : selectedDueDateFilter === "overdue" ? "Quá hạn" : "7 ngày tới"}
                    </span>
                    <span className="text-[9px]">▶</span>
                  </div>

                  {activeSubMenu === "dueDate" && (
                    <div
                      className="absolute left-full top-0 ml-1 w-48 rounded-md border border-slate-200 dark:border-[#353e47] bg-white dark:bg-[#22272b] shadow-lg py-1 z-30 animate-in fade-in slide-in-from-left-1 duration-100"
                      onClick={(e) => e.stopPropagation()}
                    >
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
                          className={`px-3 py-2 hover:bg-slate-50 dark:hover:bg-[#2c3338] text-left cursor-pointer flex items-center justify-between ${
                            (selectedDueDateFilter || "") === item.value ? "text-[#1868db] dark:text-[#579dff] bg-blue-50/20 dark:bg-blue-950/10 font-bold" : "text-slate-600 dark:text-slate-400 font-medium"
                          }`}
                        >
                          <span>{item.label}</span>
                          {(selectedDueDateFilter || "") === item.value && <span className="text-[#1868db] dark:text-[#579dff]">✓</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Xóa bộ lọc nhanh */}
                {hasAnyFilterActive && (
                  <>
                    <div className="h-[1px] bg-slate-100 dark:bg-[#353e47] my-1" />
                    <div
                      onClick={() => {
                        setSelectedPriority(null);
                        setSelectedDueDateFilter(null);
                        closePopovers();
                      }}
                      className="px-3 py-2 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 font-bold cursor-pointer text-left transition-colors"
                    >
                      Xóa bộ lọc
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {/* 2. Sort Button */}
        <div className="relative">
          <button
            onClick={() => {
              setIsSortOpen(!isSortOpen);
              setIsFilterOpen(false);
              setActiveSubMenu(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs border rounded-[4px] font-semibold bg-white dark:bg-[#22272b] cursor-pointer transition-all ${
              sortBy !== "dueDate"
                ? "border-[#1868db] dark:border-[#579dff] text-[#1868db] dark:text-[#579dff] bg-blue-50/30 dark:bg-blue-950/20"
                : "border-slate-200 dark:border-[#353e47] text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-500"
            }`}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 18H3M21 12H3M21 6H3" />
            </svg>
            <span>Sắp xếp: {sortBy === "dueDate" ? "Hạn chót" : "Ưu tiên"}</span>
          </button>

          {isSortOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={closePopovers} />
              <div className="absolute left-0 mt-1.5 w-44 rounded-md border border-slate-200 dark:border-[#353e47] bg-white dark:bg-[#22272b] shadow-lg z-20 py-1 animate-in fade-in slide-in-from-top-1 duration-150 text-xs text-[#292a2e] dark:text-[#deebff]">
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
                    className={`px-3 py-2 hover:bg-slate-50 dark:hover:bg-[#2c3338] text-left cursor-pointer flex items-center justify-between ${
                      sortBy === item.value ? "text-[#1868db] dark:text-[#579dff] bg-blue-50/20 dark:bg-blue-950/10 font-bold" : "text-slate-600 dark:text-slate-400 font-medium"
                    }`}
                  >
                    <span>{item.label}</span>
                    {sortBy === item.value && <span className="text-[#1868db] dark:text-[#579dff]">✓</span>}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Divider */}
        {!isPersonalProject && (
          <div className="h-6 w-[1px] bg-slate-200 dark:bg-[#353e47] mx-1 hidden sm:block" />
        )}

        {/* Assignees circles */}
        {!isPersonalProject && (
          <div className="flex items-center gap-1">
            <span className="text-xs text-[#505258] dark:text-slate-400 font-semibold mr-1">Người thực hiện:</span>
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
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={selectedAssignee === "unassigned" ? "text-[#1868db] dark:text-[#579dff]" : "text-slate-400"}>
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
            className="ml-2 text-xs font-semibold text-[#1868db] dark:text-[#579dff] hover:underline cursor-pointer flex items-center gap-1"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            Xóa bộ lọc
          </button>
        )}
      </div>

      {/* Create Task Button removed as requested */}
    </div>
  );
}
