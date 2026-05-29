"use client";

/**
 * @component ProjectListView
 * @description Phân phối dữ liệu và quản lý các bộ lọc tìm kiếm cho tab Danh sách công việc.
 */

import * as React from "react";
import { TaskItem, BoardColumn } from "@/types/task";
import { useAuth } from "@/components/providers/AuthProvider";
import { ProjectListTable } from "./ProjectListTable";
import { TaskDetailModal, CreateTaskModal } from "@/components/project";
import { Avatar } from "@/components/ui/Avatar";

interface ProjectListViewProps {
  tasks: TaskItem[];
  setTasks?: React.Dispatch<React.SetStateAction<TaskItem[]>>;
  columns: BoardColumn[];
  projectId: string;
  onRefresh: () => void;
  assignees: any[];
  readOnly?: boolean;
  isPersonalProject?: boolean;
}

export function ProjectListView({
  tasks,
  setTasks,
  columns,
  projectId,
  onRefresh,
  assignees,
  readOnly = false,
  isPersonalProject = false,
}: ProjectListViewProps) {
  const { user: currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedAssignee, setSelectedAssignee] = React.useState<string>("all");
  const [selectedPriority, setSelectedPriority] = React.useState<string>("all");
  const [selectedStatus, setSelectedStatus] = React.useState<string>("all");
  const [selectedDueDateFilter, setSelectedDueDateFilter] = React.useState<string>("all");
  const [sortBy, setSortBy] = React.useState<string>("manual");
  
  const [selectedTask, setSelectedTask] = React.useState<TaskItem | null>(null);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = React.useState(false);

  // Filter tasks based on selected filter values
  const filteredTasks = React.useMemo(() => {
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);
    const doneColumnIds = columns.filter(c => c.isDone).map(c => c.id);

    return tasks.filter((t) => {
      const matchSearch =
        !searchQuery.trim() ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchAssignee =
        selectedAssignee === "all" ||
        (selectedAssignee === "unassigned"
          ? (t.subTasks && t.subTasks.some((st) => !st.assigneeUserId && !st.isCompleted))
          : (t.subTasks && t.subTasks.some((st) => st.assigneeUserId === selectedAssignee)));


      
      const matchPriority =
        selectedPriority === "all" || t.priority === selectedPriority;
      
      const matchStatus =
        selectedStatus === "all" || t.boardColumnId === selectedStatus;

      let matchDueDate = true;
      if (selectedDueDateFilter === "overdue") {
        matchDueDate =
          !!t.dueDate &&
          !doneColumnIds.includes(t.boardColumnId) &&
          new Date(t.dueDate) < now;
      } else if (selectedDueDateFilter === "upcoming7") {
        matchDueDate =
          !!t.dueDate &&
          !doneColumnIds.includes(t.boardColumnId) &&
          new Date(t.dueDate) >= now &&
          new Date(t.dueDate) <= sevenDaysFromNow;
      }

      return matchSearch && matchAssignee && matchPriority && matchStatus && matchDueDate;
    });
  }, [tasks, columns, searchQuery, selectedAssignee, selectedPriority, selectedStatus, selectedDueDateFilter]);

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

  const handleUpdateTask = (updatedTask: TaskItem) => {
    if (setTasks) {
      setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    }
    if (selectedTask?.id === updatedTask.id) setSelectedTask(updatedTask);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-4">
      {/* FILTER TOOLBAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div className="flex flex-wrap items-center gap-2">
          {/* Text Search */}
          <div className="relative">
            <svg className="absolute left-2.5 top-[9px] h-3.5 w-3.5 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              placeholder="Tìm kiếm nhanh..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-56 pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-[4px] bg-white text-[#292a2e] focus:outline-none focus:ring-1 focus:ring-[#1868db]"
            />
          </div>

          {/* Priority Filter */}
          <div className="relative">
            <svg className="absolute left-2.5 top-[9px] h-3.5 w-3.5 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21v8h-6l-1-1H5v6h-2z" />
            </svg>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="pl-7 pr-2 py-1.5 text-xs border border-slate-200 rounded-[4px] bg-white text-slate-700 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all">Tất cả độ ưu tiên</option>
              <option value="Required">Bắt buộc</option>
              <option value="Important">Quan trọng</option>
              <option value="Extended">Mở rộng</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <svg className="absolute left-2.5 top-[9px] h-3.5 w-3.5 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="pl-7 pr-2 py-1.5 text-xs border border-slate-200 rounded-[4px] bg-white text-slate-700 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all">Tất cả trạng thái</option>
              {columns.map((col) => (
                <option key={col.id} value={col.id}>{col.name}</option>
              ))}
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
              value={selectedDueDateFilter}
              onChange={(e) => setSelectedDueDateFilter(e.target.value)}
              className="pl-7 pr-2 py-1.5 text-xs border border-slate-200 rounded-[4px] bg-white text-slate-700 font-semibold focus:outline-none cursor-pointer"
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
              className="pl-7 pr-2 py-1.5 text-xs border border-slate-200 rounded-[4px] bg-white text-slate-700 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="manual">Sắp xếp: Thủ công</option>
              <option value="dueDate">Sắp xếp: Hạn chót</option>
              <option value="priority">Sắp xếp: Độ ưu tiên</option>
            </select>
          </div>

          {/* Assignees circles filter */}
          {!isPersonalProject && assignees.length > 0 && (
            <div className="flex items-center gap-1 ml-1 pl-2 border-l border-slate-200">
              <span className="text-xs text-[#505258] font-semibold mr-1.5">Người thực hiện:</span>
              <div className="flex -space-x-1.5 items-center">
                 {assignees.map((user) => {
                  const isSelected = selectedAssignee === user.id;
                  return (
                    <button
                      key={user.id}
                      onClick={() => setSelectedAssignee(isSelected ? "all" : user.id)}
                      title={user.displayName}
                      className={`h-7 w-7 rounded-full border-2 transition-all cursor-pointer ${
                        isSelected ? "border-[#1868db] scale-110 z-10" : "border-white hover:border-slate-300"
                      }`}
                    >
                      <Avatar
                        src={user.avatar}
                        alt={user.displayName}
                        className="h-full w-full rounded-full"
                      />
                    </button>
                  );
                })}
                
                {/* Unassigned button (avatar trống) */}
                <button
                  onClick={() => setSelectedAssignee(selectedAssignee === "unassigned" ? "all" : "unassigned")}
                  title="Công việc hoặc subtask chưa phân công"
                  className={`h-7 w-7 rounded-full border-2 border-dashed transition-all cursor-pointer flex items-center justify-center bg-slate-50 hover:bg-slate-100 hover:border-slate-400 ml-1.5 ${
                    selectedAssignee === "unassigned" ? "border-[#1868db] bg-blue-50/50 scale-110 z-10" : "border-slate-300"
                  }`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={selectedAssignee === "unassigned" ? "text-[#1868db]" : "text-slate-400"}>
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </button>

              </div>
            </div>
          )}

          {/* Clear Filters */}
          {(searchQuery || (!isPersonalProject && selectedAssignee !== "all") || selectedPriority !== "all" || selectedStatus !== "all" || selectedDueDateFilter !== "all" || sortBy !== "manual") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedAssignee("all");
                setSelectedPriority("all");
                setSelectedStatus("all");
                setSelectedDueDateFilter("all");
                setSortBy("manual");
              }}
              className="text-xs font-bold text-[#1868db] hover:text-[#0052cc] px-2 py-1 cursor-pointer transition-colors"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>

        {!readOnly && (
          <button
            onClick={() => setIsCreateTaskModalOpen(true)}
            className="px-3.5 py-1.5 bg-[#1868db] hover:bg-[#0052cc] text-white text-xs font-bold rounded-[4px] cursor-pointer flex items-center gap-1 shadow-xs transition-colors"
          >
            Tạo công việc
          </button>
        )}
      </div>

      {/* TASK LIST TABLE */}
      <ProjectListTable
        tasks={sortedTasks}
        columns={columns}
        onTaskClick={(task) => setSelectedTask(task)}
        isPersonalProject={isPersonalProject}
      />

      {/* MODALS */}
      {selectedTask && (
        <TaskDetailModal
          isOpen={!!selectedTask}
          onClose={() => { setSelectedTask(null); onRefresh(); }}
          task={selectedTask}
          columns={columns}
          onUpdateTask={handleUpdateTask}
          assignees={assignees}
          readOnly={readOnly}
        />
      )}

      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        columns={columns}
        assignees={assignees}
        onTaskCreated={onRefresh}
      />
    </div>
  );
}
