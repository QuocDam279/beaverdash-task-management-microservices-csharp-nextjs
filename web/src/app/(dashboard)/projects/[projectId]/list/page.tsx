"use client";

/**
 * @page ProjectListPage
 * @description Route page cho phân hệ Danh sách công việc (List View) của dự án.
 * Thực hiện tìm nạp danh sách công việc và ủy quyền hiển thị cho ProjectListView.
 */

import * as React from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { ProjectListView } from "@/components/project";
import { TaskItem, BoardColumn } from "@/types/task";
import { api } from "@/lib/api";

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default function ProjectListPage({ params }: PageProps) {
  const { projectId } = React.use(params);
  const { user: currentUser } = useAuth();

  const [tasks, setTasks] = React.useState<TaskItem[]>([]);
  const [columns, setColumns] = React.useState<BoardColumn[]>([]);
  const [assignees, setAssignees] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isPersonalProject, setIsPersonalProject] = React.useState(false);
  const [projectStartDate, setProjectStartDate] = React.useState<string | null>(null);
  const [projectDueDate, setProjectDueDate] = React.useState<string | null>(null);
  const [selectedSprintId, setSelectedSprintId] = React.useState<string>("active");
  const [sprints, setSprints] = React.useState<any[]>([]);
  const [activeSprintName, setActiveSprintName] = React.useState<string | null>(null);
  const [activeSprintEndDate, setActiveSprintEndDate] = React.useState<string | null>(null);
  const isInitialLoad = React.useRef(true);

  const fetchListTasks = React.useCallback(async () => {
    try {
      if (isInitialLoad.current) {
        setIsLoading(true);
      }
      setError(null);
      let boardUrl = `/projects/${projectId}/board`;
      if (selectedSprintId !== "active") {
        boardUrl += `?sprintId=${selectedSprintId}`;
      }
      const [board, overview] = await Promise.all([
        api.get(boardUrl),
        api.get(`/projects/${projectId}/overview`),
      ]);

      if (board) {
        setSprints(board.sprints || []);
        setActiveSprintName(board.activeSprintName || null);
        setActiveSprintEndDate(board.activeSprintEndDate || null);
        const cols = board.boardColumns || [];
        setColumns(cols);
        const allTasks: TaskItem[] = cols.flatMap((col: any) =>
          (col.taskItems || []).map((t: any) => ({
            ...t,
            columnName: col.name,
            subTasks: (t.subTasks || []).map((st: any) => ({
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

      if (overview) {
        setIsPersonalProject(overview.teamId === null || !overview.teamId);
        setProjectStartDate(overview.startDate || null);
        setProjectDueDate(overview.dueDate || null);
        if (overview.teamId) {
          const team = await api.get(`/teams/${overview.teamId}`);
          if (team?.members) {
            setAssignees(team.members.map((m: any) => ({
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
      }

      isInitialLoad.current = false;
    } catch (err: any) {
      console.error("Failed to load list tasks:", err);
      setError(err.message || "Đã xảy ra lỗi khi tải danh sách công việc.");
    } finally {
      setIsLoading(false);
    }
  }, [projectId, currentUser, selectedSprintId]);

  React.useEffect(() => {
    fetchListTasks();
  }, [fetchListTasks]);

  if (isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center p-8 bg-white dark:bg-[#1d2125]">
        <svg className="animate-spin h-8 w-8 text-[#1868db] dark:text-[#579dff]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-full flex items-center justify-center p-8 bg-white dark:bg-[#1d2125]">
        <div className="text-center text-red-500 dark:text-red-400 font-bold">{error}</div>
      </div>
    );
  }

  const selectedSprint = sprints.find((s) => s.id === selectedSprintId);
  const isSprintClosed = selectedSprint ? selectedSprint.status === "Closed" : false;

  return (
    <div className="p-6 h-full flex flex-col bg-white dark:bg-[#1d2125]">
      <ProjectListView
        tasks={tasks}
        setTasks={setTasks}
        columns={columns}
        projectId={projectId}
        onRefresh={fetchListTasks}
        assignees={assignees}
        isPersonalProject={isPersonalProject}
        projectStartDate={projectStartDate}
        projectDueDate={projectDueDate}
        sprints={sprints}
        selectedSprintId={selectedSprintId}
        setSelectedSprintId={setSelectedSprintId}
        activeSprintName={activeSprintName}
        activeSprintEndDate={activeSprintEndDate}
        readOnly={isSprintClosed}
      />
    </div>
  );
}
