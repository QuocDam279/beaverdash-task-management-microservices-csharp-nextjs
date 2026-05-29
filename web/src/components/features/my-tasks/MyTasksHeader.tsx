"use client";

/**
 * @component MyTasksHeader
 * @description Thanh tiêu đề, nút chuyển đổi view (List/Calendar) và bộ lọc tìm kiếm cho trang Công việc của tôi.
 */

import * as React from "react";

interface MyTasksHeaderProps {
  activeTab: "list" | "calendar";
  setActiveTab: (tab: "list" | "calendar") => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterProject: string;
  setFilterProject: (projectId: string) => void;
  filterPriority: string;
  setFilterPriority: (priority: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  filterDueDate: string;
  setFilterDueDate: (dueDate: string) => void;
  sortBy: string;
  setSortBy: (sortBy: string) => void;
  projects: Array<{ id: string; name: string }>;
  statusOptions: string[];
}

export function MyTasksHeader({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  filterProject,
  setFilterProject,
  filterPriority,
  setFilterPriority,
  filterStatus,
  setFilterStatus,
  filterDueDate,
  setFilterDueDate,
  sortBy,
  setSortBy,
  projects,
  statusOptions,
}: MyTasksHeaderProps) {
  const hasActiveFilters =
    !!searchQuery ||
    !!filterProject ||
    filterPriority !== "all" ||
    filterStatus !== "all" ||
    filterDueDate !== "all" ||
    sortBy !== "manual";

  return (
    <div className="flex flex-col gap-4 border-b border-slate-200/60 pb-4">
      {/* Title & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#292a2e] font-sans">
            Công việc của tôi
          </h1>
          <p className="text-xs text-[#505258] mt-0.5 font-sans">
            Quản lý và cập nhật tiến độ tất cả nhiệm vụ được giao cho bạn
          </p>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md border border-slate-200/60 shrink-0">
          <button
            onClick={() => setActiveTab("list")}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
              activeTab === "list"
                ? "bg-white text-[#1868db] shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Danh sách
          </button>
          <button
            onClick={() => setActiveTab("calendar")}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
              activeTab === "calendar"
                ? "bg-white text-[#1868db] shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Lịch tháng
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-slate-200/60 rounded-lg p-2.5 shadow-2xs flex flex-wrap items-center gap-2.5">
        {/* Text Search */}
        <div className="flex-1 min-w-[200px] relative">
          <input
            type="text"
            placeholder="Tìm kiếm công việc..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-[4px] bg-white text-[#292a2e] focus:outline-none focus:ring-2 focus:ring-[#1868db] focus:border-transparent transition-all"
          />
          <svg
            className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>

        {/* Project Filter */}
        <div className="relative w-full md:w-auto">
          <svg className="absolute left-2.5 top-[9px] h-3.5 w-3.5 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
          </svg>
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="w-full md:w-auto max-w-full md:max-w-[240px] pl-7 pr-2.5 py-1.5 text-xs border border-slate-300 rounded-[4px] bg-white text-[#292a2e] focus:outline-none cursor-pointer hover:border-slate-400 transition-colors font-semibold truncate"
          >
            <option value="">Tất cả dự án</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="relative">
          <svg className="absolute left-2.5 top-[9px] h-3.5 w-3.5 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="pl-7 pr-2.5 py-1.5 text-xs border border-slate-300 rounded-[4px] bg-white text-[#292a2e] focus:outline-none cursor-pointer hover:border-slate-400 transition-colors font-semibold"
          >
            <option value="all">Tất cả trạng thái</option>
            {statusOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Priority Filter */}
        <div className="relative">
          <svg className="absolute left-2.5 top-[9px] h-3.5 w-3.5 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21v8h-6l-1-1H5v6h-2z" />
          </svg>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="pl-7 pr-2.5 py-1.5 text-xs border border-slate-300 rounded-[4px] bg-white text-[#292a2e] focus:outline-none cursor-pointer hover:border-slate-400 transition-colors font-semibold"
          >
            <option value="all">Tất cả độ ưu tiên</option>
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
            value={filterDueDate}
            onChange={(e) => setFilterDueDate(e.target.value)}
            className="pl-7 pr-2.5 py-1.5 text-xs border border-slate-300 rounded-[4px] bg-white text-[#292a2e] focus:outline-none cursor-pointer hover:border-slate-400 transition-colors font-semibold"
          >
            <option value="all">Tất cả hạn chót</option>
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
            onChange={(e) => setSortBy(e.target.value)}
            className="pl-7 pr-2.5 py-1.5 text-xs border border-slate-300 rounded-[4px] bg-white text-[#292a2e] focus:outline-none cursor-pointer hover:border-slate-400 transition-colors font-semibold"
          >
            <option value="manual">Sắp xếp: Thủ công</option>
            <option value="dueDate">Sắp xếp: Hạn chót</option>
            <option value="priority">Sắp xếp: Độ ưu tiên</option>
          </select>
        </div>

        {/* Reset Filters button */}
        {hasActiveFilters && (
          <button
            onClick={() => {
              setSearchQuery("");
              setFilterProject("");
              setFilterPriority("all");
              setFilterStatus("all");
              setFilterDueDate("all");
              setSortBy("manual");
            }}
            className="ml-1 text-xs font-bold text-[#1868db] hover:text-[#0052cc] hover:underline cursor-pointer transition-all flex items-center gap-1"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            Xóa bộ lọc
          </button>
        )}
      </div>
    </div>
  );
}
