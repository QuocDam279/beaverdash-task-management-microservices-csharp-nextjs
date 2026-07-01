"use client";

import * as React from "react";

interface UniqueProject {
  id: string;
  name: string;
}

interface MyTasksFilterToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  
  // Filters
  selectedProject: string;
  onProjectChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  selectedPriority: string;
  onPriorityChange: (value: string) => void;
  selectedSprintFilter: string;
  onSprintFilterChange: (value: string) => void;
  selectedDueDateFilter: string;
  onDueDateFilterChange: (value: string) => void;
  
  // Sorting
  sortBy: string;
  onSortByChange: (value: string) => void;
  
  // Auxiliary
  uniqueProjects: UniqueProject[];
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  
  // View mode
  viewMode: "list" | "calendar";
  onViewModeChange: (value: "list" | "calendar") => void;
}

/**
 * @component MyTasksFilterToolbar
 * @description Toolbar chứa ô tìm kiếm nhanh, nút Bộ lọc (với menu flyout) và nút Sắp xếp riêng biệt.
 * Các icon trang trí bên trong menu đã được lược bỏ để giao diện thanh lịch và tối giản hơn.
 */
export function MyTasksFilterToolbar({
  searchQuery,
  onSearchChange,
  selectedProject,
  onProjectChange,
  selectedStatus,
  onStatusChange,
  selectedPriority,
  onPriorityChange,
  selectedSprintFilter,
  onSprintFilterChange,
  selectedDueDateFilter,
  onDueDateFilterChange,
  sortBy,
  onSortByChange,
  uniqueProjects,
  hasActiveFilters,
  onResetFilters,
  viewMode,
  onViewModeChange,
}: MyTasksFilterToolbarProps) {
  // Popover State
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const [isSortOpen, setIsSortOpen] = React.useState(false);
  const [isActivityOpen, setIsActivityOpen] = React.useState(false);
  const [activeSubMenu, setActiveSubMenu] = React.useState<string | null>(null);

  // Close all popovers
  const closePopovers = () => {
    setIsFilterOpen(false);
    setIsSortOpen(false);
    setIsActivityOpen(false);
    setActiveSubMenu(null);
  };

  const hasAnyFilterActive =
    selectedProject !== "all" ||
    selectedStatus !== "uncompleted" ||
    selectedPriority !== "all" ||
    selectedSprintFilter !== "active" ||
    selectedDueDateFilter !== "all";

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0 select-none">
      <div className="flex flex-wrap items-center gap-2">
        {/* Quick Search */}
        <div className="relative">
          <svg
            className="absolute left-2.5 top-[9px] h-3.5 w-3.5 text-slate-400 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Tìm kiếm công việc..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-56 pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-[4px] bg-white text-[#292a2e] focus:outline-none focus:ring-1 focus:ring-[#1868db]"
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
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs border rounded-[4px] font-semibold bg-white cursor-pointer transition-all ${
              hasAnyFilterActive
                ? "border-[#1868db] text-[#1868db] bg-blue-50/30"
                : "border-slate-200 text-slate-700 hover:border-slate-400"
            }`}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            <span>Bộ lọc</span>
            {hasAnyFilterActive && (
              <span className="h-1.5 w-1.5 rounded-full bg-[#1868db] ml-0.5 animate-pulse" />
            )}
          </button>

          {isFilterOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={closePopovers} />
              <div
                className="absolute left-0 mt-1.5 w-48 rounded-md border border-slate-200 bg-white shadow-lg z-20 py-1 animate-in fade-in slide-in-from-top-1 duration-150 text-xs text-[#292a2e]"
                onMouseLeave={() => setActiveSubMenu(null)}
              >
                {/* Dự án */}
                <div
                  className="relative px-3 py-2 hover:bg-slate-50 text-slate-700 hover:text-slate-900 cursor-pointer flex items-center justify-between font-semibold"
                  onMouseEnter={() => setActiveSubMenu("project")}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveSubMenu(activeSubMenu === "project" ? null : "project");
                  }}
                >
                  <span>Dự án</span>
                  <div className="flex items-center gap-1 text-slate-400 font-normal">
                    <span className="text-[10px] max-w-[60px] truncate">
                      {selectedProject === "all" ? "Tất cả" : uniqueProjects.find((p) => p.id === selectedProject)?.name}
                    </span>
                    <span className="text-[9px]">▶</span>
                  </div>

                  {activeSubMenu === "project" && (
                    <div
                      className="absolute left-full top-0 ml-1 w-52 rounded-md border border-slate-200 bg-white shadow-lg py-1 z-30 animate-in fade-in slide-in-from-left-1 duration-100 max-h-64 overflow-y-auto"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div
                        onClick={() => {
                          onProjectChange("all");
                          closePopovers();
                        }}
                        className={`px-3 py-2 hover:bg-slate-50 text-left cursor-pointer flex items-center justify-between ${
                          selectedProject === "all" ? "text-[#1868db] bg-blue-50/20 font-bold" : "text-slate-600 font-medium"
                        }`}
                      >
                        <span>Tất cả dự án</span>
                        {selectedProject === "all" && <span className="text-[#1868db]">✓</span>}
                      </div>
                      {uniqueProjects.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => {
                            onProjectChange(p.id);
                            closePopovers();
                          }}
                          className={`px-3 py-2 hover:bg-slate-50 text-left cursor-pointer flex items-center justify-between ${
                            selectedProject === p.id ? "text-[#1868db] bg-blue-50/20 font-bold" : "text-slate-600 font-medium"
                          }`}
                        >
                          <span className="truncate pr-2">{p.name}</span>
                          {selectedProject === p.id && <span className="text-[#1868db]">✓</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Trạng thái */}
                <div
                  className="relative px-3 py-2 hover:bg-slate-50 text-slate-700 hover:text-slate-900 cursor-pointer flex items-center justify-between font-semibold"
                  onMouseEnter={() => setActiveSubMenu("status")}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveSubMenu(activeSubMenu === "status" ? null : "status");
                  }}
                >
                  <span>Trạng thái</span>
                  <div className="flex items-center gap-1 text-slate-400 font-normal">
                    <span className="text-[10px]">
                      {selectedStatus === "all" ? "Tất cả" : selectedStatus === "completed" ? "Đã xong" : "Chưa xong"}
                    </span>
                    <span className="text-[9px]">▶</span>
                  </div>

                  {activeSubMenu === "status" && (
                    <div
                      className="absolute left-full top-0 ml-1 w-48 rounded-md border border-slate-200 bg-white shadow-lg py-1 z-30 animate-in fade-in slide-in-from-left-1 duration-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {[
                        { value: "all", label: "Tất cả trạng thái" },
                        { value: "uncompleted", label: "Chưa hoàn thành" },
                        { value: "completed", label: "Đã hoàn thành" },
                      ].map((item) => (
                        <div
                          key={item.value}
                          onClick={() => {
                            onStatusChange(item.value);
                            closePopovers();
                          }}
                          className={`px-3 py-2 hover:bg-slate-50 text-left cursor-pointer flex items-center justify-between ${
                            selectedStatus === item.value ? "text-[#1868db] bg-blue-50/20 font-bold" : "text-slate-600 font-medium"
                          }`}
                        >
                          <span>{item.label}</span>
                          {selectedStatus === item.value && <span className="text-[#1868db]">✓</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Độ ưu tiên */}
                <div
                  className="relative px-3 py-2 hover:bg-slate-50 text-slate-700 hover:text-slate-900 cursor-pointer flex items-center justify-between font-semibold"
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
                      className="absolute left-full top-0 ml-1 w-48 rounded-md border border-slate-200 bg-white shadow-lg py-1 z-30 animate-in fade-in slide-in-from-left-1 duration-100"
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
                            onPriorityChange(item.value);
                            closePopovers();
                          }}
                          className={`px-3 py-2 hover:bg-slate-50 text-left cursor-pointer flex items-center justify-between ${
                            selectedPriority === item.value ? "text-[#1868db] bg-blue-50/20 font-bold" : "text-slate-600 font-medium"
                          }`}
                        >
                          <span>{item.label}</span>
                          {selectedPriority === item.value && <span className="text-[#1868db]">✓</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>


                {/* Hạn chót */}
                <div
                  className="relative px-3 py-2 hover:bg-slate-50 text-slate-700 hover:text-slate-900 cursor-pointer flex items-center justify-between font-semibold"
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
                      className="absolute left-full top-0 ml-1 w-48 rounded-md border border-slate-200 bg-white shadow-lg py-1 z-30 animate-in fade-in slide-in-from-left-1 duration-100"
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
                            onDueDateFilterChange(item.value);
                            closePopovers();
                          }}
                          className={`px-3 py-2 hover:bg-slate-50 text-left cursor-pointer flex items-center justify-between ${
                            selectedDueDateFilter === item.value ? "text-[#1868db] bg-blue-50/20 font-bold" : "text-slate-600 font-medium"
                          }`}
                        >
                          <span>{item.label}</span>
                          {selectedDueDateFilter === item.value && <span className="text-[#1868db]">✓</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Xóa bộ lọc nhanh trong menu nếu đang kích hoạt */}
                {hasAnyFilterActive && (
                  <>
                    <div className="h-[1px] bg-slate-100 my-1" />
                    <div
                      onClick={() => {
                        onResetFilters();
                        closePopovers();
                      }}
                      className="px-3 py-2 hover:bg-red-50 text-red-600 font-bold cursor-pointer text-left transition-colors"
                    >
                      Xóa bộ lọc
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {/* Activity Filter Dropdown */}
        <div className="relative font-sans text-xs">
          <button
            onClick={() => {
              setIsActivityOpen(!isActivityOpen);
              setIsSortOpen(false);
              setIsFilterOpen(false);
              setActiveSubMenu(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs border rounded-[4px] font-semibold bg-white cursor-pointer transition-all ${
              selectedSprintFilter !== "active"
                ? "border-[#1868db] text-[#1868db] bg-blue-50/30"
                : "border-slate-200 text-slate-700 hover:border-slate-400"
            }`}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              {selectedSprintFilter === "active"
                ? "Đang hoạt động"
                : selectedSprintFilter === "inactive"
                ? "Chưa hoạt động"
                : "Tất cả nhiệm vụ"}
            </span>
          </button>

          {isActivityOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={closePopovers} />
              <div className="absolute left-0 mt-1.5 w-48 rounded-md border border-slate-200 bg-white shadow-lg z-20 py-1 animate-in fade-in slide-in-from-top-1 duration-150 text-xs text-[#292a2e]">
                {[
                  { value: "active", label: "Đang hoạt động" },
                  { value: "inactive", label: "Chưa hoạt động" },
                  { value: "all", label: "Tất cả nhiệm vụ" },
                ].map((item) => (
                  <div
                    key={item.value}
                    onClick={() => {
                      onSprintFilterChange(item.value);
                      closePopovers();
                    }}
                    className={`px-3 py-2 hover:bg-slate-50 text-left cursor-pointer flex items-center justify-between ${
                      selectedSprintFilter === item.value ? "text-[#1868db] bg-blue-50/20 font-bold" : "text-slate-600 font-medium"
                    }`}
                  >
                    <span>{item.label}</span>
                    {selectedSprintFilter === item.value && <span className="text-[#1868db]">✓</span>}
                  </div>
                ))}
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
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs border rounded-[4px] font-semibold bg-white cursor-pointer transition-all ${
              sortBy !== "dueDate"
                ? "border-[#1868db] text-[#1868db] bg-blue-50/30"
                : "border-slate-200 text-slate-700 hover:border-slate-400"
            }`}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 18H3M21 12H3M21 6H3" />
            </svg>
            <span>Sắp xếp: {sortBy === "dueDate" ? "Hạn chót" : sortBy === "priority" ? "Độ ưu tiên" : "Dự án"}</span>
          </button>

          {isSortOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={closePopovers} />
              <div className="absolute left-0 mt-1.5 w-44 rounded-md border border-slate-200 bg-white shadow-lg z-20 py-1 animate-in fade-in slide-in-from-top-1 duration-150 text-xs text-[#292a2e]">
                {[
                  { value: "dueDate", label: "Hạn chót" },
                  { value: "priority", label: "Độ ưu tiên" },
                  { value: "project", label: "Dự án" },
                ].map((item) => (
                  <div
                    key={item.value}
                    onClick={() => {
                      onSortByChange(item.value);
                      closePopovers();
                    }}
                    className={`px-3 py-2 hover:bg-slate-50 text-left cursor-pointer flex items-center justify-between ${
                      sortBy === item.value ? "text-[#1868db] bg-blue-50/20 font-bold" : "text-slate-600 font-medium"
                    }`}
                  >
                    <span>{item.label}</span>
                    {sortBy === item.value && <span className="text-[#1868db]">✓</span>}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Quick Clear Indicator next to toolbar */}
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="text-xs font-bold text-[#1868db] hover:text-[#0052cc] px-2 py-1 cursor-pointer transition-colors"
          >
            Xóa tất cả bộ lọc
          </button>
        )}
      </div>

      {/* View Mode Toggle Segmented Control */}
      <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-[4px] border border-slate-200/60 shadow-2xs self-end md:self-auto shrink-0">
        <button
          onClick={() => onViewModeChange("list")}
          className={`px-3 py-1 text-xs font-bold rounded-[3px] cursor-pointer transition-all flex items-center gap-1.5 border-0 ${
            viewMode === "list"
              ? "bg-white text-[#1868db] shadow-3xs font-extrabold"
              : "text-slate-500 hover:text-slate-800 bg-transparent"
          }`}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
          <span>Danh sách</span>
        </button>
        <button
          onClick={() => onViewModeChange("calendar")}
          className={`px-3 py-1 text-xs font-bold rounded-[3px] cursor-pointer transition-all flex items-center gap-1.5 border-0 ${
            viewMode === "calendar"
              ? "bg-white text-[#1868db] shadow-3xs font-extrabold"
              : "text-slate-500 hover:text-slate-800 bg-transparent"
          }`}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span>Lịch</span>
        </button>
      </div>
    </div>
  );
}
