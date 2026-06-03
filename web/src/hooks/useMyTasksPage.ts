import * as React from "react";
import { api } from "@/lib/api";
import { useAlertConfirm } from "@/components/providers/AlertConfirmProvider";
import type { TaskItem, BoardColumn } from "@/types/task";
import type { User } from "@/types/auth";

export interface AnnouncementStats {
  total: number;
  completed: number;
  uncompleted: number;
  overdueCount: number;
  upcomingCount: number;
}

export interface UniqueProject {
  id: string;
  name: string;
}

const getPriorityWeight = (p: string | null): number => {
  if (!p) return 0;
  switch (p) {
    case "Required": case "Critical": case "High": return 3;
    case "Important": case "Medium": return 2;
    case "Extended": case "Low": return 1;
    default: return 0;
  }
};

/**
 * Hook quản lý trạng thái và dữ liệu của trang My Tasks.
 */
export function useMyTasksPage(currentUser: User | null | undefined) {
  const { alert } = useAlertConfirm();
  const [tasks, setTasks] = React.useState<TaskItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Overlay state
  const [showAnnouncement, setShowAnnouncement] = React.useState(false);
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [isNotifLoading, setIsNotifLoading] = React.useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedProject, setSelectedProject] = React.useState("all");
  const [selectedStatus, setSelectedStatus] = React.useState("all");
  const [selectedPriority, setSelectedPriority] = React.useState("all");
  const [selectedDueDateFilter, setSelectedDueDateFilter] = React.useState("all");
  const [sortBy, setSortBy] = React.useState("dueDate");

  // Modal State
  const [selectedTask, setSelectedTask] = React.useState<TaskItem | null>(null);
  const [clickedSubtaskId, setClickedSubtaskId] = React.useState<string | null>(null);
  const [modalColumns, setModalColumns] = React.useState<BoardColumn[]>([]);
  const [modalAssignees, setModalAssignees] = React.useState<any[]>([]);

  const unreadNotifications = React.useMemo(() => 
    notifications.filter((n: any) => !n.isRead), [notifications]);

  React.useEffect(() => {
    if (!sessionStorage.getItem("beaverdash_announcement_shown")) {
      setShowAnnouncement(true);
    }
  }, []);

  React.useEffect(() => {
    if (!showAnnouncement) return;
    const fetchNotifs = async () => {
      try {
        setIsNotifLoading(true);
        const data = await api.get("/notifications");
        setNotifications(data || []);
      } catch (err) {
        console.error("Failed to load notifications:", err);
      } finally {
        setIsNotifLoading(false);
      }
    };
    fetchNotifs();
  }, [showAnnouncement]);

  const handleCloseAnnouncement = React.useCallback(() => {
    setShowAnnouncement(false);
    sessionStorage.setItem("beaverdash_announcement_shown", "true");
  }, []);

  const announcementStats = React.useMemo<AnnouncementStats>(() => {
    const now = new Date();
    const threeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    let completed = 0, overdue = 0, upcoming = 0;

    tasks.forEach((t: any) => {
      if (t.isCompleted) completed++;
      else if (t.dueDate) {
        const d = new Date(t.dueDate);
        if (d < now) overdue++;
        else if (d <= threeDays) upcoming++;
      }
    });
    return { total: tasks.length, completed, uncompleted: tasks.length - completed, overdueCount: overdue, upcomingCount: upcoming };
  }, [tasks]);

  const fetchTasks = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.get("/tasks");
      setTasks((data || []).map((t: any) => ({
        ...t, columnName: t.isCompleted ? "Đã hoàn thành" : "Chưa hoàn thành"
      })));
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Không thể tải danh sách công việc.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const uniqueProjects = React.useMemo<UniqueProject[]>(() => {
    const projs = new Map<string, string>();
    tasks.forEach((t: any) => {
      if (t.projectId && t.projectName) projs.set(t.projectId, t.projectName);
    });
    return Array.from(projs.entries()).map(([id, name]) => ({ id, name }));
  }, [tasks]);

  const filteredTasks = React.useMemo(() => {
    const now = new Date();
    const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return tasks.filter((t: any) => {
      const matchSearch = !searchQuery.trim() || 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.parentTaskTitle && t.parentTaskTitle.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchProj = selectedProject === "all" || t.projectId === selectedProject;
      const matchPrio = selectedPriority === "all" || t.priority === selectedPriority;
      const matchStatus = selectedStatus === "all" || (selectedStatus === "completed" ? t.isCompleted : !t.isCompleted);
      
      let matchDue = true;
      if (selectedDueDateFilter === "overdue") matchDue = !!t.dueDate && !t.isCompleted && new Date(t.dueDate) < now;
      else if (selectedDueDateFilter === "upcoming7") matchDue = !!t.dueDate && !t.isCompleted && new Date(t.dueDate) >= now && new Date(t.dueDate) <= sevenDays;

      return matchSearch && matchProj && matchPrio && matchStatus && matchDue;
    });
  }, [tasks, searchQuery, selectedProject, selectedPriority, selectedStatus, selectedDueDateFilter]);

  const sortedTasks = React.useMemo(() => {
    const list = [...filteredTasks];
    if (sortBy === "dueDate") {
      list.sort((a, b) => a.dueDate && b.dueDate ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime() : a.dueDate ? -1 : 1);
    } else if (sortBy === "priority") {
      list.sort((a, b) => getPriorityWeight(b.priority) - getPriorityWeight(a.priority));
    } else if (sortBy === "project") {
      list.sort((a: any, b: any) => (a.projectName || "").localeCompare(b.projectName || ""));
    }
    return list;
  }, [filteredTasks, sortBy]);

  const hasActiveFilters = !!searchQuery || selectedProject !== "all" || selectedPriority !== "all" || selectedStatus !== "all" || selectedDueDateFilter !== "all";

  const handleResetFilters = React.useCallback(() => {
    setSearchQuery(""); setSelectedProject("all"); setSelectedPriority("all"); setSelectedStatus("all"); setSelectedDueDateFilter("all"); setSortBy("dueDate");
  }, []);

  const handleTaskClick = React.useCallback(async (task: TaskItem) => {
    const parentId = (task as any).parentTaskId;
    if (!parentId) return;
    setClickedSubtaskId(task.id);
    try {
      const parentTask = await api.get(`/tasks/${parentId}`);
      if (!parentTask) return;
      setSelectedTask(parentTask);
      const projectId = parentTask.projectId || (task as any).projectId;
      if (projectId) {
        const board = await api.get(`/projects/${projectId}/board`);
        setModalColumns(board?.boardColumns || []);
        const overview = await api.get(`/projects/${projectId}/overview`);
        if (overview?.teamId) {
          const team = await api.get(`/teams/${overview.teamId}`);
          setModalAssignees(team?.members?.map((m: any) => ({
            id: m.userId, displayName: m.displayName, avatar: m.avatar, email: m.email, role: m.role
          })) || []);
        } else if (currentUser) {
          setModalAssignees([currentUser]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, [currentUser]);

  const handleUpdateTask = React.useCallback((updated: TaskItem) => {
    setSelectedTask(updated);
    fetchTasks();
  }, [fetchTasks]);

  const handleSubtaskDrop = React.useCallback(async (subTaskId: string, targetDate: Date) => {
    try {
      const origSubtask = tasks.find((t) => t.id === subTaskId) as any;
      if (!origSubtask) return;

      const newDueDate = new Date(
        targetDate.getFullYear(),
        targetDate.getMonth(),
        targetDate.getDate(),
        17, 0, 0
      ).toISOString();

      await api.patch(`/subtasks/${subTaskId}`, {
        title: origSubtask.title,
        assigneeUserId: currentUser?.id || null,
        dueDate: newDueDate,
        isCompleted: origSubtask.isCompleted,
        priority: origSubtask.priority || null,
      });

      setTasks((prev) =>
        prev.map((t) => (t.id === subTaskId ? { ...t, dueDate: newDueDate } : t))
      );
    } catch (err: any) {
      console.error("Failed to update subtask due date on drop:", err);
      alert(err.message || "Không thể cập nhật hạn hoàn thành.", "Thất bại", "danger");
    }
  }, [tasks, currentUser, alert]);

  return {
    tasks, isLoading, error, fetchTasks,
    showAnnouncement, notifications, isNotifLoading, unreadNotifications, handleCloseAnnouncement, announcementStats,
    searchQuery, setSearchQuery, selectedProject, setSelectedProject,
    selectedStatus, setSelectedStatus, selectedPriority, setSelectedPriority,
    selectedDueDateFilter, setSelectedDueDateFilter, sortBy, setSortBy,
    selectedTask, setSelectedTask, clickedSubtaskId, setClickedSubtaskId,
    modalColumns, setModalColumns, modalAssignees, setModalAssignees,
    uniqueProjects, filteredTasks, sortedTasks, hasActiveFilters,
    handleResetFilters, handleTaskClick, handleUpdateTask, handleSubtaskDrop, setTasks
  };
}
