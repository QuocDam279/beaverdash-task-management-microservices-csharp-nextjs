import { User } from "./auth";
import { Project } from "./project";

/**
 * BoardColumn interface mapped from PM.Domain.Entities.BoardColumn
 */
export interface BoardColumn {
  id: string; // UUID
  projectId: string; // UUID
  project?: Project | null;
  name: string;
  position: number;
  wipLimit: number | null;
  isDone: boolean;
  createdAt: string; // ISO Date String
  updatedAt: string; // ISO Date String
  taskItems?: TaskItem[];
}

/**
 * TaskItem interface mapped from PM.Domain.Entities.TaskItem
 */
export interface TaskItem {
  id: string; // UUID
  boardColumnId: string; // UUID
  boardColumn?: BoardColumn | null;
  assigneeUserId?: string | null; // UUID
  assigneeUser?: User | null;
  title: string;
  description: string | null;
  priority: string | null; // e.g. "Low", "Medium", "High", "Critical"
  dueDate: string | null; // ISO Date String
  startDate: string | null; // ISO Date String
  projectStartDate?: string | null;
  projectDueDate?: string | null;
  sortOrder: number | null;
  createdByUserId: string; // UUID
  createdByUser?: User | null;
  assignedAt?: string | null; // ISO Date String
  completedAt: string | null; // ISO Date String
  deletedAt: string | null; // ISO Date String
  createdAt: string; // ISO Date String
  updatedAt: string; // ISO Date String
  teamId?: string | null;
  subTasks?: SubTask[];
}

/**
 * SubTask interface mapped from PM.Domain.Entities.SubTask
 */
export interface SubTask {
  id: string; // UUID
  taskId: string; // UUID
  task?: TaskItem | null;
  assigneeUserId: string | null; // UUID
  assigneeUser?: User | null;
  title: string;
  isCompleted: boolean;
  priority?: string | null; // e.g. "Low", "Medium", "High"
  dueDate: string | null; // ISO Date String
  sortOrder: number | null;
  createdAt: string; // ISO Date String
  updatedAt: string; // ISO Date String
  deletedAt: string | null; // ISO Date String
  comments?: Comment[];
}

/**
 * Comment interface mapped from PM.Domain.Entities.Comment
 */
export interface Comment {
  id: string; // UUID
  userId: string; // UUID
  user?: User | null;
  subTaskId: string; // UUID
  subTask?: SubTask | null;
  content: string;
  createdAt: string; // ISO Date String
  updatedAt: string; // ISO Date String
  attachments?: Attachment[];
}

/**
 * Attachment interface mapped from PM.Domain.Entities.Attachment
 */
export interface Attachment {
  id: string; // UUID
  commentId: string; // UUID
  comment?: Comment | null;
  fileName: string;
  fileUrl: string;
  fileType: string | null;
  fileSizeBytes: number | null;
  createdAt: string; // ISO Date String
}

/**
 * ActivityLog interface mapped from PM.Domain.Entities.ActivityLog
 */
export interface ActivityLog {
  id: string; // UUID
  projectId: string; // UUID
  project?: Project | null;
  userId: string; // UUID
  user?: User | null;
  entityType: string | null; // e.g. "TaskItem", "SubTask", "Comment"
  entityId: string | null; // UUID
  actionType: string | null; // e.g. "Create", "Update", "Delete", "Move"
  oldValue: string | null;
  newValue: string | null;
  createdAt: string; // ISO Date String
}

/**
 * Notification interface mapped from PM.Domain.Entities.Notification
 */
export interface Notification {
  id: string; // UUID
  userId: string; // UUID
  user?: User | null;
  actorUserId: string; // UUID
  actorUser?: User | null;
  type: string | null; // e.g. "TaskAssigned", "CommentAdded"
  content: string | null;
  actionUrl: string | null;
  isRead: boolean;
  isSentViaEmail: boolean;
  emailSentAt: string | null; // ISO Date String
  createdAt: string; // ISO Date String
}
