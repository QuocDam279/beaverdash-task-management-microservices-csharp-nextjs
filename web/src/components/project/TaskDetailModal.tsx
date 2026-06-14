"use client";

import * as React from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { TaskSubtasks } from "./TaskSubtasks";
import { TaskSubtaskDrawer } from "./TaskSubtaskDrawer";
import { TaskSidebarProperties } from "./TaskSidebarProperties";
import { TaskDetailHeader } from "./TaskDetailHeader";
import { TaskDetailTitle } from "./TaskDetailTitle";
import { TaskDetailDescription } from "./TaskDetailDescription";
import { TaskItem, BoardColumn } from "@/types/task";
import { api } from "@/lib/api";
import { useAlertConfirm } from "@/components/providers/AlertConfirmProvider";

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: TaskItem;
  onUpdateTask: (updatedTask: TaskItem) => void;
  columns: BoardColumn[];
  assignees: any[];
  readOnly?: boolean;
  shareToken?: string;
  initialActiveSubtaskId?: string | null;
}

export function TaskDetailModal({
  isOpen,
  onClose,
  task,
  onUpdateTask,
  columns,
  assignees,
  readOnly = false,
  shareToken,
  initialActiveSubtaskId = null,
}: TaskDetailModalProps) {
  const { user: currentUser } = useAuth();
  const { alert, confirm } = useAlertConfirm();

  if (!isOpen) return null;

  const currentMember = assignees.find((m) => m.id === currentUser?.id);
  const isLeader = currentMember?.role === "leader" || currentMember?.role === "Owner" || assignees.length <= 1;
  const canManageSubtasks = true;

  const subtasks = task.subTasks || [];
  const [activeSubtaskId, setActiveSubtaskId] = React.useState<string | null>(initialActiveSubtaskId);
  const activeSubtask = subtasks.find((st) => st.id === activeSubtaskId) || null;

  React.useEffect(() => {
    if (isOpen) {
      setActiveSubtaskId(initialActiveSubtaskId);
    }
  }, [isOpen, initialActiveSubtaskId]);

  const reloadTask = async () => {
    try {
      console.log("TaskDetailModal reloadTask started for task:", task.id);
      const url = readOnly && shareToken
        ? `/shared/tasks/${task.id}?shareToken=${shareToken}`
        : `/tasks/${task.id}`;
      const data = await api.get(url);
      console.log("TaskDetailModal reloadTask API returned:", data);
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

        console.log("TaskDetailModal calling onUpdateTask for task:", task.id);
        onUpdateTask({
          ...data,
          id: data.id || data.Id || task.id,
          createdByUser: data.createdByName ? {
            displayName: data.createdByName,
            avatar: data.createdByAvatar
          } : null,
          subTasks: mappedSubTasks
        });
      }
    } catch (err) {
      console.error("Failed to reload task details:", err);
    }
  };

  React.useEffect(() => {
    console.log("TaskDetailModal useEffect task.id triggered:", task.id);
    reloadTask();
  }, [task.id]);

  const handleUpdateDetails = async (updates: any) => {
    try {
      await api.patch(`/tasks/${task.id}`, updates);
      await reloadTask();
    } catch (err: any) {
      console.error("Failed to update task details:", err);
      alert(err.message || "Không thể cập nhật thông tin công việc.", "Thất bại", "danger");
    }
  };

  const handleStatusChange = async (columnId: string) => {
    try {
      await api.put(`/tasks/${task.id}/move`, {
        newBoardColumnId: columnId,
        newSortOrder: 1,
      });
      await reloadTask();
    } catch (err: any) {
      console.error("Failed to move task:", err);
      alert(err.message || "Không thể di chuyển công việc.", "Thất bại", "danger");
    }
  };

  const handleToggleSubtask = async (subTaskId: string) => {
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
      await reloadTask();
    } catch (err) {
      console.error("Failed to toggle subtask:", err);
    }
  };

  const handleSubtaskTitleChange = async (subTaskId: string, title: string) => {
    const subtask = subtasks.find((st) => st.id === subTaskId);
    if (!subtask) return;
    try {
      await api.patch(`/subtasks/${subTaskId}`, {
        title,
        assigneeUserId: subtask.assigneeUserId,
        dueDate: subtask.dueDate,
        isCompleted: subtask.isCompleted,
        priority: subtask.priority,
      });
      await reloadTask();
    } catch (err) {
      console.error("Failed to update subtask title:", err);
    }
  };

  const handleSubtaskAssigneeChange = async (subTaskId: string, assigneeId: string) => {
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
      await reloadTask();
    } catch (err) {
      console.error("Failed to update subtask assignee:", err);
    }
  };

  const handleSubtaskDueDateChange = async (subTaskId: string, dueDate: string | null) => {
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
      await reloadTask();
    } catch (err) {
      console.error("Failed to update subtask due date:", err);
    }
  };

  const handleAddSubtask = async (title: string) => {
    try {
      await api.post(`/subtasks`, {
        taskId: task.id,
        title,
        priority: null,
      });
      await reloadTask();
    } catch (err) {
      console.error("Failed to add subtask:", err);
    }
  };

  const handleDeleteSubtask = async (subTaskId: string) => {
    try {
      await api.delete(`/subtasks/${subTaskId}`);
      await reloadTask();
    } catch (err) {
      console.error("Failed to delete subtask:", err);
    }
  };

  const handleAddSubtaskComment = async (subTaskId: string, content: string, attachments?: any[]) => {
    try {
      const data = await api.post(`/subtasks/${subTaskId}/comments`, { content });
      const commentId = data?.id || data?.Id;

      if (commentId && attachments && attachments.length > 0) {
        for (const att of attachments) {
          if (att.file) {
            const formData = new FormData();
            formData.append("file", att.file);
            await api.post(`/subtasks/${subTaskId}/comments/${commentId}/attachments`, formData);
          }
        }
      }
      await reloadTask();
    } catch (err) {
      console.error("Failed to add subtask comment:", err);
    }
  };

  const handleDeleteSubtaskComment = async (subTaskId: string, commentId: string) => {
    try {
      await api.delete(`/subtasks/${subTaskId}/comments/${commentId}`);
      await reloadTask();
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  const handleDeleteTask = async () => {
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
      await api.delete(`/tasks/${task.id}`);
      onClose();
    } catch (err: any) {
      console.error("Failed to delete task:", err);
      alert(err.message || "Không thể xóa công việc này.", "Thất bại", "danger");
    }
  };

  return (
    <div className="fixed inset-0 bg-[#091e42]/50 dark:bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none animate-in fade-in duration-200">
      <div className="relative bg-white dark:bg-[#161a1d] rounded-lg border border-slate-200 dark:border-[#2c3338] shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden">
        <TaskDetailHeader onClose={onClose} onDelete={readOnly ? undefined : handleDeleteTask} />
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          <div className="flex-1 flex flex-col p-6 gap-6 overflow-hidden min-h-0">
            <div className="flex-shrink-0">
              <TaskDetailTitle
                title={task.title}
                onUpdateTitle={(title) => !readOnly && handleUpdateDetails({ title })}
                readOnly={readOnly}
              />
            </div>
            <div className="flex-shrink-0">
              <TaskDetailDescription
                description={task.description}
                onUpdateDescription={(description) => !readOnly && handleUpdateDetails({ description: description || "" })}
                readOnly={readOnly}
              />
            </div>
            <TaskSubtasks
              subtasks={subtasks}
              taskStartDate={task.startDate}
              taskDueDate={task.dueDate}
              onToggleSubtask={handleToggleSubtask}
              onSubtaskAssigneeChange={handleSubtaskAssigneeChange}
              onSubtaskDueDateChange={handleSubtaskDueDateChange}
              onAddSubtask={handleAddSubtask}
              onDeleteSubtask={handleDeleteSubtask}
              currentUser={currentUser}
              assignees={assignees}
              canManageSubtasks={canManageSubtasks && !readOnly}
              readOnly={readOnly}
              isPersonalProject={task.teamId === null || !task.teamId}
              activeSubtaskId={activeSubtaskId}
              onSelectSubtask={setActiveSubtaskId}
            />
          </div>
          <TaskSidebarProperties
            task={task}
            columns={columns}
            onStatusChange={handleStatusChange}
            onAssigneeChange={(assigneeId) => !readOnly && handleUpdateDetails({ assigneeUserId: assigneeId || "00000000-0000-0000-0000-000000000000" })}
            onPriorityChange={(priority) => !readOnly && handleUpdateDetails({ priority })}
            onDateChange={(field, value) => !readOnly && handleUpdateDetails({ [field]: value ? new Date(value).toISOString() : null })}
            assignees={assignees}
            readOnly={readOnly}
          />
        </div>

        {/* Slide-in Subtask Details & Comments Drawer */}
        <TaskSubtaskDrawer
          isOpen={activeSubtaskId !== null}
          subtask={activeSubtask}
          onClose={() => setActiveSubtaskId(null)}
          taskStartDate={task.startDate}
          taskDueDate={task.dueDate}
          onToggleSubtask={handleToggleSubtask}
          onSubtaskTitleChange={handleSubtaskTitleChange}
          onSubtaskAssigneeChange={handleSubtaskAssigneeChange}
          onSubtaskDueDateChange={handleSubtaskDueDateChange}
          onDeleteSubtask={handleDeleteSubtask}
          onAddSubtaskComment={handleAddSubtaskComment}
          onDeleteSubtaskComment={handleDeleteSubtaskComment}
          currentUser={currentUser}
          assignees={assignees}
          canManageSubtasks={canManageSubtasks && !readOnly}
          readOnly={readOnly}
          isPersonalProject={task.teamId === null || !task.teamId}
        />
      </div>
    </div>
  );
}
