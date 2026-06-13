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
  const [selectedSprintId, setSelectedSprintId] = React.useState<string>("active");
  const [sprints, setSprints] = React.useState<any[]>([]);
  const [activeSprintName, setActiveSprintName] = React.useState<string | null>(null);
  const [activeSprintEndDate, setActiveSprintEndDate] = React.useState<string | null>(null);

  const fetchListData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load columns and tasks
      let boardUrl = `/shared/projects/${shareToken}/board`;
      if (selectedSprintId !== "active") {
        boardUrl += `?sprintId=${selectedSprintId}`;
      }

      const boardData = await api.get(boardUrl);
      if (boardData) {
        setColumns(boardData.boardColumns || []);
        setSprints(boardData.sprints || []);
        setActiveSprintName(boardData.activeSprintName || null);
        setActiveSprintEndDate(boardData.activeSprintEndDate || null);
        
        const allTasks: TaskItem[] = [];
        (boardData.boardColumns || []).forEach((col: any) => {
          if (col.taskItems) {
            allTasks.push(...col.taskItems.map((t: any) => ({
              ...t,
              columnName: col.name
            })));
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
  }, [shareToken, selectedSprintId]);

  React.useEffect(() => {
    fetchListData();
  }, [fetchListData]);

  if (isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center p-8 bg-white dark:bg-[#1d2125]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 dark:border-[#353e47] border-t-[#1868db] dark:border-t-[#579dff]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-full flex items-center justify-center p-8 bg-white dark:bg-[#1d2125] text-red-500 dark:text-red-400 font-bold">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-[#1d2125] min-h-full">
      <ProjectListView
        tasks={tasks}
        columns={columns}
        projectId=""
        onRefresh={fetchListData}
        assignees={assignees}
        readOnly={true}
        isPersonalProject={isPersonalProject}
        sprints={sprints}
        selectedSprintId={selectedSprintId}
        setSelectedSprintId={setSelectedSprintId}
        activeSprintName={activeSprintName}
        activeSprintEndDate={activeSprintEndDate}
      />
    </div>
  );
}
