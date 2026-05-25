import { User } from "./auth";
import { Project } from "./project";

/**
 * Team interface mapped from PM.Domain.Entities.Team
 */
export interface Team {
  id: string; // UUID
  name: string;
  description: string | null;
  ownerUserId: string; // UUID
  ownerUser?: User | null;
  createdAt: string; // ISO Date String
  updatedAt: string; // ISO Date String
  members?: TeamMember[];
  projects?: Project[];
}

/**
 * TeamMember interface mapped from PM.Domain.Entities.TeamMember
 */
export interface TeamMember {
  teamId: string; // UUID
  team?: Team | null;
  userId: string; // UUID
  user?: User | null;
  role: "Owner" | "Member"; // "Owner" = Trưởng nhóm, "Member" = Thành viên
  joinedAt: string; // ISO Date String
}
