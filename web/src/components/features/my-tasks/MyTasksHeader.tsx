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
  projects: Array<{ id: string; name: string }>;
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
  projects,
}: MyTasksHeaderProps) {
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

        <select
          value={filterProject}
          onChange={(e) => setFilterProject(e.target.value)}
          className="w-full md:w-auto max-w-full md:max-w-[240px] px-2.5 py-1.5 text-xs border border-slate-300 rounded-[4px] bg-white text-[#292a2e] focus:outline-none cursor-pointer hover:border-slate-400 transition-colors font-medium truncate"
        >
          <option value="">📂 Tất cả dự án</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-[4px] bg-white text-[#292a2e] focus:outline-none cursor-pointer hover:border-slate-400 transition-colors font-medium"
        >
          <option value="all">⚡ Tất cả độ ưu tiên</option>
          <option value="Required">Bắt buộc</option>
          <option value="Important">Quan trọng</option>
          <option value="Extended">Mở rộng</option>
        </select>
      </div>
    </div>
  );
}
