/**
 * API Response types - chặt chẽ hóa dữ liệu trả về từ Backend.
 */
import type { TaskItem } from "./task";

/** Thông tin thành viên nhóm dùng cho danh sách assignees */
export interface TeamMemberInfo {
  id: string;
  displayName: string;
  avatar: string | null;
  email: string;
  role?: string;
}

/** Dữ liệu thành viên và khối lượng công việc từ ProjectOverview API */
export interface MemberWorkload {
  userId: string;
  displayName: string;
  avatar: string | null;
  role: string;
  assignedTasksCount: number;
  workloadPercentage: number;
}

/** DTO project overview từ Backend */
export interface ProjectOverviewDto {
  id: string;
  name: string;
  description: string | null;
  startDate: string | null;
  dueDate: string | null;
  teamId: string | null;
  createdByUserId: string;
  createdAt: string;
  isPublic: boolean;
  shareToken: string | null;

  completedTasksCount: number;
  newTasksCount: number;
  upcomingDueTasksCount: number;

  completedTasksSubTasksTotal: number;
  completedTasksSubTasksDone: number;
  newTasksSubTasksTotal: number;
  newTasksSubTasksDone: number;
  upcomingDueTasksSubTasksTotal: number;
  upcomingDueTasksSubTasksDone: number;

  todoSubTasksCount: number;
  inProgressSubTasksCount: number;
  doneSubTasksCount: number;

  requiredSubTasksHighCount: number;
  requiredSubTasksMediumCount: number;
  requiredSubTasksLowCount: number;
  importantSubTasksHighCount: number;
  importantSubTasksMediumCount: number;
  importantSubTasksLowCount: number;
  extendedSubTasksHighCount: number;
  extendedSubTasksMediumCount: number;
  extendedSubTasksLowCount: number;

  memberWorkloads: MemberWorkload[];
}

/** DTO sidebar project items từ GetMyProjects API */
export interface MyProjectDto {
  id: string;
  name: string;
  teamId: string | null;
  createdByUserId: string;
  lastChatMessageCreatedAt?: string | null;
}

/** DTO dữ liệu board project từ API */
export interface ProjectBoardDto {
  id: string;
  name: string;
  description: string | null;
  boardColumns: BoardColumnDto[];
  activeSprintId: string | null;
  activeSprintName: string | null;
  activeSprintEndDate: string | null;
  sprints: SprintLookupDto[];
}

export interface SprintLookupDto {
  id: string;
  name: string;
  status: string;
}

export interface BoardColumnDto {
  id: string;
  projectId: string;
  name: string;
  position: number;
  wipLimit: number | null;
  isDone: boolean;
  taskItems: BoardTaskItemDto[];
}

export interface BoardTaskItemDto {
  id: string;
  boardColumnId: string;
  title: string;
  priority: string | null;
  sortOrder: number | null;
  description: string | null;
  startDate: string | null;
  dueDate: string | null;
  subTasksCount: number;
  completedSubTasksCount: number;
  commentsCount: number;
  subTasks: SubTaskBoardDto[];
}

export interface SubTaskBoardDto {
  id: string;
  taskId: string;
  title: string;
  isCompleted: boolean;
  dueDate: string | null;
  boardColumnId?: string | null;
  assigneeUserId: string | null;
  assigneeAvatar: string | null;
  assigneeName: string | null;
  priority: string | null;
}

export interface SearchResultDto {
  id: string;
  title: string;
  type: string;
  subtitle: string;
  actionUrl: string;
}

/** DTO phản hồi phân trang MyTasks */
export interface MyTasksResponseDto {
  items: TaskItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalTasksCount: number;
  completedTasksCount: number;
  uncompletedTasksCount: number;
  overdueTasks: TaskItem[];
  todayTasks: TaskItem[];
  upcomingTasks: TaskItem[];
  urgentTasks: TaskItem[];
}

/** DTO tài liệu dự án */
export interface ProjectDocumentDto {
  id: string;
  projectId: string;
  fileName: string;
  fileUrl: string;
  fileType: string | null;
  fileSizeBytes: number;
  uploadedByUserId: string;
  uploadedByDisplayName: string;
  uploadedByAvatar: string | null;
  createdAt: string;
}

/** DTO thông tin team từ GetTeamById API */
export interface TeamDto {
  id: string;
  name: string;
  description: string | null;
  ownerUserId: string;
  createdAt: string;
  members: TeamMemberDto[];
}

export interface TeamMemberDto {
  userId: string;
  displayName: string;
  avatar: string | null;
  email: string;
  role: string;
  joinedAt: string;
}

/** DTO cho danh sách team từ GetMyTeams */
export interface TeamSummaryDto {
  id: string;
  name: string;
  description: string | null;
  ownerUserId: string;
  createdAt: string;
  membersCount: number;
  projectsCount: number;
  currentUserRole: string;
  members: TeamMemberSummaryDto[];
}

export interface TeamMemberSummaryDto {
  userId: string;
  displayName: string;
  avatar: string | null;
}

/** DTO dữ liệu Sprint */
export interface SprintDto {
  id: string;
  projectId: string;
  name: string;
  goal: string | null;
  status: 'Future' | 'Active' | 'Closed';
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  taskCount: number;
  completedTaskCount: number;
  tasks: BacklogTaskDto[];
}

export interface BacklogTaskDto {
  id: string;
  title: string;
  priority: string | null;
  startDate: string | null;
  dueDate: string | null;
  boardColumnId: string;
  columnName: string;
  subTasksCount: number;
  completedSubTasksCount: number;
}

export interface BacklogDto {
  sprints: SprintDto[];
  backlogTasks: BacklogTaskDto[];
}
