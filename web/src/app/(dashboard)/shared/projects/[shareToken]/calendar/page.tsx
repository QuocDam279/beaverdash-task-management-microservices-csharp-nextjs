"use client";

import * as React from "react";
import CalendarView from "@/components/project/CalendarView";
import { TaskItem } from "@/types/task";
import { api } from "@/lib/api";

interface PageProps {
  params: Promise<{ shareToken: string }>;
}

export default function SharedProjectCalendarPage({ params }: PageProps) {
  const { shareToken } = React.use(params);

  const [tasks, setTasks] = React.useState<TaskItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchCalendarTasks = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const board = await api.get(`/shared/projects/${shareToken}/board`);
      if (board) {
        const cols = board.boardColumns || [];
        const allTasks: TaskItem[] = [];
        cols.forEach((col: any) => {
          (col.taskItems || []).forEach((t: any) => {
            (t.subTasks || []).forEach((st: any) => {
              allTasks.push({
                id: st.id,
                boardColumnId: col.id,
                title: st.title,
                isCompleted: st.isCompleted,
                completedAt: st.isCompleted ? st.updatedAt || new Date().toISOString() : null,
                dueDate: st.dueDate,
                startDate: null,
                priority: t.priority,
                parentTaskId: t.id,
                parentTaskTitle: t.title,
                projectName: board.name,
                projectId: board.id,
                assigneeUserId: st.assigneeUserId,
                assigneeUser: st.assigneeUserId ? {
                  id: st.assigneeUserId,
                  displayName: st.assigneeName,
                  avatar: st.assigneeAvatar
                } : null
              } as any);
            });
          });
        });
        setTasks(allTasks);
      }
    } catch (err: any) {
      console.error("Failed to load calendar tasks:", err);
      setError(err.message || "Đã xảy ra lỗi khi tải danh sách công việc.");
    } finally {
      setIsLoading(false);
    }
  }, [shareToken]);

  React.useEffect(() => {
    fetchCalendarTasks();
  }, [fetchCalendarTasks]);

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

  return (
    <div className="p-6 h-full flex flex-col bg-white dark:bg-[#1d2125]">
      <CalendarView
        tasks={tasks}
        setTasks={setTasks}
        viewContext="shared-project"
        shareToken={shareToken}
        showProjectPrefix={false}
        readOnly={true}
      />
    </div>
  );
}
