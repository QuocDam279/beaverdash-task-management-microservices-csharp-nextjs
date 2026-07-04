"use client";

import * as React from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { TaskItem, BoardColumn } from "@/types/task";
import type { BoardColumnDto, BoardTaskItemDto, SubTaskBoardDto, TeamMemberInfo, TeamMemberDto, SprintLookupDto } from "@/types/api";
import { api } from "@/lib/api";
import { useAlertConfirm } from "@/components/providers/AlertConfirmProvider";
import { useToast } from "@/components/providers/ToastProvider";

export function useBoard(projectId: string) {
  const { user: currentUser } = useAuth();
  const { alert } = useAlertConfirm();
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  const [columns, setColumns] = React.useState<BoardColumn[]>([]);
  const [tasks, setTasks] = React.useState<TaskItem[]>([]);
  const [selectedTaskState, setSelectedTaskState] = React.useState<TaskItem | null>(null);
  const [assignees, setAssignees] = React.useState<TeamMemberInfo[]>([]);
  const [projectStartDate, setProjectStartDate] = React.useState<string | null>(null);
  const [projectDueDate, setProjectDueDate] = React.useState<string | null>(null);
  const [isPersonalProject, setIsPersonalProject] = React.useState(false);
  const [isLeaderOrOwner, setIsLeaderOrOwner] = React.useState(false);
  const [activeSprintId, setActiveSprintId] = React.useState<string | null>(null);
  const [activeSprintName, setActiveSprintName] = React.useState<string | null>(null);
  const [activeSprintEndDate, setActiveSprintEndDate] = React.useState<string | null>(null);
  const [selectedSprintId, setSelectedSprintId] = React.useState<string>("active");
  const [sprints, setSprints] = React.useState<SprintLookupDto[]>([]);

  const [searchQuery, setSearchQuery] = React.useState("");

  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Column creation states
  const [isAddingColumn, setIsAddingColumn] = React.useState(false);
  const [newColName, setNewColName] = React.useState("");
  const [newColWip, setNewColWip] = React.useState<number | null>(null);

  // Column management modal states
  const [wipModalColumn, setWipModalColumn] = React.useState<BoardColumn | null>(null);
  const [deleteModalColumn, setDeleteModalColumn] = React.useState<BoardColumn | null>(null);

  const fetchBoardData = React.useCallback(async (silent = false) => {
    try {
      if (!silent) {
        setIsLoading(true);
      }
      setError(null);
      const overview = await api.get(`/projects/${projectId}/overview`);
      
      let boardUrl = `/projects/${projectId}/board`;
      if (selectedSprintId !== "active") {
        boardUrl += `?sprintId=${selectedSprintId}`;
      }
      const board = await api.get(boardUrl);
      
      if (overview) {
        setProjectStartDate(overview.startDate || null);
        setProjectDueDate(overview.dueDate || null);
        setIsPersonalProject(overview.teamId === null || !overview.teamId);

        const userWorkload = overview.memberWorkloads?.find((w: any) => w.userId === currentUser?.id);
        const isLeader = overview.teamId
          ? userWorkload?.role === "Trưởng nhóm"
          : overview.createdByUserId === currentUser?.id || userWorkload?.role === "Chủ sở hữu";
        setIsLeaderOrOwner(!!isLeader);
      }
      
      if (board) {
        setActiveSprintId(board.activeSprintId || null);
        setActiveSprintName(board.activeSprintName || null);
        setActiveSprintEndDate(board.activeSprintEndDate || null);
        setSprints(board.sprints || []);
        const cols = board.boardColumns || [];
        setColumns(cols);
        
        const allTasks: TaskItem[] = cols.flatMap((col: BoardColumnDto) =>
          (col.taskItems || []).map((t: BoardTaskItemDto) => ({
            ...t,
            projectStartDate: overview?.startDate || board?.startDate || null,
            projectDueDate: overview?.dueDate || board?.dueDate || null,
            subTasks: (t.subTasks || []).map((st: SubTaskBoardDto) => ({
              ...st,
              assigneeUser: st.assigneeUserId ? {
                id: st.assigneeUserId,
                displayName: st.assigneeName,
                avatar: st.assigneeAvatar
              } : null
            }))
          }))
        );
        setTasks(allTasks);
      }
      
      if (overview?.teamId) {
        const team = await api.get(`/teams/${overview.teamId}`);
        if (team?.members) {
          setAssignees(team.members.map((m: TeamMemberDto) => ({
            id: m.userId,
            displayName: m.displayName,
            avatar: m.avatar,
            email: m.email,
            role: m.role,
          })));
        }
      } else if (currentUser) {
        setAssignees([currentUser]);
      }
    } catch (err: unknown) {
      console.error("Failed to load project board:", err);
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "Đã xảy ra lỗi khi tải dữ liệu bảng.");
    } finally {
      setIsLoading(false);
    }
  }, [projectId, currentUser, selectedSprintId]);

  React.useEffect(() => {
    fetchBoardData();
  }, [fetchBoardData]);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const taskIdParam = searchParams ? searchParams.get("taskId") : null;

  const selectedTask = selectedTaskState;
  const justClosedRef = React.useRef<string | null>(null);
  const fetchingTaskIdRef = React.useRef<string | null>(null);

  const selectedPriority = searchParams ? searchParams.get("priority") : null;
  const selectedDueDateFilter = searchParams ? searchParams.get("dueDate") : null;
  const selectedAssignee = searchParams ? searchParams.get("assigneeId") : null;
  const sortBy = (searchParams && searchParams.get("sortBy")) || "manual";
  const groupBy = (searchParams && searchParams.get("groupBy")) || "none";

  const handleSetPriority = React.useCallback((val: string | null) => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (val) params.set("priority", val);
      else params.delete("priority");
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    }
  }, [pathname, router]);

  const handleSetDueDateFilter = React.useCallback((val: string | null) => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (val) params.set("dueDate", val);
      else params.delete("dueDate");
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    }
  }, [pathname, router]);

  const handleSetAssignee = React.useCallback((val: string | null) => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (val) params.set("assigneeId", val);
      else params.delete("assigneeId");
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    }
  }, [pathname, router]);

  const handleSetSortBy = React.useCallback((val: string) => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (val && val !== "manual") params.set("sortBy", val);
      else params.delete("sortBy");
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    }
  }, [pathname, router]);

  const handleSetGroupBy = React.useCallback((val: string) => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (val && val !== "none") params.set("groupBy", val);
      else params.delete("groupBy");
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    }
  }, [pathname, router]);

  const handleResetFilters = React.useCallback(() => {
    setSearchQuery("");
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      params.delete("assigneeId");
      params.delete("priority");
      params.delete("dueDate");
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    }
  }, [pathname, router]);

  const setSelectedTask = React.useCallback((task: TaskItem | null) => {
    console.log("setSelectedTask called with:", task?.id, task);
    if (task === null) {
      if (selectedTaskState) {
        justClosedRef.current = selectedTaskState.id;
      }
      // Update URL to remove taskId
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        if (params.has("taskId")) {
          params.delete("taskId");
          const query = params.toString();
          router.replace(query ? `${pathname}?${query}` : pathname);
        }
      }
      setSelectedTaskState(null);
    } else {
      setSelectedTaskState(task);
    }
  }, [selectedTaskState, pathname, router]);

  // Sync state from URL to selectedTask
  React.useEffect(() => {
    console.log("useBoard sync effect:", { taskIdParam, selectedTaskStateId: selectedTaskState?.id });
    if (taskIdParam) {
      if (justClosedRef.current === taskIdParam) {
        console.log("sync effect skipped: justClosedRef matches");
        return;
      }
      if (!selectedTaskState || selectedTaskState.id !== taskIdParam) {
        if (fetchingTaskIdRef.current === taskIdParam) {
          console.log("sync effect skipped: already fetching this task ID");
          return;
        }
        console.log("sync effect triggering fetch for task:", taskIdParam);
        fetchingTaskIdRef.current = taskIdParam;
        
        // Fetch details asynchronously within the effect
        (async () => {
          try {
            const fullTask = await api.get(`/tasks/${taskIdParam}`);
            if (fullTask) {
              const taskId = fullTask.id || fullTask.Id || taskIdParam;
              
              // Map subTasks to include assigneeUser and comments.user properties
              const mappedSubTasks = (fullTask.subTasks || []).map((st: any) => ({
                ...st,
                assigneeUser: st.assigneeUserId ? {
                  id: st.assigneeUserId,
                  displayName: st.assigneeName,
                  avatar: st.assigneeAvatar
                } : null,
                comments: (st.comments || []).map((c: any) => ({
                  ...c,
                  user: c.userId ? {
                    id: c.userId,
                    displayName: c.userName,
                    avatar: c.userAvatar
                  } : null
                }))
              }));

              setSelectedTaskState({
                ...fullTask,
                id: taskId,
                createdByUser: fullTask.createdByName ? {
                  displayName: fullTask.createdByName,
                  avatar: fullTask.createdByAvatar
                } : null,
                subTasks: mappedSubTasks
              });
            }
          } catch (err) {
            console.error("Failed to load task details in sync effect:", err);
          } finally {
            fetchingTaskIdRef.current = null;
          }
        })();
      }
    } else {
      justClosedRef.current = null;
      fetchingTaskIdRef.current = null;
      if (selectedTaskState) {
        console.log("sync effect clearing selectedTaskState");
        setSelectedTaskState(null);
      }
    }
  }, [taskIdParam, selectedTaskState]);

  const handleTaskClick = React.useCallback((task: TaskItem) => {
    console.log("handleTaskClick called (updating URL only):", task.id);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("taskId") !== task.id) {
        params.set("taskId", task.id);
        router.replace(`${pathname}?${params.toString()}`);
      }
    }
  }, [pathname, router]);

  const handleCreateColumn = async () => {
    if (!newColName.trim()) return;
    try {
      await api.post("/boardcolumns", {
        projectId,
        name: newColName.trim(),
        position: columns.length + 1,
        wipLimit: newColWip,
        isDone: false,
      });
      setIsAddingColumn(false);
      setNewColName("");
      setNewColWip(null);
      fetchBoardData(true);
    } catch (err) {
      console.error("Failed to create board column:", err);
    }
  };

  const handleMoveColumn = async (columnId: string, direction: "left" | "right") => {
    const index = columns.findIndex((c) => c.id === columnId);
    if (index === -1) return;
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= columns.length) return;

    const colA = columns[index];
    const colB = columns[targetIndex];

    try {
      // Swap positions
      await Promise.all([
        api.patch(`/boardcolumns/${colA.id}`, {
          name: colA.name,
          position: colB.position,
          wipLimit: colA.wipLimit,
          isDone: colA.isDone
        }),
        api.patch(`/boardcolumns/${colB.id}`, {
          name: colB.name,
          position: colA.position,
          wipLimit: colB.wipLimit,
          isDone: colB.isDone
        })
      ]);
      fetchBoardData(true);
    } catch (err) {
      console.error("Failed to move column:", err);
    }
  };

  const handleSwapColumns = async (sourceColId: string, targetColId: string) => {
    if (sourceColId === targetColId) return;
    const colA = columns.find((c) => c.id === sourceColId);
    const colB = columns.find((c) => c.id === targetColId);
    if (!colA || !colB) return;

    // Optimistic UI updates
    const originalColumns = [...columns];
    const updatedColumns = columns.map(c => {
      if (c.id === sourceColId) {
        return { ...c, position: colB.position };
      }
      if (c.id === targetColId) {
        return { ...c, position: colA.position };
      }
      return c;
    }).sort((a, b) => a.position - b.position);

    setColumns(updatedColumns);

    try {
      await Promise.all([
        api.patch(`/boardcolumns/${colA.id}`, {
          name: colA.name,
          position: colB.position,
          wipLimit: colA.wipLimit,
          isDone: colA.isDone
        }),
        api.patch(`/boardcolumns/${colB.id}`, {
          name: colB.name,
          position: colA.position,
          wipLimit: colB.wipLimit,
          isDone: colB.isDone
        })
      ]);
      fetchBoardData(true);
    } catch (err) {
      console.error("Failed to swap columns:", err);
      // Rollback
      setColumns(originalColumns);
    }
  };

  const handleOpenWipLimitModal = (column: BoardColumn) => {
    setWipModalColumn(column);
  };

  const handleSaveWipLimit = async (limit: number | null) => {
    if (!wipModalColumn) return;
    try {
      await api.patch(`/boardcolumns/${wipModalColumn.id}`, {
        name: wipModalColumn.name,
        position: wipModalColumn.position,
        wipLimit: limit,
        isDone: wipModalColumn.isDone
      });
      setWipModalColumn(null);
      fetchBoardData(true);
    } catch (err) {
      console.error("Failed to update WIP limit:", err);
    }
  };

  const handleSetColumnDone = async (columnId: string) => {
    const col = columns.find((c) => c.id === columnId);
    if (!col) return;
    try {
      await api.patch(`/boardcolumns/${col.id}`, {
        name: col.name,
        position: col.position,
        wipLimit: col.wipLimit,
        isDone: true
      });
      fetchBoardData(true);
    } catch (err) {
      console.error("Failed to set column as done:", err);
    }
  };

  const handleOpenDeleteModal = (column: BoardColumn) => {
    setDeleteModalColumn(column);
  };

  const handleConfirmDelete = async (targetColumnId?: string) => {
    if (!deleteModalColumn) return;
    try {
      if (!targetColumnId) {
        await api.delete(`/boardcolumns/${deleteModalColumn.id}`);
      } else {
        await api.delete(`/boardcolumns/${deleteModalColumn.id}?moveTasksToColumnId=${targetColumnId}`);
      }
      setDeleteModalColumn(null);
      fetchBoardData(true);
    } catch (err) {
      console.error("Failed to delete column:", err);
    }
  };

  const handleMoveTask = async (taskId: string, targetColumnId: string) => {
    const targetTasks = tasks.filter((t) => t.boardColumnId === targetColumnId);
    let newSortOrder = 1.0;
    if (targetTasks.length > 0) {
      const maxSort = Math.max(...targetTasks.map((t) => t.sortOrder || 0));
      newSortOrder = maxSort + 1.0;
    }
    try {
      await api.put(`/tasks/${taskId}/move`, {
        newBoardColumnId: targetColumnId,
        newSortOrder: newSortOrder,
      });
      fetchBoardData(true);
    } catch (err: unknown) {
      console.error("Failed to move task:", err);
      const message = err instanceof Error ? err.message : String(err);
      alert(message || "Không thể di chuyển công việc. Có thể cột đích đã đạt giới hạn WIP.", "Thất bại", "danger");
    }
  };

  const handleMoveSubTask = async (subTaskId: string, targetColumnId: string) => {
    try {
      if (targetColumnId === "completed" || targetColumnId === "uncompleted") {
        let foundSubTask: any = null;
        for (const task of tasks) {
          if (task.subTasks) {
            const st = task.subTasks.find(s => s.id === subTaskId);
            if (st) {
              foundSubTask = st;
              break;
            }
          }
        }
        if (foundSubTask) {
          const isCompleted = targetColumnId === "completed";
          await api.patch(`/subtasks/${subTaskId}`, {
            title: foundSubTask.title,
            assigneeUserId: foundSubTask.assigneeUserId,
            dueDate: foundSubTask.dueDate,
            isCompleted: isCompleted,
            priority: foundSubTask.priority || null,
          });
          fetchBoardData(true);
        }
        return;
      }

      await api.patch(`/subtasks/${subTaskId}/column`, {
        boardColumnId: targetColumnId,
      });
      fetchBoardData(true);
    } catch (err: unknown) {
      console.error("Failed to move subtask:", err);
      const message = err instanceof Error ? err.message : String(err);
      alert(message || "Không thể di chuyển nhiệm vụ.", "Thất bại", "danger");
    }
  };

  const handleCloseSprint = async (sprintId: string, action: "MoveToBacklog" | "MoveToNextSprint", moveToSprintId?: string) => {
    try {
      await api.post(`/sprints/${sprintId}/close`, {
        action,
        moveToSprintId: moveToSprintId || null
      });
      showSuccessToast("Đã kết thúc Sprint thành công.", "Thành công");
      fetchBoardData(true);
    } catch (err: any) {
      console.error("Failed to close sprint:", err);
      showErrorToast(err.message || "Đóng Sprint thất bại.", "Lỗi");
      throw err;
    }
  };

  const filteredTasks = React.useMemo(() => {
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);

    const doneColumnIds = columns.filter(c => c.isDone).map(c => c.id);

    return tasks.filter((task) => {
      // 1. Search Query
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        task.title.toLowerCase().includes(query) ||
        (task.description && task.description.toLowerCase().includes(query)) ||
        (task.subTasks && task.subTasks.some((st) => st.title.toLowerCase().includes(query)));

      // 2. Assignee (Including subtasks)
      let matchesAssignee = true;
      if (selectedAssignee) {
        if (selectedAssignee === "unassigned") {
          matchesAssignee =
            !!task.subTasks && task.subTasks.some((st) => !st.assigneeUserId && !st.isCompleted);
        } else {
          matchesAssignee =
            !!task.subTasks && task.subTasks.some((st) => st.assigneeUserId === selectedAssignee);
        }
      }


      // 3. Priority
      const matchesPriority = selectedPriority
        ? task.priority === selectedPriority
        : true;

      // 4. Due Date
      let matchesDueDate = true;
      if (selectedDueDateFilter === "overdue") {
        matchesDueDate =
          !!task.dueDate &&
          !doneColumnIds.includes(task.boardColumnId) &&
          new Date(task.dueDate) < now;
      } else if (selectedDueDateFilter === "upcoming7") {
        matchesDueDate =
          !!task.dueDate &&
          !doneColumnIds.includes(task.boardColumnId) &&
          new Date(task.dueDate) >= now &&
          new Date(task.dueDate) <= sevenDaysFromNow;
      }

      return matchesSearch && matchesAssignee && matchesPriority && matchesDueDate;
    });
  }, [tasks, searchQuery, selectedAssignee, selectedPriority, selectedDueDateFilter, columns]);

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

  return {
    columns,
    tasks,
    selectedTask,
    setSelectedTask,
    projectStartDate,
    projectDueDate,
    assignees,
    isPersonalProject,
    isLeaderOrOwner,
    activeSprintId,
    activeSprintName,
    activeSprintEndDate,
    sprints,
    selectedSprintId,
    setSelectedSprintId,
    searchQuery,
    setSearchQuery,
    selectedAssignee,
    setSelectedAssignee: handleSetAssignee,
    selectedPriority,
    setSelectedPriority: handleSetPriority,
    selectedDueDateFilter,
    setSelectedDueDateFilter: handleSetDueDateFilter,
    handleResetFilters,
    isCreateTaskModalOpen,
    setIsCreateTaskModalOpen,
    isLoading,
    error,
    isAddingColumn,
    setIsAddingColumn,
    newColName,
    setNewColName,
    newColWip,
    setNewColWip,
    wipModalColumn,
    setWipModalColumn,
    deleteModalColumn,
    setDeleteModalColumn,
    fetchBoardData,
    handleTaskClick,
    handleCreateColumn,
    handleMoveColumn,
    handleSwapColumns,
    handleOpenWipLimitModal,
    handleSaveWipLimit,
    handleOpenDeleteModal,
    handleConfirmDelete,
    handleMoveTask,
    handleMoveSubTask,
    handleSetColumnDone,
    handleCloseSprint,
    filteredTasks: sortedTasks,
    sortBy,
    setSortBy: handleSetSortBy,
    groupBy,
    setGroupBy: handleSetGroupBy,
  };
}
