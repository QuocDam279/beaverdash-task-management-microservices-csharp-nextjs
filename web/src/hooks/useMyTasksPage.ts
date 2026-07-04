import * as React from "react";
import { api } from "@/lib/api";
import { useAlertConfirm } from "@/components/providers/AlertConfirmProvider";
import type { TaskItem, BoardColumn, Notification } from "@/types/task";
import type { User } from "@/types/auth";
import type { TeamMemberDto, TeamMemberInfo } from "@/types/api";

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

export interface BackendStats {
  totalTasksCount: number;
  completedTasksCount: number;
  uncompletedTasksCount: number;
  inactiveTasksCount?: number;
  overdueTasks: TaskItem[];
  todayTasks: TaskItem[];
  upcomingTasks: TaskItem[];
  urgentTasks: TaskItem[];
}

export interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

const DEFAULT_PAGE_SIZE = 10;
const CALENDAR_PAGE_SIZE = 1000;

/**
 * Hook quản lý trạng thái và dữ liệu của trang My Tasks.
 * Mọi logic lọc, sắp xếp và phân trang đều được ủy quyền cho Backend.
 */
export function useMyTasksPage(currentUser: User | null | undefined) {
  const { alert } = useAlertConfirm();
  const [tasks, setTasks] = React.useState<TaskItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(DEFAULT_PAGE_SIZE);
  const [totalCount, setTotalCount] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(0);

  // Backend Stats
  const [backendStats, setBackendStats] = React.useState<BackendStats | null>(null);

  // View Mode (list or calendar) — drives pageSize
  const [viewMode, setViewMode] = React.useState<"list" | "calendar">("list");

  // Overlay state
  const [showAnnouncement, setShowAnnouncement] = React.useState(true);
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [isNotifLoading, setIsNotifLoading] = React.useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = React.useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = React.useState("");
  const [selectedProject, setSelectedProject] = React.useState("all");
  const [selectedStatus, setSelectedStatus] = React.useState("uncompleted");
  const [selectedPriority, setSelectedPriority] = React.useState("all");
  const [selectedSprintFilter, setSelectedSprintFilter] = React.useState("active");
  const [selectedDueDateFilter, setSelectedDueDateFilter] = React.useState("all");
  const [sortBy, setSortBy] = React.useState("dueDate");

  // Modal State
  const [selectedTask, setSelectedTask] = React.useState<TaskItem | null>(null);
  const [clickedSubtaskId, setClickedSubtaskId] = React.useState<string | null>(null);
  const [modalColumns, setModalColumns] = React.useState<BoardColumn[]>([]);
  const [modalAssignees, setModalAssignees] = React.useState<TeamMemberInfo[]>([]);

  // Unique projects (derived from all tasks fetched across pages via stats)
  const [uniqueProjects, setUniqueProjects] = React.useState<UniqueProject[]>([]);

  const unreadNotifications = React.useMemo(() => 
    notifications.filter((n: Notification) => !n.isRead), [notifications]);

  // Debounce search query to avoid excessive API calls while typing
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

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
    // Keep it always visible, this is a no-op
  }, []);

  const announcementStats = React.useMemo<AnnouncementStats>(() => {
    if (backendStats) {
      return {
        total: backendStats.totalTasksCount,
        completed: backendStats.completedTasksCount,
        uncompleted: backendStats.uncompletedTasksCount,
        overdueCount: backendStats.overdueTasks?.length || 0,
        upcomingCount: backendStats.todayTasks?.length || 0,
      };
    }
    return { total: 0, completed: 0, uncompleted: 0, overdueCount: 0, upcomingCount: 0 };
  }, [backendStats]);

  // Compute the effective pageSize based on viewMode
  const effectivePageSize = viewMode === "calendar" ? CALENDAR_PAGE_SIZE : pageSize;

  // Keep track of the last queried combination to prevent duplicate calls / infinite loops
  const lastFetchedRef = React.useRef({
    page: -1,
    debouncedSearchQuery: "",
    selectedProject: "",
    selectedStatus: "",
    selectedPriority: "",
    selectedSprintFilter: "",
    selectedDueDateFilter: "",
    sortBy: "",
    effectivePageSize: 0
  });

  const fetchTasks = React.useCallback(async (page?: number, force?: boolean) => {
    try {
      const filtersChanged = 
        lastFetchedRef.current.debouncedSearchQuery !== debouncedSearchQuery ||
        lastFetchedRef.current.selectedProject !== selectedProject ||
        lastFetchedRef.current.selectedStatus !== selectedStatus ||
        lastFetchedRef.current.selectedPriority !== selectedPriority ||
        lastFetchedRef.current.selectedSprintFilter !== selectedSprintFilter ||
        lastFetchedRef.current.selectedDueDateFilter !== selectedDueDateFilter ||
        lastFetchedRef.current.sortBy !== sortBy ||
        lastFetchedRef.current.effectivePageSize !== effectivePageSize;

      let targetPage = page ?? currentPage;
      if (filtersChanged && page === undefined) {
        targetPage = 1;
      }

      // Skip duplicate fetches unless forced (e.g. on retry or explicit updates)
      if (
        !force &&
        !filtersChanged &&
        lastFetchedRef.current.page === targetPage &&
        lastFetchedRef.current.debouncedSearchQuery === debouncedSearchQuery &&
        lastFetchedRef.current.selectedProject === selectedProject &&
        lastFetchedRef.current.selectedStatus === selectedStatus &&
        lastFetchedRef.current.selectedPriority === selectedPriority &&
        lastFetchedRef.current.selectedSprintFilter === selectedSprintFilter &&
        lastFetchedRef.current.selectedDueDateFilter === selectedDueDateFilter &&
        lastFetchedRef.current.sortBy === sortBy &&
        lastFetchedRef.current.effectivePageSize === effectivePageSize
      ) {
        return;
      }

      // Update the ref
      lastFetchedRef.current = {
        page: targetPage,
        debouncedSearchQuery,
        selectedProject,
        selectedStatus,
        selectedPriority,
        selectedSprintFilter,
        selectedDueDateFilter,
        sortBy,
        effectivePageSize
      };

      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.set("pageNumber", String(targetPage));
      params.set("pageSize", String(effectivePageSize));
      params.set("sortBy", sortBy);

      if (debouncedSearchQuery.trim()) {
        params.set("searchQuery", debouncedSearchQuery.trim());
      }
      if (selectedProject !== "all") {
        params.set("projectId", selectedProject);
      }
      if (selectedStatus !== "all") {
        params.set("status", selectedStatus);
      }
      if (selectedPriority !== "all") {
        params.set("priority", selectedPriority);
      }
      if (selectedSprintFilter !== "active") {
        params.set("sprintFilter", selectedSprintFilter);
      }
      if (selectedDueDateFilter !== "all") {
        params.set("dueDateFilter", selectedDueDateFilter);
      }

      const data = await api.get(`/tasks?${params.toString()}`);

      if (data) {
        const items = (data.items || []).map((t: TaskItem) => ({
          ...t, columnName: t.isCompleted ? "Đã hoàn thành" : "Chưa hoàn thành"
        }));
        setTasks(items);
        setTotalCount(data.totalCount || 0);
        setTotalPages(data.totalPages || 0);

        if (data.pageNumber && data.pageNumber !== currentPage) {
          setCurrentPage(data.pageNumber);
        } else if (filtersChanged && currentPage !== 1) {
          setCurrentPage(1);
        }

        // Set backend stats
        setBackendStats({
          totalTasksCount: data.totalTasksCount ?? 0,
          completedTasksCount: data.completedTasksCount ?? 0,
          uncompletedTasksCount: data.uncompletedTasksCount ?? 0,
          inactiveTasksCount: data.inactiveTasksCount ?? 0,
          overdueTasks: (data.overdueTasks || []).map((t: TaskItem) => ({
            ...t, columnName: t.isCompleted ? "Đã hoàn thành" : "Chưa hoàn thành"
          })),
          todayTasks: (data.todayTasks || []).map((t: TaskItem) => ({
            ...t, columnName: t.isCompleted ? "Đã hoàn thành" : "Chưa hoàn thành"
          })),
          upcomingTasks: (data.upcomingTasks || []).map((t: TaskItem) => ({
            ...t, columnName: t.isCompleted ? "Đã hoàn thành" : "Chưa hoàn thành"
          })),
          urgentTasks: (data.urgentTasks || []).map((t: TaskItem) => ({
            ...t, columnName: t.isCompleted ? "Đã hoàn thành" : "Chưa hoàn thành"
          })),
        });

        // Extract unique projects from the items + overdue + today tasks for filter dropdown
        const allTasks = [
          ...items,
          ...(data.overdueTasks || []),
          ...(data.todayTasks || []),
          ...(data.upcomingTasks || []),
          ...(data.urgentTasks || [])
        ];
        
        setUniqueProjects((prev) => {
          const map = new Map<string, string>();
          prev.forEach((p) => map.set(p.id, p.name));
          allTasks.forEach((t: TaskItem) => {
            if (t.projectId && t.projectName) map.set(t.projectId, t.projectName);
          });
          return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
        });
      }
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "Không thể tải danh sách công việc.");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, effectivePageSize, debouncedSearchQuery, selectedProject, selectedStatus, selectedPriority, selectedSprintFilter, selectedDueDateFilter, sortBy]);

  // Re-fetch when any filter/sort/page changes
  React.useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // Since backend handles filtering/sorting, tasks from API are already filtered and sorted
  const filteredTasks = tasks;
  const sortedTasks = tasks;

  const hasActiveFilters = !!searchQuery || selectedProject !== "all" || selectedStatus !== "uncompleted" || selectedPriority !== "all" || selectedSprintFilter !== "active" || selectedDueDateFilter !== "all";

  const handleResetFilters = React.useCallback(() => {
    setSearchQuery(""); setSelectedProject("all"); setSelectedStatus("uncompleted"); setSelectedPriority("all"); setSelectedSprintFilter("active"); setSelectedDueDateFilter("all"); setSortBy("dueDate");
  }, []);

  const goToPage = React.useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

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
          setModalAssignees(team?.members?.map((m: TeamMemberDto) => ({
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
    } catch (err: unknown) {
      console.error("Failed to update subtask due date on drop:", err);
      const message = err instanceof Error ? err.message : String(err);
      alert(message || "Không thể cập nhật hạn hoàn thành.", "Thất bại", "danger");
    }
  }, [tasks, currentUser, alert]);

  const handleViewModeChange = React.useCallback((mode: "list" | "calendar") => {
    setViewMode(mode);
    setCurrentPage(1);
  }, []);

  return {
    tasks, isLoading, error, fetchTasks,
    showAnnouncement, notifications, isNotifLoading, unreadNotifications, handleCloseAnnouncement, announcementStats,
    searchQuery, setSearchQuery, selectedProject, setSelectedProject,
    selectedStatus, setSelectedStatus, selectedPriority, setSelectedPriority,
    selectedSprintFilter, setSelectedSprintFilter,
    selectedDueDateFilter, setSelectedDueDateFilter, sortBy, setSortBy,
    selectedTask, setSelectedTask, clickedSubtaskId, setClickedSubtaskId,
    modalColumns, setModalColumns, modalAssignees, setModalAssignees,
    uniqueProjects, filteredTasks, sortedTasks, hasActiveFilters,
    handleResetFilters, handleTaskClick, handleUpdateTask, handleSubtaskDrop, setTasks,
    // Pagination
    currentPage, totalCount, totalPages, pageSize, goToPage,
    // Backend Stats
    backendStats,
    // View mode
    viewMode, handleViewModeChange,
  };
}
