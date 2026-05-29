"use client";

import * as React from "react";
import { ProjectListView } from "@/components/project";
import { api } from "@/lib/api";
import { TaskItem, BoardColumn } from "@/types/task";

interface PageProps {
  params: Promise<{ shareToken: string }>;
}

export default function SharedListPage({ params }: PageProps) {
  const { shareToken } = React.use(params);

  const [columns, setColumns] = React.useState<BoardColumn[]>([]);
  const [tasks, setTasks] = React.useState<TaskItem[]>([]);
  const [assignees, setAssignees] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isPersonalProject, setIsPersonalProject] = React.useState(false);

  const fetchListData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load columns and tasks
      const boardData = await api.get(`/shared/projects/${shareToken}/board`);
      if (boardData) {
        setColumns(boardData.boardColumns || []);
        
        const allTasks: TaskItem[] = [];
        (boardData.boardColumns || []).forEach((col: any) => {
          if (col.taskItems) {
            allTasks.push(...col.taskItems);
          }
        });
        setTasks(allTasks);
      }

      // Load workloads (assignees)
      const overviewData = await api.get(`/shared/projects/${shareToken}/overview`);
      if (overviewData) {
        setIsPersonalProject(overviewData.teamId === null || !overviewData.teamId);
        if (overviewData.memberWorkloads) {
          setAssignees(overviewData.memberWorkloads.map((m: any) => ({
            id: m.userId,
            displayName: m.displayName,
            avatar: m.avatar,
            role: m.role,
          })));
        }
      }
    } catch (err: any) {
      console.error("Failed to load shared list data:", err);
      setError(err.message || "Không thể tải dữ liệu danh sách công việc.");
    } finally {
      setIsLoading(false);
    }
  }, [shareToken]);

  React.useEffect(() => {
    fetchListData();
  }, [fetchListData]);

  if (isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center p-8 bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-[#1868db]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-full flex items-center justify-center p-8 bg-white text-red-500 font-bold">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6 bg-white min-h-full">
      <ProjectListView
        tasks={tasks}
        columns={columns}
        projectId=""
        onRefresh={fetchListData}
        assignees={assignees}
        readOnly={true}
        isPersonalProject={isPersonalProject}
      />
    </div>
  );
}
