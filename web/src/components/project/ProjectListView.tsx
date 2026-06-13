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
import { ListToolbar } from "./ListToolbar";

interface ProjectListViewProps {
  tasks: TaskItem[];
  setTasks?: React.Dispatch<React.SetStateAction<TaskItem[]>>;
  columns: BoardColumn[];
  projectId: string;
  onRefresh: () => void;
  assignees: any[];
  readOnly?: boolean;
  isPersonalProject?: boolean;
  projectStartDate?: string | null;
  projectDueDate?: string | null;
  sprints?: any[];
  selectedSprintId?: string;
  setSelectedSprintId?: (id: string) => void;
  activeSprintName?: string | null;
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
  projectStartDate = null,
  projectDueDate = null,
  sprints = [],
  selectedSprintId = "active",
  setSelectedSprintId = () => {},
  activeSprintName = null,
}: ProjectListViewProps) {
  const { user: currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedAssignee, setSelectedAssignee] = React.useState<string>("all");
  const [selectedPriority, setSelectedPriority] = React.useState<string>("all");
  const [selectedStatus, setSelectedStatus] = React.useState<string>("all");
  const [selectedDueDateFilter, setSelectedDueDateFilter] = React.useState<string>("all");
  const [sortBy, setSortBy] = React.useState<string>("dueDate");
  
  const [selectedTask, setSelectedTask] = React.useState<TaskItem | null>(null);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = React.useState(false);

  // Filter tasks based on selected filter values
  const filteredTasks = React.useMemo(() => {
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);
    const doneColumnIds = columns.filter(c => c.isDone).map(c => c.id);

    return tasks.filter((t) => {
      const query = searchQuery.toLowerCase();
      const matchSearch =
        !searchQuery.trim() ||
        t.title.toLowerCase().includes(query) ||
        (t.description && t.description.toLowerCase().includes(query)) ||
        (t.subTasks && t.subTasks.some((st) => st.title.toLowerCase().includes(query)));
      
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
      <ListToolbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        assignees={assignees}
        selectedAssignee={selectedAssignee}
        setSelectedAssignee={setSelectedAssignee}
        selectedPriority={selectedPriority}
        setSelectedPriority={setSelectedPriority}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        selectedDueDateFilter={selectedDueDateFilter}
        setSelectedDueDateFilter={setSelectedDueDateFilter}
        columns={columns}
        sortBy={sortBy}
        setSortBy={setSortBy}
        onCreateTaskClick={() => setIsCreateTaskModalOpen(true)}
        readOnly={readOnly}
        isPersonalProject={isPersonalProject}
        sprints={sprints}
        selectedSprintId={selectedSprintId}
        setSelectedSprintId={setSelectedSprintId}
        activeSprintName={activeSprintName}
      />

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
        projectStartDate={projectStartDate}
        projectDueDate={projectDueDate}
      />
    </div>
  );
}
