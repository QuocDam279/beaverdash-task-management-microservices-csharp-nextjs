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
}

export function ProjectListView({
  tasks,
  setTasks,
  columns,
  projectId,
  onRefresh,
  assignees,
  readOnly = false,
}: ProjectListViewProps) {
  const { user: currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedAssignee, setSelectedAssignee] = React.useState<string>("all");
  const [selectedPriority, setSelectedPriority] = React.useState<string>("all");
  const [selectedStatus, setSelectedStatus] = React.useState<string>("all");
  const [selectedDueDateFilter, setSelectedDueDateFilter] = React.useState<string>("all");
  
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
          <input
            type="text"
            placeholder="Tìm kiếm nhanh..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-56 px-3 py-1.5 text-xs border border-slate-200 rounded-[4px] bg-white text-[#292a2e] focus:outline-none focus:ring-1 focus:ring-[#1868db]"
          />

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-2 py-1.5 text-xs border border-slate-200 rounded-[4px] bg-white text-slate-700 font-semibold focus:outline-none"
          >
            <option value="all">Tất cả độ ưu tiên</option>
            <option value="Required">Bắt buộc</option>
            <option value="Important">Quan trọng</option>
            <option value="Extended">Mở rộng</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2 py-1.5 text-xs border border-slate-200 rounded-[4px] bg-white text-slate-700 font-semibold focus:outline-none"
          >
            <option value="all">Tất cả trạng thái</option>
            {columns.map((col) => (
              <option key={col.id} value={col.id}>{col.name}</option>
            ))}
          </select>

          {/* Due Date Filter */}
          <select
            value={selectedDueDateFilter}
            onChange={(e) => setSelectedDueDateFilter(e.target.value)}
            className="px-2 py-1.5 text-xs border border-slate-200 rounded-[4px] bg-white text-slate-700 font-semibold focus:outline-none"
          >
            <option value="all">Tất cả hạn chót</option>
            <option value="overdue">Quá hạn</option>
            <option value="upcoming7">Sắp đến hạn (7 ngày)</option>
          </select>

          {/* Assignees circles filter */}
          {assignees.length > 0 && (
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
          {(searchQuery || selectedAssignee !== "all" || selectedPriority !== "all" || selectedStatus !== "all" || selectedDueDateFilter !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedAssignee("all");
                setSelectedPriority("all");
                setSelectedStatus("all");
                setSelectedDueDateFilter("all");
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
        tasks={filteredTasks}
        columns={columns}
        onTaskClick={(task) => setSelectedTask(task)}
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
