"use client";

import * as React from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useMyTasksPage } from "@/hooks/useMyTasksPage";
import { ProjectListTable } from "@/components/project/ProjectListTable";
import { TaskDetailModal, CalendarView } from "@/components/project";
import {
  MyTasksStatsPanel,
  MyTasksFilterToolbar,
  MyTasksAnnouncementOverlay,
} from "@/components/features/my-tasks";

/**
 * @page MyTasksPage
 * @description Trang "Công việc của tôi" hiển thị danh sách các công việc con được giao cho người dùng.
 * Cho phép tìm kiếm nhanh, lọc theo dự án, trạng thái, độ ưu tiên, hạn chót và sắp xếp kết quả.
 */
export default function MyTasksPage() {
  const { user: currentUser } = useAuth();
  const state = useMyTasksPage(currentUser);
  const [viewMode, setViewMode] = React.useState<"list" | "calendar">("list");

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
      <MyTasksStatsPanel tasks={state.tasks} onTaskClick={state.handleTaskClick} />

      {/* 3. Filter Toolbar */}
      <MyTasksFilterToolbar
        searchQuery={state.searchQuery}
        onSearchChange={state.setSearchQuery}
        selectedProject={state.selectedProject}
        onProjectChange={state.setSelectedProject}
        selectedStatus={state.selectedStatus}
        onStatusChange={state.setSelectedStatus}
        selectedPriority={state.selectedPriority}
        onPriorityChange={state.setSelectedPriority}
        selectedDueDateFilter={state.selectedDueDateFilter}
        onDueDateFilterChange={state.setSelectedDueDateFilter}
        sortBy={state.sortBy}
        onSortByChange={state.setSortBy}
        uniqueProjects={state.uniqueProjects}
        hasActiveFilters={state.hasActiveFilters}
        onResetFilters={state.handleResetFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* 4. Main Board Table Area */}
      {state.isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center p-20 text-slate-500 text-xs gap-3">
          <svg className="animate-spin h-6 w-6 text-[#1868db]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="font-semibold">Đang tải danh sách công việc của bạn...</span>
        </div>
      ) : state.error ? (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-md flex items-center justify-between">
          <span>⚠️ {state.error}</span>
          <button onClick={state.fetchTasks} className="text-[#1868db] hover:underline cursor-pointer">Thử lại</button>
        </div>
      ) : viewMode === "calendar" ? (
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
        <ProjectListTable
          tasks={state.sortedTasks}
          columns={[]}
          onTaskClick={state.handleTaskClick}
          showProjectColumn={true}
          isPersonalProject={false}
          hideAssigneeColumn={true}
          showParentTaskColumn={true}
          hideSubTasksColumn={true}
        />
      )}

      {/* 5. Task Details Modal */}
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

      {/* 6. Announcement Overlay Board */}
      <MyTasksAnnouncementOverlay
        isOpen={state.showAnnouncement}
        onClose={state.handleCloseAnnouncement}
        tasks={state.tasks}
        currentUser={currentUser}
        isTasksLoading={state.isLoading}
      />
    </div>
  );
}
