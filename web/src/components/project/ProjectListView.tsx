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
  setTasks: React.Dispatch<React.SetStateAction<TaskItem[]>>;
  columns: BoardColumn[];
  projectId: string;
  onRefresh: () => void;
  assignees: any[];
}

export function ProjectListView({
  tasks,
  setTasks,
  columns,
  projectId,
  onRefresh,
  assignees,
}: ProjectListViewProps) {
  const { user: currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedAssignee, setSelectedAssignee] = React.useState<string>("all");
  const [selectedPriority, setSelectedPriority] = React.useState<string>("all");
  const [selectedStatus, setSelectedStatus] = React.useState<string>("all");
  
  const [selectedTask, setSelectedTask] = React.useState<TaskItem | null>(null);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = React.useState(false);

  // Filter tasks based on selected filter values
  const filteredTasks = React.useMemo(() => {
    return tasks.filter((t) => {
      const matchSearch =
        !searchQuery.trim() ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchAssignee =
        selectedAssignee === "all" ||
        t.assigneeUserId === selectedAssignee ||
        (t.subTasks && t.subTasks.some((st) => st.assigneeUserId === selectedAssignee));
      
      const matchPriority =
        selectedPriority === "all" || t.priority === selectedPriority;
      
      const matchStatus =
        selectedStatus === "all" || t.boardColumnId === selectedStatus;

      return matchSearch && matchAssignee && matchPriority && matchStatus;
    });
  }, [tasks, searchQuery, selectedAssignee, selectedPriority, selectedStatus]);

  const handleUpdateTask = (updatedTask: TaskItem) => {
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
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
            <option value="Critical">Khẩn cấp</option>
            <option value="High">Cao</option>
            <option value="Medium">Trung bình</option>
            <option value="Low">Thấp</option>
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
              </div>
            </div>
          )}

          {/* Clear Filters */}
          {(searchQuery || selectedAssignee !== "all" || selectedPriority !== "all" || selectedStatus !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedAssignee("all");
                setSelectedPriority("all");
                setSelectedStatus("all");
              }}
              className="text-xs font-bold text-[#1868db] hover:text-[#0052cc] px-2 py-1 cursor-pointer transition-colors"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>

        <button
          onClick={() => setIsCreateTaskModalOpen(true)}
          className="px-3.5 py-1.5 bg-[#1868db] hover:bg-[#0052cc] text-white text-xs font-bold rounded-[4px] cursor-pointer flex items-center gap-1 shadow-xs transition-colors"
        >
          Tạo công việc
        </button>
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
