"use client";

import * as React from "react";
import { Avatar } from "@/components/ui/Avatar";
import { BoardColumn } from "@/types/task";
import { ListToolbarFilters } from "./ListToolbarFilters";

interface ListToolbarProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  assignees: any[];
  selectedAssignee: string;
  setSelectedAssignee: (id: string) => void;
  selectedPriority: string;
  setSelectedPriority: (p: string) => void;
  selectedStatus: string;
  setSelectedStatus: (s: string) => void;
  selectedDueDateFilter: string;
  setSelectedDueDateFilter: (d: string) => void;
  columns: BoardColumn[];
  sortBy: string;
  setSortBy: (val: string) => void;
  onCreateTaskClick?: () => void;
  readOnly?: boolean;
  isPersonalProject?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sprints?: any[];
  selectedSprintId?: string;
  setSelectedSprintId?: (id: string) => void;
  activeSprintName?: string | null;
  activeSprintEndDate?: string | null;
}

export function ListToolbar({
  searchQuery,
  setSearchQuery,
  assignees,
  selectedAssignee,
  setSelectedAssignee,
  selectedPriority,
  setSelectedPriority,
  selectedStatus,
  setSelectedStatus,
  selectedDueDateFilter,
  setSelectedDueDateFilter,
  columns,
  sortBy,
  setSortBy,
  isPersonalProject = false,
  sprints = [],
  selectedSprintId = "active",
  setSelectedSprintId = () => {},
  activeSprintName = null,
  activeSprintEndDate = null,
}: ListToolbarProps) {
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const [isSortOpen, setIsSortOpen] = React.useState(false);

  const closePopovers = () => {
    setIsFilterOpen(false);
    setIsSortOpen(false);
  };

  const hasAnyFilterActive =
    selectedPriority !== "all" ||
    selectedStatus !== "all" ||
    selectedDueDateFilter !== "all";

  const hasActiveFilters =
    !!searchQuery ||
    (!isPersonalProject && selectedAssignee !== "all") ||
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
      {/* Row 1: Sprint selector, days left, and Assignees filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
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
            <div className="absolute left-2.5 top-1.5 text-xs pointer-events-none select-none">
              {selectedSprintId === "active" ? "🏃" : selectedSprintId === "00000000-0000-0000-0000-000000000000" ? "📅" : sprints.find(s => s.id === selectedSprintId)?.status === "Closed" ? "📁" : "🔮"}
            </div>
            <svg className="absolute right-2 top-2 h-3.5 w-3.5 text-indigo-500 pointer-events-none select-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>

          {/* Active Sprint Days Left Badge */}
          {selectedSprintId === "active" && activeSprintEndDate && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-indigo-50/60 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 text-[10.5px] font-bold border border-indigo-100 dark:border-indigo-900/40" title="Thời hạn Sprint">
              📅 {getSprintDaysLeft(activeSprintEndDate)}
            </span>
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
                      onClick={() => setSelectedAssignee(isSelected ? "all" : user.id)}
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
                  onClick={() => setSelectedAssignee(selectedAssignee === "unassigned" ? "all" : "unassigned")}
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
            placeholder="Tìm kiếm công việc và nhiệm vụ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-1.5 pl-8 text-xs border border-slate-200 dark:border-[#353e47] rounded-[4px] bg-white dark:bg-[#22272b] text-[#292a2e] dark:text-[#deebff] focus:outline-none focus:ring-1 focus:ring-[#1868db] dark:focus:ring-[#579dff] placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
          <svg className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>

        {/* Right: Consolidated Filter & Sort Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {/* 1. Filter Button */}
          <div className="relative">
            <button
              onClick={() => {
                setIsFilterOpen(!isFilterOpen);
                setIsSortOpen(false);
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
              <ListToolbarFilters
                columns={columns}
                selectedStatus={selectedStatus}
                setSelectedStatus={setSelectedStatus}
                selectedPriority={selectedPriority}
                setSelectedPriority={setSelectedPriority}
                selectedDueDateFilter={selectedDueDateFilter}
                setSelectedDueDateFilter={setSelectedDueDateFilter}
                hasAnyFilterActive={hasAnyFilterActive}
                closePopovers={closePopovers}
              />
            )}
          </div>

          {/* 2. Sort Button */}
          <div className="relative">
            <button
              onClick={() => {
                setIsSortOpen(!isSortOpen);
                setIsFilterOpen(false);
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
                <div className="absolute right-0 mt-1.5 w-44 rounded-md border border-slate-200 dark:border-[#353e47] bg-white dark:bg-[#22272b] shadow-lg z-20 py-1.5 animate-in fade-in slide-in-from-top-1 duration-150 text-xs text-[#292a2e] dark:text-[#deebff]">
                  {[
                    { value: "dueDate", label: "Hạn chót" },
                    { value: "priority", label: "Độ ưu tiên" },
                  ].map((item) => (
                    <div
                      key={item.value}
                      onClick={() => {
                        setSortBy(item.value);
                        closePopovers();
                      }}
                      className={`px-3 py-1.5 rounded hover:bg-slate-50 dark:hover:bg-[#2c3338] text-left cursor-pointer flex items-center justify-between transition-colors ${
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

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedAssignee("all");
                setSelectedPriority("all");
                setSelectedStatus("all");
                setSelectedDueDateFilter("all");
                setSortBy("dueDate");
              }}
              className="text-xs font-bold text-[#1868db] dark:text-[#579dff] hover:text-[#0052cc] dark:hover:text-blue-400 px-2 py-1 cursor-pointer transition-colors"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
