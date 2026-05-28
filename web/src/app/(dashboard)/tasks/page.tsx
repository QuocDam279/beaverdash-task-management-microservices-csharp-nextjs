"use client";

/**
 * @page MyTasksPage
 * @description Trang Công việc của tôi điều phối dữ liệu, quản lý bộ lọc,
 * và hiển thị giao diện Split-Screen tối giản hoặc Lịch tháng.
 */

import * as React from "react";

import { useMyTasks } from "@/hooks/useMyTasks";
import { useAuth } from "@/components/providers/AuthProvider";
import { useMyTaskDetails } from "@/hooks/useMyTaskDetails";
import { TaskDetailModal, CalendarView } from "@/components/project";
import {
  MyTasksHeader,
  MyTasksStats,
  MyTasksList,
} from "@/components/features";

export default function MyTasksPage() {
  const {
    tasks,
    setTasks,
    projects,
    isLoading,
    selectedTask,
    setSelectedTask,
    columns,
    assignees,
    handleTaskClick,
    handleToggleComplete,
    fetchTasks,
  } = useMyTasks();

  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = React.useState<"list" | "calendar">("list");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterProject, setFilterProject] = React.useState("");
  const [filterPriority, setFilterPriority] = React.useState("all");
  const [isDesktop, setIsDesktop] = React.useState(false);

  // Lắng nghe kích thước màn hình để bật/tắt Split-Screen
  React.useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Hook quản lý các logic chỉnh sửa chi tiết task
  const detailsActions = useMyTaskDetails({
    selectedTask,
    setSelectedTask,
    columns,
    setTasks,
    fetchTasks,
  });

  // Lọc danh sách công việc
  const filteredTasks = React.useMemo(() => {
    return tasks.filter((t) => {
      const matchSearch =
        !searchQuery.trim() ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchProject = !filterProject || t.projectId === filterProject;
      const matchPriority =
        filterPriority === "all" || t.priority === filterPriority;
      return matchSearch && matchProject && matchPriority;
    });
  }, [tasks, searchQuery, filterProject, filterPriority]);

  // Tính toán số liệu thống kê
  const stats = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return {
      total: tasks.length,
      overdue: tasks.filter(
        (t) => !t.columnIsDone && t.dueDate && new Date(t.dueDate) < today
      ).length,
      done: tasks.filter((t) => t.columnIsDone).length,
    };
  }, [tasks]);

  // Gom nhóm công việc theo thời gian hạn chót
  const groupedTasks = React.useMemo(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const endOfWeek = new Date();
    endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));
    endOfWeek.setHours(23, 59, 59, 999);

    const overdue: any[] = [];
    const today: any[] = [];
    const upcoming: any[] = [];
    const later: any[] = [];

    filteredTasks.forEach((t) => {
      if (!t.dueDate) {
        later.push(t);
        return;
      }
      const d = new Date(t.dueDate);
      if (d < startOfToday && !t.columnIsDone) overdue.push(t);
      else if (d >= startOfToday && d <= endOfToday) today.push(t);
      else if (d > endOfToday && d <= endOfWeek) upcoming.push(t);
      else later.push(t);
    });

    return { overdue, today, upcoming, later };
  }, [filteredTasks]);

  if (isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center p-8 bg-slate-50/10">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-[#1868db]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-xs font-semibold text-slate-500 font-sans">Đang tải danh sách công việc...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50/10 h-full flex flex-col select-none overflow-hidden gap-4 font-sans">
      <MyTasksHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterProject={filterProject}
        setFilterProject={setFilterProject}
        filterPriority={filterPriority}
        setFilterPriority={setFilterPriority}
        projects={projects}
      />

      {activeTab === "list" ? (
        <div className="flex-1 min-h-0 flex flex-col gap-4">
          <MyTasksStats stats={stats} />

          <div className="flex-1 min-h-0 flex bg-white border border-slate-200/60 rounded-lg overflow-hidden shadow-2xs">
            {/* Tasks List */}
            <div className="flex-1 flex flex-col min-h-0 p-4">
              <MyTasksList
                groupedTasks={groupedTasks}
                selectedTaskId={selectedTask?.id || null}
                onTaskClick={handleTaskClick}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-0 bg-white border border-slate-200/60 rounded-lg p-4 shadow-2xs flex flex-col">
          <CalendarView
            tasks={filteredTasks.map((t) => ({
              ...t,
              boardColumnId: t.boardColumnId || "",
              createdAt: t.createdAt || "",
              updatedAt: t.updatedAt || "",
              isPublic: false,
              shareToken: null,
              createdByUserId: "",
            }))}
            setTasks={setTasks}
            viewContext="my-tasks"
            showProjectPrefix={true}
          />
        </div>
      )}

      {/* Task Details Modal */}
      {selectedTask && (
        <TaskDetailModal
          isOpen={!!selectedTask}
          onClose={() => {
            setSelectedTask(null);
            fetchTasks();
          }}
          task={selectedTask}
          onUpdateTask={(updated) => {
            setSelectedTask(updated);
            const targetCol = columns.find((c) => c.id === updated.boardColumnId);
            const isColumnDone = targetCol ? targetCol.isDone : false;
            const colName = targetCol ? targetCol.name : "";
            setTasks((prev) =>
              prev.map((t) =>
                t.id === updated.id
                  ? {
                      ...t,
                      title: updated.title,
                      priority: updated.priority,
                      dueDate: updated.dueDate,
                      columnIsDone: isColumnDone,
                      columnName: colName || t.columnName,
                      boardColumnId: updated.boardColumnId || t.boardColumnId,
                    }
                  : t
              )
            );
          }}
          columns={columns}
          assignees={assignees}
        />
      )}
    </div>
  );
}
