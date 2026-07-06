"use client";

import * as React from "react";

export interface TrashToolbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedProjectId: string;
  setSelectedProjectId: (projectId: string) => void;
  projects: Array<{ id: string; name: string }>;
  selectedCount: number;
  onBatchRestore: () => void;
  onBatchPermanentDelete: () => void;
  showBatchRestore?: boolean;
  showBatchPermanentDelete?: boolean;
}

/**
 * @component TrashToolbar
 * @description Thanh công cụ lọc, tìm kiếm và thao tác hàng loạt cho Thùng rác công việc.
 */
export function TrashToolbar({
  searchQuery,
  setSearchQuery,
  selectedProjectId,
  setSelectedProjectId,
  projects,
  selectedCount,
  onBatchRestore,
  onBatchPermanentDelete,
  showBatchRestore = true,
  showBatchPermanentDelete = true,
}: TrashToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/60 dark:bg-[#161a1d] border border-slate-200/60 dark:border-[#2c3338] rounded-lg p-3 shrink-0 select-none">
      <div className="flex items-center flex-wrap gap-2.5">
        {/* Tìm kiếm */}
        <div className="relative w-60">
          <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-slate-400">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm công việc..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 dark:border-[#353e47] rounded bg-white dark:bg-[#22272b] text-[#292a2e] dark:text-[#deebff] focus:outline-none focus:ring-1 focus:ring-[#1868db] dark:focus:ring-[#579dff] focus:border-transparent placeholder:text-slate-400 dark:placeholder:text-[#626f7f] font-semibold"
          />
        </div>

        {/* Lọc dự án */}
        <div className="relative">
          <svg className="absolute left-2.5 top-[9px] h-3.5 w-3.5 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
          </svg>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="pl-7 pr-3 py-1.5 text-xs border border-slate-200 dark:border-[#353e47] rounded bg-white dark:bg-[#22272b] text-[#292a2e] dark:text-[#deebff] focus:outline-none focus:ring-1 focus:ring-[#1868db] dark:focus:ring-[#579dff] font-semibold cursor-pointer"
          >
            <option value="">Tất cả dự án</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Thao tác hàng loạt */}
      {selectedCount > 0 && (
        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-150">
          <span className="text-xs text-slate-500 dark:text-[#a5adba] font-bold mr-1">
            Đã chọn {selectedCount} mục:
          </span>
          {showBatchRestore && (
            <button
              onClick={onBatchRestore}
              className="px-2.5 py-1.5 text-xs font-bold text-[#1868db] dark:text-[#579dff] hover:text-[#0052cc] dark:hover:text-[#85b8ff] bg-white dark:bg-[#1d2125] hover:bg-blue-50/50 dark:hover:bg-blue-950/20 border border-slate-200 dark:border-[#353e47] rounded flex items-center gap-1 cursor-pointer transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="23 4 23 10 17 10"></polyline>
                <polyline points="1 20 1 14 7 14"></polyline>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
              </svg>
              Khôi phục
            </button>
          )}
          {showBatchPermanentDelete && (
            <button
              onClick={onBatchPermanentDelete}
              className="px-2.5 py-1.5 text-xs font-bold text-red-600 dark:text-[#f87171] hover:text-red-800 dark:hover:text-[#fca5a5] bg-white dark:bg-[#1d2125] hover:bg-red-50/80 dark:hover:bg-red-950/20 border border-slate-200 dark:border-[#353e47] hover:border-red-200 dark:hover:border-red-900 rounded flex items-center gap-1 cursor-pointer transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              Xóa vĩnh viễn
            </button>
          )}
        </div>
      )}
    </div>
  );
}
