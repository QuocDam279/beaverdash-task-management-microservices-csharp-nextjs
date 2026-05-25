import { User } from "./auth";
import { Team } from "./team";
import { BoardColumn } from "./task";

/**
 * Project interface mapped from PM.Domain.Entities.Project
 */
export interface Project {
  id: string; // UUID
  teamId: string | null; // UUID
  team?: Team | null;
  name: string;
  description: string | null;
  status: string | null;
  progress: number;
  startDate: string | null; // ISO Date String
  dueDate: string | null; // ISO Date String
  isPublic: boolean;
  shareToken: string | null;
  createdByUserId: string; // UUID
  createdByUser?: User | null;
  createdAt: string; // ISO Date String
  updatedAt: string; // ISO Date String
  boardColumns?: BoardColumn[];
}

/**
 * ProjectMember interface mapped from DocumentIntelligenceService project_members
 */
export interface ProjectMember {
  projectId: string; // UUID
  userId: string; // UUID
  user?: User | null;
  status: string | null;
  joinedAt: string; // ISO Date String
}

/**
 * Payload for project synchronization via RabbitMQ
 */
export interface ProjectSyncPayload {
  id: string;
  name: string;
  description: string | null;
  status: string | null;
}
