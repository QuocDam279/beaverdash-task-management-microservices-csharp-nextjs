"use client";

import * as React from "react";

import { TrashToolbar, TrashTable } from "@/components/features/trash";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";

import { useTrashTasks } from "@/hooks/useTrashTasks";

/**
 * @page TrashPage
 * @description Trang quản lý Thùng rác công việc.
 * Tuân thủ nghiêm ngặt quy tắc CODING_CONVENTIONS:
 * - Kích thước file dưới 200 dòng.
 * - Logic và state phức tạp tách thành custom hook (useTrashTasks).
 * - Các khối giao diện phức tạp được tách thành components nhỏ (TrashToolbar, TrashTable).
 */
export default function TrashPage() {
  const {
    projects,
    selectedProjectId,
    setSelectedProjectId,
    searchQuery,
    setSearchQuery,
    selectedIds,
    isLoading,
    error,
    isActionPending,
    actionMessage,
    filteredTasks,
    handleSelectRow,
    handleSelectAll,
    handleRestore,
    handlePermanentDelete,
    handleBatchRestore,
    handleBatchPermanentDelete,
    handleEmptyTrash,
  } = useTrashTasks();

  if (isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center p-8 bg-white dark:bg-[#1d2125] select-none">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-[#1868db] dark:text-[#579dff]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-xs font-semibold text-slate-500 dark:text-[#a5adba] font-sans">Đang tải thùng rác...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-[#1d2125] select-none p-6 md:p-8 font-sans">
      {/* Page Header */}
      <div className="mb-6 pb-4 border-b border-slate-100 dark:border-[#2c3338] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-50 dark:bg-red-950/20 text-red-500 dark:text-[#f87171] rounded-lg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#292a2e] dark:text-[#deebff]">Thùng rác công việc</h1>
            <p className="text-xs text-[#505258] dark:text-[#a5adba] mt-0.5">
              Khôi phục lại dự án hoặc xóa vĩnh viễn các công việc đã bị xóa mềm của bạn.
            </p>
          </div>
        </div>

        {/* Empty Trash Button */}
        {filteredTasks.length > 0 && (
          <button
            onClick={handleEmptyTrash}
            className="px-3.5 py-1.5 text-xs font-bold text-slate-500 dark:text-[#a5adba] hover:text-red-600 dark:hover:text-[#f87171] bg-white dark:bg-[#1d2125] hover:bg-red-50 dark:hover:bg-red-950/20 border border-slate-200 dark:border-[#353e47] hover:border-red-200 dark:hover:border-red-900 rounded transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
            title="Xóa vĩnh viễn tất cả công việc trong thùng rác"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            Dọn trống thùng rác
          </button>
        )}
      </div>

      {error ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center text-red-500 dark:text-[#f87171] font-bold max-w-md bg-red-50 dark:bg-[rgba(239,68,68,0.15)] border border-red-200 dark:border-[rgba(239,68,68,0.3)] px-6 py-4 rounded-lg text-xs">
            {error}
          </div>
        </div>
      ) : filteredTasks.length === 0 && searchQuery === "" && selectedProjectId === "" ? (
        <div className="flex-1 flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-slate-200/60 dark:border-[#2c3338] rounded-xl m-4 bg-slate-50/50 dark:bg-slate-900/10">
          <div className="text-slate-300 dark:text-slate-700 mb-3.5">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </div>
          <h3 className="text-xs font-bold text-slate-500 dark:text-[#a5adba] uppercase tracking-wide">Thùng rác trống</h3>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 max-w-xs leading-relaxed">
            Các công việc bị xóa mềm sẽ xuất hiện ở đây để bạn có thể khôi phục bất cứ lúc nào.
          </p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0 space-y-4">
          <TrashToolbar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedProjectId={selectedProjectId}
            setSelectedProjectId={setSelectedProjectId}
            projects={projects}
            selectedCount={selectedIds.length}
            onBatchRestore={handleBatchRestore}
            onBatchPermanentDelete={handleBatchPermanentDelete}
          />

          <TrashTable
            tasks={filteredTasks}
            selectedIds={selectedIds}
            onSelectRow={handleSelectRow}
            onSelectAll={handleSelectAll}
            onRestore={handleRestore}
            onPermanentDelete={handlePermanentDelete}
          />
        </div>
      )}

      <LoadingOverlay
        isOpen={isActionPending}
        message={actionMessage}
      />
    </div>
  );
}
