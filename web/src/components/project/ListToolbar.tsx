"use client";

import * as React from "react";
import { Avatar } from "@/components/ui/Avatar";
import { BoardColumn } from "@/types/task";

interface ListToolbarProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
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
  onCreateTaskClick: () => void;
  readOnly?: boolean;
  isPersonalProject?: boolean;
}

/**
 * ListToolbar — Thanh công cụ lọc và tương tác cho tab Danh sách công việc,
 * đồng bộ với kiểu flyout dropdown bộ lọc và bộ sắp xếp tuỳ chỉnh của trang công việc cá nhân.
 */
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
  onCreateTaskClick,
  readOnly = false,
  isPersonalProject = false,
}: ListToolbarProps) {
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
    selectedPriority !== "all" ||
    selectedStatus !== "all" ||
    selectedDueDateFilter !== "all";

  const hasActiveFilters =
    !!searchQuery ||
    (!isPersonalProject && selectedAssignee !== "all") ||
    hasAnyFilterActive;

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0 select-none">
      <div className="flex flex-wrap items-center gap-2">
        {/* Quick Search */}
        <div className="relative">
          <svg className="absolute left-2.5 top-[9px] h-3.5 w-3.5 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Tìm kiếm nhanh..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-56 pl-8 pr-3 py-1.5 text-xs border border-slate-200 dark:border-[#353e47] rounded-[4px] bg-white dark:bg-[#22272b] text-[#292a2e] dark:text-[#deebff] focus:outline-none focus:ring-1 focus:ring-[#1868db] dark:focus:ring-[#579dff] placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
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
                {/* Trạng thái */}
                <div
                  className="relative px-3 py-2 hover:bg-slate-50 dark:hover:bg-[#2c3338] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer flex items-center justify-between font-semibold"
                  onMouseEnter={() => setActiveSubMenu("status")}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveSubMenu(activeSubMenu === "status" ? null : "status");
                  }}
                >
                  <span>Trạng thái</span>
                  <div className="flex items-center gap-1 text-slate-400 font-normal">
                    <span className="text-[10px] max-w-[60px] truncate">
                      {selectedStatus === "all" ? "Tất cả" : columns.find((c) => c.id === selectedStatus)?.name}
                    </span>
                    <span className="text-[9px]">▶</span>
                  </div>

                  {activeSubMenu === "status" && (
                    <div
                      className="absolute left-full top-0 ml-1 w-48 rounded-md border border-slate-200 dark:border-[#353e47] bg-white dark:bg-[#22272b] shadow-lg py-1 z-30 animate-in fade-in slide-in-from-left-1 duration-100 max-h-60 overflow-y-auto"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div
                        onClick={() => {
                          setSelectedStatus("all");
                          closePopovers();
                        }}
                        className={`px-3 py-2 hover:bg-slate-50 dark:hover:bg-[#2c3338] text-left cursor-pointer flex items-center justify-between ${
                          selectedStatus === "all" ? "text-[#1868db] dark:text-[#579dff] bg-blue-50/20 dark:bg-blue-950/10 font-bold" : "text-slate-600 dark:text-slate-400 font-medium"
                        }`}
                      >
                        <span>Tất cả trạng thái</span>
                        {selectedStatus === "all" && <span className="text-[#1868db] dark:text-[#579dff]">✓</span>}
                      </div>
                      {columns.map((col) => (
                        <div
                          key={col.id}
                          onClick={() => {
                            setSelectedStatus(col.id);
                            closePopovers();
                          }}
                          className={`px-3 py-2 hover:bg-slate-50 dark:hover:bg-[#2c3338] text-left cursor-pointer flex items-center justify-between ${
                            selectedStatus === col.id ? "text-[#1868db] dark:text-[#579dff] bg-blue-50/20 dark:bg-blue-950/10 font-bold" : "text-slate-600 dark:text-slate-400 font-medium"
                          }`}
                        >
                          <span className="truncate pr-2">{col.name}</span>
                          {selectedStatus === col.id && <span className="text-[#1868db] dark:text-[#579dff]">✓</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

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
                  <div className="flex items-center gap-1 text-slate-400 font-normal">
                    <span className="text-[10px]">
                      {selectedPriority === "all" ? "Tất cả" : selectedPriority === "Required" ? "Bắt buộc" : selectedPriority === "Important" ? "Quan trọng" : "Mở rộng"}
                    </span>
                    <span className="text-[9px]">▶</span>
                  </div>

                  {activeSubMenu === "priority" && (
                    <div
                      className="absolute left-full top-0 ml-1 w-48 rounded-md border border-slate-200 dark:border-[#353e47] bg-white dark:bg-[#22272b] shadow-lg py-1 z-30 animate-in fade-in slide-in-from-left-1 duration-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {[
                        { value: "all", label: "Tất cả độ ưu tiên" },
                        { value: "Required", label: "Bắt buộc" },
                        { value: "Important", label: "Quan trọng" },
                        { value: "Extended", label: "Mở rộng" },
                      ].map((item) => (
                        <div
                          key={item.value}
                          onClick={() => {
                            setSelectedPriority(item.value);
                            closePopovers();
                          }}
                          className={`px-3 py-2 hover:bg-slate-50 dark:hover:bg-[#2c3338] text-left cursor-pointer flex items-center justify-between ${
                            selectedPriority === item.value ? "text-[#1868db] dark:text-[#579dff] bg-blue-50/20 dark:bg-blue-950/10 font-bold" : "text-slate-600 dark:text-slate-400 font-medium"
                          }`}
                        >
                          <span>{item.label}</span>
                          {selectedPriority === item.value && <span className="text-[#1868db] dark:text-[#579dff]">✓</span>}
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
                  <div className="flex items-center gap-1 text-slate-400 font-normal">
                    <span className="text-[10px]">
                      {selectedDueDateFilter === "all" ? "Tất cả" : selectedDueDateFilter === "overdue" ? "Quá hạn" : "7 ngày tới"}
                    </span>
                    <span className="text-[9px]">▶</span>
                  </div>

                  {activeSubMenu === "dueDate" && (
                    <div
                      className="absolute left-full top-0 ml-1 w-48 rounded-md border border-slate-200 dark:border-[#353e47] bg-white dark:bg-[#22272b] shadow-lg py-1 z-30 animate-in fade-in slide-in-from-left-1 duration-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {[
                        { value: "all", label: "Tất cả hạn chót" },
                        { value: "overdue", label: "Quá hạn" },
                        { value: "upcoming7", label: "Sắp đến hạn (7 ngày)" },
                      ].map((item) => (
                        <div
                          key={item.value}
                          onClick={() => {
                            setSelectedDueDateFilter(item.value);
                            closePopovers();
                          }}
                          className={`px-3 py-2 hover:bg-slate-50 dark:hover:bg-[#2c3338] text-left cursor-pointer flex items-center justify-between ${
                            selectedDueDateFilter === item.value ? "text-[#1868db] dark:text-[#579dff] bg-blue-50/20 dark:bg-blue-950/10 font-bold" : "text-slate-600 dark:text-slate-400 font-medium"
                          }`}
                        >
                          <span>{item.label}</span>
                          {selectedDueDateFilter === item.value && <span className="text-[#1868db] dark:text-[#579dff]">✓</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Xóa bộ lọc nhanh */}
                {hasAnyFilterActive && (
                  <>
                    <div className="h-[1px] bg-slate-100 dark:bg-[#2c3338] my-1" />
                    <div
                      onClick={() => {
                        setSelectedPriority("all");
                        setSelectedStatus("all");
                        setSelectedDueDateFilter("all");
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
                      setSortBy(item.value);
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

        {/* Assignees circles filter */}
        {!isPersonalProject && assignees.length > 0 && (
          <div className="flex items-center gap-1 ml-1 pl-2 border-l border-slate-200 dark:border-[#2c3338]">
            <span className="text-xs text-[#505258] dark:text-slate-300 font-semibold mr-1.5">Người thực hiện:</span>
            <div className="flex -space-x-1.5 items-center">
              {assignees.map((user) => {
                const isSelected = selectedAssignee === user.id;
                return (
                  <button
                    key={user.id}
                    onClick={() => setSelectedAssignee(isSelected ? "all" : user.id)}
                    title={user.displayName}
                    className={`h-7 w-7 rounded-full border-2 transition-all cursor-pointer ${
                      isSelected ? "border-[#1868db] dark:border-[#579dff] scale-110 z-10" : "border-white dark:border-[#1d2125] hover:border-slate-300 dark:hover:border-slate-500"
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
                className={`h-7 w-7 rounded-full border-2 border-dashed transition-all cursor-pointer flex items-center justify-center bg-slate-50 dark:bg-[#22272b] hover:bg-slate-100 dark:hover:bg-[#2c3338] hover:border-slate-400 dark:hover:border-slate-500 ml-1.5 ${
                  selectedAssignee === "unassigned" ? "border-[#1868db] dark:border-[#579dff] bg-blue-50/50 dark:bg-blue-950/20 scale-110 z-10" : "border-slate-300 dark:border-[#353e47]"
                }`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={selectedAssignee === "unassigned" ? "text-[#1868db] dark:text-[#579dff]" : "text-slate-400 dark:text-slate-500"}>
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

      {!readOnly && (
        <button
          onClick={onCreateTaskClick}
          className="px-3.5 py-1.5 bg-[#1868db] dark:bg-[#579dff] hover:bg-[#0052cc] dark:hover:bg-blue-400 text-white dark:text-[#1d2125] text-xs font-bold rounded-[4px] cursor-pointer flex items-center gap-1 shadow-xs transition-colors whitespace-nowrap shrink-0 animate-in fade-in"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Tạo công việc</span>
        </button>
      )}
    </div>
  );
}
