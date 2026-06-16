"use client";

import * as React from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useMyTasksPage } from "@/hooks/useMyTasksPage";
import { ProjectListTable } from "@/components/project/ProjectListTable";
import { CalendarView } from "@/components/project";
import {
  MyTasksStatsPanel,
  MyTasksFilterToolbar,
} from "@/components/features/my-tasks";
import dynamic from "next/dynamic";

const TaskDetailModal = dynamic(() =>
  import("@/components/project/TaskDetailModal").then((m) => m.TaskDetailModal),
  { ssr: false }
);

/**
 * @page MyTasksPage
 * @description Trang "Công việc của tôi" hiển thị danh sách các công việc con được giao cho người dùng.
 * Cho phép tìm kiếm nhanh, lọc theo dự án, trạng thái, độ ưu tiên, hạn chót và sắp xếp kết quả.
 * Dữ liệu được phân trang từ Backend, giảm tải cho trình duyệt.
 */
export default function MyTasksPage() {
  const { user: currentUser } = useAuth();
  const state = useMyTasksPage(currentUser);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 select-none bg-white min-h-full flex flex-col">
      {/* 1. Header Section */}
      <div className="border-b border-slate-100 pb-5 shrink-0">
        <h1 className="text-2xl font-bold tracking-tight text-[#292a2e]">
          Công việc của tôi
        </h1>
        <p className="text-xs text-[#505258] mt-1">
          Xem và quản lý tất cả các công việc được giao cho bạn trên toàn bộ các dự án trong hệ thống.
        </p>
      </div>

      {/* 2. Stats & Attention Panel */}
      <MyTasksStatsPanel
        tasks={state.tasks}
        onTaskClick={state.handleTaskClick}
        stats={state.backendStats}
      />

      {/* 3. Filter Toolbar */}
      <MyTasksFilterToolbar
        searchQuery={state.searchQuery}
        onSearchChange={state.setSearchQuery}
        selectedProject={state.selectedProject}
        onProjectChange={state.setSelectedProject}
        selectedStatus={state.selectedStatus}
        onStatusChange={state.setSelectedStatus}
        selectedDueDateFilter={state.selectedDueDateFilter}
        onDueDateFilterChange={state.setSelectedDueDateFilter}
        sortBy={state.sortBy}
        onSortByChange={state.setSortBy}
        uniqueProjects={state.uniqueProjects}
        hasActiveFilters={state.hasActiveFilters}
        onResetFilters={state.handleResetFilters}
        viewMode={state.viewMode}
        onViewModeChange={state.handleViewModeChange}
      />

      {/* 4. Main Board Table Area */}
      {state.isLoading ? (
        <div className="flex-1 flex flex-col gap-3 animate-pulse select-none">
          {/* Skeleton card-based loader */}
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-lg border border-slate-100 bg-slate-50/40">
              <div className="h-4 w-4 rounded bg-slate-200 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-slate-200 rounded w-3/5" />
                <div className="h-2.5 bg-slate-100 rounded w-2/5" />
              </div>
              <div className="h-5 w-16 bg-slate-200 rounded shrink-0" />
              <div className="h-5 w-20 bg-slate-100 rounded shrink-0" />
            </div>
          ))}
        </div>
      ) : state.error ? (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-md flex items-center justify-between">
          <span>⚠️ {state.error}</span>
          <button onClick={() => state.fetchTasks()} className="text-[#1868db] hover:underline cursor-pointer">Thử lại</button>
        </div>
      ) : state.viewMode === "calendar" ? (
        <div className="flex-1 flex flex-col min-h-0 bg-white">
          <CalendarView
            tasks={state.sortedTasks}
            viewContext="my-tasks"
            showProjectPrefix={true}
            onTaskClick={state.handleTaskClick}
            onTaskDrop={state.handleSubtaskDrop}
          />
        </div>
      ) : (
        <>
          <ProjectListTable
            tasks={state.sortedTasks}
            columns={[]}
            onTaskClick={state.handleTaskClick}
            showProjectColumn={true}
            isPersonalProject={false}
            hideAssigneeColumn={true}
            showParentTaskColumn={false}
            hideSubTasksColumn={true}
            titleColumnName="Nhiệm vụ"
          />

          {/* 5. Pagination Toolbar */}
          {state.totalPages > 1 && (
            <PaginationToolbar
              currentPage={state.currentPage}
              totalPages={state.totalPages}
              totalCount={state.totalCount}
              pageSize={state.pageSize}
              onPageChange={state.goToPage}
            />
          )}
        </>
      )}

      {/* 6. Task Details Modal */}
      {state.selectedTask && (
        <TaskDetailModal
          isOpen={!!state.selectedTask}
          onClose={() => {
            state.setSelectedTask(null);
            state.setClickedSubtaskId(null);
            state.setModalColumns([]);
            state.setModalAssignees([]);
            state.fetchTasks();
          }}
          task={state.selectedTask}
          columns={state.modalColumns}
          onUpdateTask={state.handleUpdateTask}
          assignees={state.modalAssignees}
          initialActiveSubtaskId={state.clickedSubtaskId}
        />
      )}

    </div>
  );
}

/**
 * @component PaginationToolbar
 * @description Thanh điều khiển phân trang premium, hỗ trợ chuyển trang nhanh.
 */
function PaginationToolbar({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  // Generate page numbers with ellipsis
  const getVisiblePages = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(1);
    if (currentPage > 3) pages.push("...");

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) pages.push(i);

    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);

    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 shrink-0 select-none">
      {/* Info */}
      <div className="text-xs text-slate-500 font-medium">
        Hiển thị{" "}
        <span className="font-bold text-slate-700">{startItem}</span>
        {" - "}
        <span className="font-bold text-slate-700">{endItem}</span>
        {" trong số "}
        <span className="font-bold text-[#1868db]">{totalCount}</span>
        {" công việc"}
      </div>

      {/* Page Controls */}
      <div className="flex items-center gap-1">
        {/* Previous */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className={`flex items-center justify-center h-8 w-8 rounded-[4px] border text-xs font-bold transition-all cursor-pointer ${
            currentPage <= 1
              ? "border-slate-100 text-slate-300 cursor-not-allowed bg-slate-50/50"
              : "border-slate-200 text-slate-600 hover:border-[#1868db] hover:text-[#1868db] hover:bg-blue-50/30 bg-white"
          }`}
          title="Trang trước"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Page Numbers */}
        {visiblePages.map((page, idx) =>
          page === "..." ? (
            <span key={`ellipsis-${idx}`} className="flex items-center justify-center h-8 w-8 text-xs text-slate-400 font-bold select-none">
              ⋯
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className={`flex items-center justify-center h-8 min-w-[32px] px-1 rounded-[4px] border text-xs font-bold transition-all cursor-pointer ${
                currentPage === page
                  ? "border-[#1868db] bg-[#1868db] text-white shadow-sm"
                  : "border-slate-200 text-slate-600 hover:border-[#1868db] hover:text-[#1868db] hover:bg-blue-50/30 bg-white"
              }`}
            >
              {page}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className={`flex items-center justify-center h-8 w-8 rounded-[4px] border text-xs font-bold transition-all cursor-pointer ${
            currentPage >= totalPages
              ? "border-slate-100 text-slate-300 cursor-not-allowed bg-slate-50/50"
              : "border-slate-200 text-slate-600 hover:border-[#1868db] hover:text-[#1868db] hover:bg-blue-50/30 bg-white"
          }`}
          title="Trang sau"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
