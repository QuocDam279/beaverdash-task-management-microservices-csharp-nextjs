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
}: TrashToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/60 border border-slate-200/60 rounded-lg p-3 shrink-0 select-none">
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
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded bg-white text-[#292a2e] focus:outline-none focus:ring-1 focus:ring-[#1868db] focus:border-transparent placeholder:text-slate-400 font-semibold"
          />
        </div>

        {/* Lọc dự án */}
        <select
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          className="px-3 py-1.5 text-xs border border-slate-200 rounded bg-white text-[#292a2e] focus:outline-none focus:ring-1 focus:ring-[#1868db] font-semibold cursor-pointer"
        >
          <option value="">Tất cả dự án</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Thao tác hàng loạt */}
      {selectedCount > 0 && (
        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-150">
          <span className="text-xs text-slate-500 font-bold mr-1">
            Đã chọn {selectedCount} mục:
          </span>
          <button
            onClick={onBatchRestore}
            className="px-2.5 py-1.5 text-xs font-bold text-[#1868db] hover:text-[#0052cc] bg-white hover:bg-blue-50/50 border border-slate-200 rounded flex items-center gap-1 cursor-pointer transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="23 4 23 10 17 10"></polyline>
              <polyline points="1 20 1 14 7 14"></polyline>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
            Khôi phục
          </button>
          <button
            onClick={onBatchPermanentDelete}
            className="px-2.5 py-1.5 text-xs font-bold text-red-600 hover:text-red-800 bg-white hover:bg-red-50/80 border border-slate-200 hover:border-red-200 rounded flex items-center gap-1 cursor-pointer transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            Xóa vĩnh viễn
          </button>
        </div>
      )}
    </div>
  );
}
