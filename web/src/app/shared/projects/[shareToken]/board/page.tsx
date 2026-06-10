"use client";

import * as React from "react";
import { BoardColumnView, BoardToolbar } from "@/components/project";
import { api } from "@/lib/api";
import dynamic from "next/dynamic";

const TaskDetailModal = dynamic(() =>
  import("@/components/project/TaskDetailModal").then((m) => m.TaskDetailModal),
  { ssr: false }
);
import { TaskItem, BoardColumn } from "@/types/task";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useSharedBoardFilters } from "@/hooks/useSharedBoardFilters";

interface PageProps {
  params: Promise<{ shareToken: string }>;
}

/**
 * Trang bảng công việc (Kanban Board) ở chế độ chia sẻ công khai — chỉ xem.
 */
export default function SharedBoardPage({ params }: PageProps) {
  const { shareToken } = React.use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const initialTaskId = searchParams ? searchParams.get("taskId") : null;

  const [columns, setColumns] = React.useState<BoardColumn[]>([]);
  const [tasks, setTasks] = React.useState<TaskItem[]>([]);
  const [assignees, setAssignees] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedTask, setSelectedTask] = React.useState<TaskItem | null>(null);
  const [isPersonalProject, setIsPersonalProject] = React.useState(false);
  const [selectedSprintId, setSelectedSprintId] = React.useState<string>("active");
  const [sprints, setSprints] = React.useState<any[]>([]);
  const [activeSprintName, setActiveSprintName] = React.useState<string | null>(null);
  const [activeSprintEndDate, setActiveSprintEndDate] = React.useState<string | null>(null);

  const {
    searchQuery, setSearchQuery,
    selectedAssignee, setSelectedAssignee,
    selectedPriority, setSelectedPriority,
    selectedDueDateFilter, setSelectedDueDateFilter,
    filteredTasks, handleResetFilters,
    sortBy, setSortBy,
  } = useSharedBoardFilters(tasks, columns);

  const fetchBoardData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      let boardUrl = `/shared/projects/${shareToken}/board`;
      if (selectedSprintId !== "active") {
        boardUrl += `?sprintId=${selectedSprintId}`;
      }

      const boardData = await api.get(boardUrl);
      if (boardData) {
        setColumns(boardData.boardColumns || []);
        const allTasks: TaskItem[] = [];
        (boardData.boardColumns || []).forEach((col: any) => {
          if (col.taskItems) allTasks.push(...col.taskItems);
        });
        setTasks(allTasks);
        setSprints(boardData.sprints || []);
        setActiveSprintName(boardData.activeSprintName || null);
        setActiveSprintEndDate(boardData.activeSprintEndDate || null);
      }

      const overviewData = await api.get(`/shared/projects/${shareToken}/overview`);
      if (overviewData) {
        setIsPersonalProject(overviewData.teamId === null || !overviewData.teamId);
        if (overviewData.memberWorkloads) {
          setAssignees(overviewData.memberWorkloads.map((m: any) => ({
            id: m.userId, displayName: m.displayName, avatar: m.avatar, role: m.role,
          })));
        }
      }
    } catch (err: any) {
      console.error("Failed to load shared board data:", err);
      setError(err.message || "Không thể tải dữ liệu bảng công việc.");
    } finally {
      setIsLoading(false);
    }
  }, [shareToken, selectedSprintId]);

  React.useEffect(() => { fetchBoardData(); }, [fetchBoardData]);

  React.useEffect(() => {
    if (initialTaskId && tasks.length > 0) {
      const task = tasks.find((t) => t.id === initialTaskId);
      if (task) setSelectedTask(task);
    }
  }, [initialTaskId, tasks]);

  const handleCloseModal = React.useCallback(() => {
    setSelectedTask(null);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.has("taskId")) {
        params.delete("taskId");
        const query = params.toString();
        router.replace(query ? `${pathname}?${query}` : pathname);
      }
    }
    fetchBoardData();
  }, [pathname, router, fetchBoardData]);

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
    <div className="flex flex-col min-h-full w-full p-6 pt-4 select-none bg-white">
      <BoardToolbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        assignees={assignees}
        selectedAssignee={selectedAssignee}
        setSelectedAssignee={setSelectedAssignee}
        selectedPriority={selectedPriority}
        setSelectedPriority={setSelectedPriority}
        selectedDueDateFilter={selectedDueDateFilter}
        setSelectedDueDateFilter={setSelectedDueDateFilter}
        onResetFilters={handleResetFilters}
        onCreateTaskClick={() => {}}
        readOnly={true}
        isPersonalProject={isPersonalProject}
        sortBy={sortBy}
        onSortChange={setSortBy}
        activeSprintName={activeSprintName}
        activeSprintEndDate={activeSprintEndDate}
        sprints={sprints}
        selectedSprintId={selectedSprintId}
        setSelectedSprintId={setSelectedSprintId}
      />

      <div className="flex-1 flex gap-4 overflow-x-auto pb-4 items-stretch min-h-[450px] scrollbar-thin">
        {columns.map((column, index) => (
          <div key={column.id} className="w-80 shrink-0 flex flex-col">
            <BoardColumnView
              column={column}
              tasks={filteredTasks.filter((t) => t.boardColumnId === column.id)}
              onTaskClick={(task) => setSelectedTask(task)}
              onRefresh={fetchBoardData}
              isFirst={index === 0}
              isLast={index === columns.length - 1}
              onMoveLeft={() => {}}
              onMoveRight={() => {}}
              onSetWipLimit={() => {}}
              onDeleteColumn={() => {}}
              onMoveTask={async () => {}}
              assignees={assignees}
              readOnly={true}
              isPersonalProject={isPersonalProject}
            />
          </div>
        ))}
      </div>

      {selectedTask && (
        <TaskDetailModal
          isOpen={!!selectedTask}
          onClose={handleCloseModal}
          task={selectedTask}
          columns={columns}
          onUpdateTask={(updated) => setSelectedTask(updated)}
          assignees={assignees}
          readOnly={true}
          shareToken={shareToken}
        />
      )}
    </div>
  );
}
