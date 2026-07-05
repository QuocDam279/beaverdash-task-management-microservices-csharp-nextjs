"use client";

import * as React from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { api } from "@/lib/api";
import { useToast } from "@/components/providers/ToastProvider";
import { toUtcLocalDate } from "@/lib/utils";
import type { BacklogDto, SprintDto, BacklogTaskDto, TeamMemberInfo, TeamMemberDto, BoardColumnDto } from "@/types/api";

export function useBacklog(projectId: string) {
  const { user: currentUser } = useAuth();
  const { success: showSuccessToast, error: showErrorToast, warning: showWarningToast } = useToast();

  const [backlogData, setBacklogData] = React.useState<BacklogDto | null>(null);
  const [columns, setColumns] = React.useState<BoardColumnDto[]>([]);
  const [assignees, setAssignees] = React.useState<TeamMemberInfo[]>([]);
  const [projectStartDate, setProjectStartDate] = React.useState<string | null>(null);
  const [projectDueDate, setProjectDueDate] = React.useState<string | null>(null);
  
  const [isLeaderOrOwner, setIsLeaderOrOwner] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const hasLoadedRef = React.useRef(false);

  const fetchBacklogData = React.useCallback(async (silent = false) => {
    try {
      if (!silent && !hasLoadedRef.current) {
        setIsLoading(true);
      }
      setError(null);

      // Fetch backlog, overview, and board in parallel
      const [backlog, overview, board] = await Promise.all([
        api.get(`/projects/${projectId}/backlog`),
        api.get(`/projects/${projectId}/overview`),
        api.get(`/projects/${projectId}/board`)
      ]);

      if (backlog) {
        setBacklogData(backlog);
        hasLoadedRef.current = true;
      }

      if (overview) {
        setProjectStartDate(overview.startDate || null);
        setProjectDueDate(overview.dueDate || null);

        const userWorkload = overview.memberWorkloads?.find((w: any) => w.userId === currentUser?.id);
        const isLeader = overview.teamId
          ? userWorkload?.role === "Trưởng nhóm"
          : overview.createdByUserId === currentUser?.id || userWorkload?.role === "Chủ sở hữu";
        setIsLeaderOrOwner(!!isLeader);
      }

      if (board) {
        setColumns(board.boardColumns || []);
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
    } catch (err: any) {
      console.error("Failed to load backlog data:", err);
      const msg = err.message || "Đã xảy ra lỗi khi tải dữ liệu Backlog.";
      setError(msg);
      showErrorToast(msg, "Lỗi");
    } finally {
      setIsLoading(false);
    }
  }, [projectId, currentUser, showErrorToast]);

  React.useEffect(() => {
    fetchBacklogData();
  }, [fetchBacklogData]);

  const handleCreateSprint = async (name: string, goal?: string, startDate?: string, endDate?: string) => {
    try {
      await api.post("/sprints", {
        projectId,
        name: name.trim(),
        goal: goal?.trim() || null,
        startDate: startDate ? new Date(startDate).toISOString() : null,
        endDate: endDate ? new Date(endDate).toISOString() : null
      });
      showSuccessToast("Đã tạo Sprint mới thành công.", "Thành công");
      await fetchBacklogData();
    } catch (err: any) {
      console.error("Failed to create sprint:", err);
      showErrorToast(err.message || "Tạo Sprint thất bại.", "Lỗi");
      throw err;
    }
  };

  const handleUpdateSprint = async (sprintId: string, name: string, goal?: string, startDate?: string, endDate?: string) => {
    try {
      await api.patch(`/sprints/${sprintId}`, {
        name: name.trim(),
        goal: goal?.trim() || null,
        startDate: startDate ? new Date(startDate).toISOString() : null,
        endDate: endDate ? new Date(endDate).toISOString() : null
      });
      showSuccessToast("Cập nhật Sprint thành công.", "Thành công");
      await fetchBacklogData();
    } catch (err: any) {
      console.error("Failed to update sprint:", err);
      showErrorToast(err.message || "Cập nhật Sprint thất bại.", "Lỗi");
      throw err;
    }
  };

  const handleDeleteSprint = async (sprintId: string) => {
    try {
      await api.delete(`/sprints/${sprintId}`);
      showSuccessToast("Đã xóa Sprint thành công.", "Thành công");
      await fetchBacklogData();
    } catch (err: any) {
      console.error("Failed to delete sprint:", err);
      showErrorToast(err.message || "Xóa Sprint thất bại.", "Lỗi");
    }
  };

  const handleStartSprint = async (sprintId: string) => {
    try {
      await api.post(`/sprints/${sprintId}/start`);
      showSuccessToast("Sprint đã được bắt đầu hoạt động.", "Thành công");
      await fetchBacklogData();
    } catch (err: any) {
      console.error("Failed to start sprint:", err);
      showErrorToast(err.message || "Bắt đầu Sprint thất bại.", "Lỗi");
    }
  };

  const handleCloseSprint = async (sprintId: string, action: "MoveToBacklog" | "MoveToNextSprint", moveToSprintId?: string) => {
    try {
      await api.post(`/sprints/${sprintId}/close`, {
        action,
        moveToSprintId: moveToSprintId || null
      });
      showSuccessToast("Đã kết thúc Sprint thành công.", "Thành công");
      await fetchBacklogData();
    } catch (err: any) {
      console.error("Failed to close sprint:", err);
      showErrorToast(err.message || "Đóng Sprint thất bại.", "Lỗi");
      throw err;
    }
  };

  const handleMoveTasks = async (taskIds: string[], sprintId: string | null) => {
    // Optimistic UI updates to make the drag-and-drop experience ultra-snappy!
    if (!backlogData) return;

    const originalData = { ...backlogData };
    
    // Find where the tasks are currently located and move them
    let foundTasks: BacklogTaskDto[] = [];
    
    // 1. Remove from backlog if they are there
    const newBacklogTasks = backlogData.backlogTasks.filter(t => {
      if (taskIds.includes(t.id)) {
        foundTasks.push(t);
        return false;
      }
      return true;
    });

    // 2. Remove from any sprint if they are there
    const newSprints = backlogData.sprints.map(s => {
      const filteredTasks = s.tasks.filter(t => {
        if (taskIds.includes(t.id)) {
          foundTasks.push(t);
          return false;
        }
        return true;
      });
      return {
        ...s,
        tasks: filteredTasks,
        taskCount: filteredTasks.length
      };
    });

    // 3. Insert into the target destination
    if (sprintId === null) {
      // Move to Product Backlog
      newBacklogTasks.push(...foundTasks);
    } else {
      // Move to a specific sprint
      const targetSprint = newSprints.find(s => s.id === sprintId);
      if (targetSprint) {
        targetSprint.tasks.push(...foundTasks);
        targetSprint.taskCount = targetSprint.tasks.length;
      }
    }

    // Apply optimistic updates
    setBacklogData({
      sprints: newSprints,
      backlogTasks: newBacklogTasks
    });

    try {
      await api.post("/sprints/move-tasks", {
        taskIds,
        sprintId,
        projectId
      });
      // Silent refresh to ensure sync with server
      const freshBacklog = await api.get(`/projects/${projectId}/backlog`);
      if (freshBacklog) setBacklogData(freshBacklog);
    } catch (err: any) {
      console.error("Failed to move tasks:", err);
      showErrorToast(err.message || "Di chuyển công việc thất bại.", "Lỗi");
      // Rollback to original state on failure
      setBacklogData(originalData);
    }
  };

  return {
    backlogData,
    columns,
    assignees,
    projectStartDate,
    projectDueDate,
    isLoading,
    error,
    isLeaderOrOwner,
    fetchBacklogData,
    handleCreateSprint,
    handleUpdateSprint,
    handleDeleteSprint,
    handleStartSprint,
    handleCloseSprint,
    handleMoveTasks
  };
}
