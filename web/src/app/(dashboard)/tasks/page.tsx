"use client";

import * as React from "react";
import { useMyTasks } from "@/hooks/useMyTasks";
import { TaskDetailModal, CalendarView } from "@/components/project";

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

  const [activeTab, setActiveTab] = React.useState<"list" | "calendar">("list");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterProject, setFilterProject] = React.useState("");
  const [filterPriority, setFilterPriority] = React.useState("all");

  const filteredTasks = React.useMemo(() => {
    return tasks.filter((t) => {
      const matchSearch = !searchQuery.trim() || t.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchProject = !filterProject || t.projectId === filterProject;
      
      let matchPriority = false;
      if (filterPriority === "all") {
        matchPriority = true;
      } else if (filterPriority === "Low") {
        matchPriority = t.priority === "Low" || !t.priority;
      } else {
        matchPriority = t.priority === filterPriority;
      }

      return matchSearch && matchProject && matchPriority;
    });
  }, [tasks, searchQuery, filterProject, filterPriority]);

  const stats = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return {
      total: tasks.length,
      overdue: tasks.filter((t) => !t.columnIsDone && t.dueDate && new Date(t.dueDate) < today).length,
      done: tasks.filter((t) => t.columnIsDone).length,
    };
  }, [tasks]);

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

  const formatDisplayDate = (dateStr: string | null) => {
    if (!dateStr) return "Không hạn chót";
    return new Date(dateStr).toLocaleDateString("vi-VN");
  };

  const getPriorityStyle = (priority: string | null) => {
    if (priority === "Critical") return "bg-red-50 text-red-700 border-red-200";
    if (priority === "High") return "bg-orange-50 text-orange-700 border-orange-200";
    if (priority === "Medium") return "bg-blue-50 text-blue-700 border-blue-200";
    return "bg-slate-50 text-slate-600 border-slate-200";
  };

  const getPriorityLabel = (priority: string | null) => {
    if (priority === "Critical") return "Khẩn cấp";
    if (priority === "High") return "Cao";
    if (priority === "Medium") return "Trung bình";
    return "Thấp";
  };

  if (isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center p-8 bg-slate-50/30">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-[#1868db]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-xs font-semibold text-slate-500">Đang tải danh sách công việc...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-slate-50/30 min-h-full flex flex-col select-none">
      {/* Title & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200/60 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#292a2e]">Công việc của tôi</h1>
          <p className="text-xs text-[#505258] mt-0.5">Quản lý và cập nhật tiến độ tất cả nhiệm vụ được giao cho bạn</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200/60 shrink-0">
          <button
            onClick={() => setActiveTab("list")}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${activeTab === "list" ? "bg-white text-[#1868db] shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
          >
            Danh sách
          </button>
          <button
            onClick={() => setActiveTab("calendar")}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${activeTab === "calendar" ? "bg-white text-[#1868db] shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
          >
            Lịch tháng
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            label: "Tổng công việc",
            value: stats.total,
            bg: "bg-blue-500/10 text-blue-600",
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
            )
          },
          {
            label: "Quá hạn",
            value: stats.overdue,
            bg: "bg-rose-500/10 text-rose-600",
            warn: stats.overdue > 0,
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            )
          },
          {
            label: "Đã hoàn thành",
            value: stats.done,
            bg: "bg-emerald-500/10 text-emerald-600",
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            )
          },
        ].map((c, i) => (
          <div key={i} className="bg-white border border-slate-200/60 rounded-xl p-4 shadow-2xs flex items-center justify-between hover:shadow-xs transition-shadow duration-200">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{c.label}</p>
              <h2 className={`text-2xl font-black mt-1 ${c.warn ? "text-red-600 animate-pulse" : "text-[#292a2e]"}`}>{c.value}</h2>
            </div>
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${c.bg}`}>
              {c.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-slate-200/60 rounded-xl p-3.5 shadow-2xs flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <input
            type="text"
            placeholder="Tìm kiếm công việc..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-[#292a2e] focus:outline-none focus:ring-2 focus:ring-[#1868db] focus:border-transparent transition-all"
          />
          <svg className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>

        <select
          value={filterProject}
          onChange={(e) => setFilterProject(e.target.value)}
          className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-[#292a2e] focus:outline-none cursor-pointer"
        >
          <option value="">📂 Tất cả dự án</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-[#292a2e] focus:outline-none cursor-pointer"
        >
          <option value="all">⚡ Tất cả độ ưu tiên</option>
          <option value="Critical">Khẩn cấp</option>
          <option value="High">Cao</option>
          <option value="Medium">Trung bình</option>
          <option value="Low">Thấp</option>
        </select>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-0 bg-white border border-slate-200/60 rounded-xl p-5 shadow-2xs overflow-y-auto">
        {activeTab === "list" ? (
          <div className="space-y-6 text-left">
            {[
              { title: "Quá hạn", data: groupedTasks.overdue, color: "bg-red-500 text-red-700", empty: "Không có công việc quá hạn" },
              { title: "Hôm nay", data: groupedTasks.today, color: "bg-blue-500 text-blue-700", empty: "Không có công việc trong hôm nay" },
              { title: "Tuần này", data: groupedTasks.upcoming, color: "bg-purple-500 text-purple-700", empty: "Không có công việc nào trong tuần này" },
              { title: "Khác / Chưa có hạn chót", data: groupedTasks.later, color: "bg-slate-400 text-slate-600", empty: "Không có công việc nào khác" },
            ].map((group, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${group.color.split(" ")[0]}`} />
                  <h3 className={`text-[11px] font-extrabold uppercase tracking-wider ${group.color.split(" ")[1]}`}>
                    {group.title} ({group.data.length})
                  </h3>
                </div>
                <div className="border border-slate-200/60 rounded-lg overflow-hidden divide-y divide-slate-100 bg-white">
                  {group.data.length > 0 ? (
                    group.data.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => handleTaskClick(task.id)}
                        className="px-4 py-3 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-4 cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`shrink-0 ${task.columnIsDone ? "text-slate-400" : "text-[#1868db]"}`}>
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10 9 9 9 8 9"></polyline>
                          </svg>
                          <span className={`text-xs font-bold truncate ${task.columnIsDone ? "line-through text-slate-400" : "text-slate-800"}`}>
                            {task.title}
                          </span>
                          <span className="px-2 py-0.5 rounded-[4px] text-[9px] font-extrabold bg-slate-100 text-slate-600 border border-slate-200/60 uppercase shrink-0">
                            {task.projectName}
                          </span>
                          <span className="px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold bg-blue-50 text-blue-600 border border-blue-100/50 shrink-0">
                            {task.columnName}
                          </span>
                        </div>
                        <div className="flex items-center gap-3.5 shrink-0">
                          <span className={`px-2 py-0.5 rounded-[4px] text-[9px] font-extrabold border ${getPriorityStyle(task.priority)}`}>
                            {getPriorityLabel(task.priority)}
                          </span>
                          <span className={`text-[11px] font-extrabold ${!task.columnIsDone && task.dueDate && new Date(task.dueDate) < new Date() ? "text-red-500" : "text-slate-400"}`}>
                            {formatDisplayDate(task.dueDate)}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-400 italic bg-slate-50/20">{group.empty}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-[600px] flex flex-col">
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
      </div>

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
