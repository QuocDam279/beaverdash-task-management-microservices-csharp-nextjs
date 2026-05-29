"use client";

/**
 * @page MyTasksPage
 * @description Trang Công việc của tôi điều phối dữ liệu, quản lý bộ lọc,
 * và hiển thị giao diện bảng công việc hoặc Lịch tháng.
 */

import * as React from "react";

import { useMyTasks } from "@/hooks/useMyTasks";
import { useAuth } from "@/components/providers/AuthProvider";
import { useMyTaskDetails } from "@/hooks/useMyTaskDetails";
import { TaskDetailModal, CalendarView, ProjectListTable } from "@/components/project";
import { MyTasksHeader } from "@/components/features";

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
  const [filterStatus, setFilterStatus] = React.useState("all");
  const [filterDueDate, setFilterDueDate] = React.useState("all");
  const [sortBy, setSortBy] = React.useState("manual");

  // Dynamic status options based on unique status names in tasks
  const statusOptions = React.useMemo(() => {
    const names = new Set<string>();
    tasks.forEach((t) => {
      if (t.columnName) names.add(t.columnName);
    });
    return Array.from(names);
  }, [tasks]);

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
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);

    return tasks.filter((t) => {
      const matchSearch =
        !searchQuery.trim() ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchProject = !filterProject || t.projectId === filterProject;
      
      const matchPriority =
        filterPriority === "all" || t.priority === filterPriority;
      
      const matchStatus =
        filterStatus === "all" || t.columnName === filterStatus;

      let matchDueDate = true;
      if (filterDueDate === "overdue") {
        matchDueDate =
          !!t.dueDate &&
          !t.columnIsDone &&
          new Date(t.dueDate) < now;
      } else if (filterDueDate === "upcoming7") {
        matchDueDate =
          !!t.dueDate &&
          !t.columnIsDone &&
          new Date(t.dueDate) >= now &&
          new Date(t.dueDate) <= sevenDaysFromNow;
      }

      return matchSearch && matchProject && matchPriority && matchStatus && matchDueDate;
    });
  }, [tasks, searchQuery, filterProject, filterPriority, filterStatus, filterDueDate]);

  const getPriorityWeight = (p: string | null) => {
    if (!p) return 0;
    switch (p) {
      case "Required": case "Critical": case "High": return 3;
      case "Important": case "Medium": return 2;
      case "Extended": case "Low": return 1;
      default: return 0;
    }
  };

  const sortedTasks = React.useMemo(() => {
    const list = [...filteredTasks];
    if (sortBy === "dueDate") {
      list.sort((a, b) => {
        if (a.dueDate && b.dueDate) {
          const diff = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          if (diff !== 0) return diff;
        } else if (a.dueDate) {
          return -1;
        } else if (b.dueDate) {
          return 1;
        }
        return getPriorityWeight(b.priority) - getPriorityWeight(a.priority);
      });
    } else if (sortBy === "priority") {
      list.sort((a, b) => {
        const diff = getPriorityWeight(b.priority) - getPriorityWeight(a.priority);
        if (diff !== 0) return diff;
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        } else if (a.dueDate) {
          return -1;
        } else if (b.dueDate) {
          return 1;
        }
        return 0;
      });
    } else {
      list.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    }
    return list;
  }, [filteredTasks, sortBy]);

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
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterDueDate={filterDueDate}
        setFilterDueDate={setFilterDueDate}
        sortBy={sortBy}
        setSortBy={setSortBy}
        projects={projects}
        statusOptions={statusOptions}
      />

      {activeTab === "list" ? (
        <div className="flex-1 min-h-0 flex bg-white border border-slate-200/60 rounded-lg p-4 flex-col">
          <ProjectListTable
            tasks={sortedTasks}
            columns={columns}
            onTaskClick={(task) => handleTaskClick(task.id)}
            isPersonalProject={true}
            showProjectColumn={true}
          />
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
            showProjectPrefix={false}
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
