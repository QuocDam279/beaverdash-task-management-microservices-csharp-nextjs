"use client";

import * as React from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { TaskItem, BoardColumn } from "@/types/task";
import { api } from "@/lib/api";

export function useMyTasks() {
  const { user: currentUser } = useAuth();
  const [tasks, setTasks] = React.useState<any[]>([]);
  const [projects, setProjects] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedTask, setSelectedTask] = React.useState<TaskItem | null>(null);
  const [columns, setColumns] = React.useState<BoardColumn[]>([]);
  const [assignees, setAssignees] = React.useState<any[]>([]);
  const [isDetailLoading, setIsDetailLoading] = React.useState(false);

  const fetchTasksAndProjects = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const [tasksData, projectsData] = await Promise.all([
        api.get("/tasks"),
        api.get("/projects")
      ]);
      setTasks(tasksData || []);
      setProjects(projectsData || []);
    } catch (err) {
      console.error("Failed to load tasks and projects:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchTasksAndProjects();
  }, [fetchTasksAndProjects]);

  const handleTaskClick = async (taskId: string) => {
    try {
      setIsDetailLoading(true);
      const fullTask = await api.get(`/tasks/${taskId}`);
      if (!fullTask) return;

      const projectId = fullTask.projectId;
      const [board, overview] = await Promise.all([
        api.get(`/projects/${projectId}/board`),
        api.get(`/projects/${projectId}/overview`)
      ]);

      setColumns(board?.boardColumns || []);

      if (overview?.teamId) {
        const team = await api.get(`/teams/${overview.teamId}`);
        if (team?.members) {
          setAssignees(team.members.map((m: any) => ({
            id: m.userId,
            displayName: m.displayName,
            avatar: m.avatar,
            role: m.role,
          })));
        }
      } else if (currentUser) {
        setAssignees([currentUser]);
      }

      // Map to TaskItem type
      setSelectedTask({
        ...fullTask,
        assigneeUser: fullTask.assigneeUserId ? {
          id: fullTask.assigneeUserId,
          displayName: fullTask.assigneeName,
          avatar: fullTask.assigneeAvatar
        } : null,
        subTasks: (fullTask.subTasks || []).map((st: any) => ({
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
        }))
      });
    } catch (err) {
      console.error("Failed to load task details:", err);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleToggleComplete = async (taskId: string, columnIsDone: boolean, projectId: string) => {
    try {
      const board = await api.get(`/projects/${projectId}/board`);
      if (!board?.boardColumns || board.boardColumns.length === 0) return;

      let targetColumn;
      if (columnIsDone) {
        // Move back to first column (To Do)
        targetColumn = board.boardColumns[0];
      } else {
        // Move to Done column
        targetColumn = board.boardColumns.find((c: any) => c.isDone) || board.boardColumns[board.boardColumns.length - 1];
      }

      await api.put(`/tasks/${taskId}/move`, {
        newBoardColumnId: targetColumn.id,
        newSortOrder: 1.0
      });

      // Reload tasks list
      await fetchTasksAndProjects();

      // If details modal is open for this task, refresh it as well
      if (selectedTask?.id === taskId) {
        await handleTaskClick(taskId);
      }
    } catch (err: any) {
      console.error("Failed to toggle task completion:", err);
      alert(err.message || "Không thể thay đổi trạng thái công việc.");
    }
  };

  return {
    tasks,
    setTasks,
    projects,
    isLoading,
    fetchTasks: fetchTasksAndProjects,
    selectedTask,
    setSelectedTask,
    columns,
    assignees,
    isDetailLoading,
    handleTaskClick,
    handleToggleComplete
  };
}
