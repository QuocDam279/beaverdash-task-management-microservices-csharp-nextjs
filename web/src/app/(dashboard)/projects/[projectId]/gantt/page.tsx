"use client";

import * as React from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { GanttChartView } from "@/components/project";
import { TaskItem, BoardColumn } from "@/types/task";
import { api } from "@/lib/api";

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default function ProjectGanttPage({ params }: PageProps) {
  const { projectId } = React.use(params);
  const { user: currentUser } = useAuth();

  const [columns, setColumns] = React.useState<BoardColumn[]>([]);
  const [tasks, setTasks] = React.useState<TaskItem[]>([]);
  const [assignees, setAssignees] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchGanttData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const overview = await api.get(`/projects/${projectId}/overview`);
      const board = await api.get(`/projects/${projectId}/board`);
      
      if (board) {
        const cols = board.boardColumns || [];
        setColumns(cols);
        
        const allTasks: TaskItem[] = cols.flatMap((col: any) =>
          (col.taskItems || []).map((t: any) => ({
            ...t,
            assigneeUser: t.assigneeUserId ? {
              id: t.assigneeUserId,
              displayName: t.assigneeName,
              avatar: t.assigneeAvatar
            } : null
          }))
        );
        setTasks(allTasks);
      }
      
      if (overview?.teamId) {
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
    } catch (err: any) {
      console.error("Failed to load Gantt data:", err);
      setError(err.message || "Đã xảy ra lỗi khi tải dữ liệu sơ đồ.");
    } finally {
      setIsLoading(false);
    }
  }, [projectId, currentUser]);

  React.useEffect(() => {
    fetchGanttData();
  }, [fetchGanttData]);

  const handleUpdateTask = (updatedTask: TaskItem) => {
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    fetchGanttData();
  };

  const handleSetTasks = React.useCallback((value: React.SetStateAction<TaskItem[]>) => {
    setTasks(value);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center p-8 bg-white">
        <svg className="animate-spin h-8 w-8 text-[#1868db]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-full flex items-center justify-center p-8 bg-white">
        <div className="text-center text-red-500 font-bold">{error}</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      <GanttChartView
        tasks={tasks}
        setTasks={handleSetTasks}
        columns={columns}
        assignees={assignees}
      />
    </div>
  );
}
