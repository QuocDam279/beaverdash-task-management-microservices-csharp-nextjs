"use client";

/**
 * @hook useMyTaskDetails
 * @description Quản lý các logic hành động chi tiết của công việc (cập nhật thuộc tính, thêm/sửa/xóa subtask, bình luận).
 */

import * as React from "react";
import { api } from "@/lib/api";
import { useAlertConfirm } from "@/components/providers/AlertConfirmProvider";
import { TaskItem, BoardColumn } from "@/types/task";

interface UseMyTaskDetailsProps {
  selectedTask: TaskItem | null;
  setSelectedTask: React.Dispatch<React.SetStateAction<TaskItem | null>>;
  columns: BoardColumn[];
  setTasks: React.Dispatch<React.SetStateAction<any[]>>;
  fetchTasks: () => Promise<void>;
}

export function useMyTaskDetails({
  selectedTask,
  setSelectedTask,
  columns,
  setTasks,
  fetchTasks,
}: UseMyTaskDetailsProps) {
  const { alert, confirm } = useAlertConfirm();

  const reloadSelectedTask = React.useCallback(async (taskId: string) => {
    try {
      const data = await api.get(`/tasks/${taskId}`);
      if (data) {
        const mappedSubTasks = (data.subTasks || []).map((st: any) => ({
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

        const fullTask: TaskItem = {
          ...data,
          id: data.id || data.Id || taskId,
          createdByUser: data.createdByName ? {
            displayName: data.createdByName,
            avatar: data.createdByAvatar
          } : null,
          subTasks: mappedSubTasks
        };

        setSelectedTask(fullTask);

        // Đồng bộ ngược lại danh sách công việc chính
        const targetCol = columns.find((c) => c.id === fullTask.boardColumnId);
        const isColumnDone = targetCol ? targetCol.isDone : false;
        const colName = targetCol ? targetCol.name : "";
        setTasks((prev) =>
          prev.map((t) =>
            t.id === fullTask.id
              ? {
                  ...t,
                  title: fullTask.title,
                  priority: fullTask.priority,
                  dueDate: fullTask.dueDate,
                  columnIsDone: isColumnDone,
                  columnName: colName || t.columnName,
                  boardColumnId: fullTask.boardColumnId || t.boardColumnId,
                }
              : t
          )
        );
      }
    } catch (err) {
      console.error("Failed to reload task details:", err);
    }
  }, [columns, setSelectedTask, setTasks]);

  const handleUpdateDetails = async (updates: any) => {
    if (!selectedTask) return;
    try {
      await api.patch(`/tasks/${selectedTask.id}`, updates);
      await reloadSelectedTask(selectedTask.id);
    } catch (err: any) {
      console.error("Failed to update task details:", err);
      alert(err.message || "Không thể cập nhật thông tin công việc.", "Thất bại", "danger");
    }
  };

  const handleStatusChange = async (columnId: string) => {
    if (!selectedTask) return;
    try {
      await api.put(`/tasks/${selectedTask.id}/move`, {
        newBoardColumnId: columnId,
        newSortOrder: 1.0,
      });
      await reloadSelectedTask(selectedTask.id);
    } catch (err: any) {
      console.error("Failed to move task:", err);
      alert(err.message || "Không thể di chuyển công việc.", "Thất bại", "danger");
    }
  };

  const handleToggleSubtask = async (subTaskId: string) => {
    if (!selectedTask) return;
    const subtasks = selectedTask.subTasks || [];
    const subtask = subtasks.find((st) => st.id === subTaskId);
    if (!subtask) return;
    try {
      await api.patch(`/subtasks/${subTaskId}`, {
        title: subtask.title,
        assigneeUserId: subtask.assigneeUserId,
        dueDate: subtask.dueDate,
        isCompleted: !subtask.isCompleted,
        priority: subtask.priority,
      });
      await reloadSelectedTask(selectedTask.id);
    } catch (err) {
      console.error("Failed to toggle subtask:", err);
    }
  };

  const handleSubtaskAssigneeChange = async (subTaskId: string, assigneeId: string) => {
    if (!selectedTask) return;
    const subtasks = selectedTask.subTasks || [];
    const subtask = subtasks.find((st) => st.id === subTaskId);
    if (!subtask) return;
    try {
      await api.patch(`/subtasks/${subTaskId}`, {
        title: subtask.title,
        assigneeUserId: assigneeId || null,
        dueDate: subtask.dueDate,
        isCompleted: subtask.isCompleted,
        priority: subtask.priority,
      });
      await reloadSelectedTask(selectedTask.id);
    } catch (err) {
      console.error("Failed to update subtask assignee:", err);
    }
  };

  const handleSubtaskDueDateChange = async (subTaskId: string, dueDate: string | null) => {
    if (!selectedTask) return;
    const subtasks = selectedTask.subTasks || [];
    const subtask = subtasks.find((st) => st.id === subTaskId);
    if (!subtask) return;
    try {
      await api.patch(`/subtasks/${subTaskId}`, {
        title: subtask.title,
        assigneeUserId: subtask.assigneeUserId,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        isCompleted: subtask.isCompleted,
        priority: subtask.priority,
      });
      await reloadSelectedTask(selectedTask.id);
    } catch (err) {
      console.error("Failed to update subtask due date:", err);
    }
  };

  const handleSubtaskPriorityChange = async (subTaskId: string, priority: string | null) => {
    if (!selectedTask) return;
    const subtasks = selectedTask.subTasks || [];
    const subtask = subtasks.find((st) => st.id === subTaskId);
    if (!subtask) return;
    try {
      await api.patch(`/subtasks/${subTaskId}`, {
        title: subtask.title,
        assigneeUserId: subtask.assigneeUserId,
        dueDate: subtask.dueDate,
        isCompleted: subtask.isCompleted,
        priority: priority || null,
      });
      await reloadSelectedTask(selectedTask.id);
    } catch (err) {
      console.error("Failed to update subtask priority:", err);
    }
  };

  const handleAddSubtask = async (title: string, priority: string | null) => {
    if (!selectedTask) return;
    try {
      await api.post("/subtasks", {
        taskId: selectedTask.id,
        title,
        priority: priority || null,
      });
      await reloadSelectedTask(selectedTask.id);
    } catch (err) {
      console.error("Failed to add subtask:", err);
    }
  };

  const handleDeleteSubtask = async (subTaskId: string) => {
    if (!selectedTask) return;
    try {
      await api.delete(`/subtasks/${subTaskId}`);
      await reloadSelectedTask(selectedTask.id);
    } catch (err) {
      console.error("Failed to delete subtask:", err);
    }
  };

  const handleAddSubtaskComment = async (subTaskId: string, content: string) => {
    if (!selectedTask) return;
    try {
      await api.post(`/subtasks/${subTaskId}/comments`, { content });
      await reloadSelectedTask(selectedTask.id);
    } catch (err) {
      console.error("Failed to add subtask comment:", err);
    }
  };

  const handleDeleteSubtaskComment = async (subTaskId: string, commentId: string) => {
    if (!selectedTask) return;
    try {
      await api.delete(`/subtasks/${subTaskId}/comments/${commentId}`);
      await reloadSelectedTask(selectedTask.id);
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  const handleDeleteTask = async () => {
    if (!selectedTask) return;
    const confirmDelete = await confirm(
      "Bạn có chắc chắn muốn xóa công việc này? Công việc sẽ được đưa vào thùng rác.",
      {
        title: "Xóa công việc",
        confirmLabel: "Xóa công việc",
        variant: "danger",
      }
    );
    if (!confirmDelete) return;

    try {
      await api.delete(`/tasks/${selectedTask.id}`);
      setSelectedTask(null);
      await fetchTasks();
    } catch (err: any) {
      console.error("Failed to delete task:", err);
      alert(err.message || "Không thể xóa công việc này.", "Thất bại", "danger");
    }
  };

  return {
    reloadSelectedTask,
    handleUpdateDetails,
    handleStatusChange,
    handleToggleSubtask,
    handleSubtaskAssigneeChange,
    handleSubtaskDueDateChange,
    handleSubtaskPriorityChange,
    handleAddSubtask,
    handleDeleteSubtask,
    handleAddSubtaskComment,
    handleDeleteSubtaskComment,
    handleDeleteTask,
  };
}
