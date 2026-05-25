"use client";

import * as React from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { CalendarToolbar } from "./CalendarToolbar";
import { CalendarGrid } from "./CalendarGrid";
import { TaskDetailModal } from "./TaskDetailModal";
import { TaskItem, BoardColumn } from "@/types/task";
import { api } from "@/lib/api";

interface CalendarViewProps {
  tasks: TaskItem[];
  setTasks: React.Dispatch<React.SetStateAction<TaskItem[]>>;
  viewContext: "project" | "my-tasks";
  projectId?: string;
  showProjectPrefix?: boolean;
}

export default function CalendarView({
  tasks,
  setTasks,
  viewContext,
  projectId,
  showProjectPrefix = false,
}: CalendarViewProps) {
  const { user: currentUser } = useAuth();
  
  const [currentDate, setCurrentDate] = React.useState<Date>(new Date(2026, 4, 22));
  const [viewMode, setViewMode] = React.useState<"month" | "week">("month");
  
  const [selectedTask, setSelectedTask] = React.useState<TaskItem | null>(null);
  const [activeColumns, setActiveColumns] = React.useState<BoardColumn[]>([]);
  const [activeAssignees, setActiveAssignees] = React.useState<any[]>([]);

  const handleTaskClick = async (task: TaskItem) => {
    try {
      const fullTask = await api.get(`/tasks/${task.id}`);
      if (fullTask) {
        const taskId = fullTask.projectId;
        const board = await api.get(`/projects/${taskId}/board`);
        const overview = await api.get(`/projects/${taskId}/overview`);
        
        let projectAssignees: any[] = [];
        if (overview?.teamId) {
          const team = await api.get(`/teams/${overview.teamId}`);
          projectAssignees = team.members.map((m: any) => ({
            id: m.userId,
            displayName: m.displayName,
            avatar: m.avatar,
            email: m.email,
          }));
        } else if (currentUser) {
          projectAssignees = [currentUser];
        }

        setActiveColumns(board.boardColumns || []);
        setActiveAssignees(projectAssignees);
        setSelectedTask({
          ...fullTask,
          assigneeUser: fullTask.assigneeUserId ? {
            id: fullTask.assigneeUserId,
            displayName: fullTask.assigneeName,
            avatar: fullTask.assigneeAvatar
          } : null
        });
      }
    } catch (err) {
      console.error("Failed to load task details:", err);
    }
  };

  const handleTaskDrop = async (taskId: string, targetDate: Date) => {
    try {
      const origTask = tasks.find((t) => t.id === taskId);
      if (!origTask) return;
      
      const newDueDate = new Date(
        targetDate.getFullYear(),
        targetDate.getMonth(),
        targetDate.getDate(),
        17, 0, 0
      ).toISOString();

      await api.patch(`/tasks/${taskId}`, { dueDate: newDueDate });

      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, dueDate: newDueDate } : t))
      );
    } catch (err: any) {
      console.error("Failed to update task due date on drop:", err);
      alert(err.message || "Không thể cập nhật hạn hoàn thành.");
    }
  };

  // Month View calculations
  const monthCells = React.useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const numDays = lastDay.getDate();

    let startDayOfWeek = firstDay.getDay();
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    const cells: { date: Date; isCurrentMonth: boolean }[] = [];

    const prevMonthEnd = new Date(year, month, 0);
    const prevMonthDaysCount = prevMonthEnd.getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      cells.push({
        date: new Date(year, month - 1, prevMonthDaysCount - i),
        isCurrentMonth: false,
      });
    }

    for (let i = 1; i <= numDays; i++) {
      cells.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    const totalCells = cells.length > 35 ? 42 : 35;
    const remaining = totalCells - cells.length;
    for (let i = 1; i <= remaining; i++) {
      cells.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return cells;
  }, [currentDate]);

  // Week View calculations
  const weekCells = React.useMemo(() => {
    const temp = new Date(currentDate);
    const day = temp.getDay();
    const diff = temp.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(temp.setDate(diff));

    const cells: { date: Date; isCurrentMonth: boolean }[] = [];
    for (let i = 0; i < 7; i++) {
      const cellDate = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
      cells.push({
        date: cellDate,
        isCurrentMonth: cellDate.getMonth() === currentDate.getMonth(),
      });
    }
    return cells;
  }, [currentDate]);

  const cells = viewMode === "month" ? monthCells : weekCells;
  const monthNames = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
  ];
  const monthLabel = `${monthNames[currentDate.getMonth()]} năm ${currentDate.getFullYear()}`;

  return (
    <div className="space-y-6 flex-1 flex flex-col min-h-0 bg-white">
      <CalendarToolbar
        monthLabel={monthLabel}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onPrev={() => {
          const y = currentDate.getFullYear();
          const m = currentDate.getMonth();
          const d = currentDate.getDate();
          setCurrentDate(viewMode === "month" ? new Date(y, m - 1, 1) : new Date(y, m, d - 7));
        }}
        onNext={() => {
          const y = currentDate.getFullYear();
          const m = currentDate.getMonth();
          const d = currentDate.getDate();
          setCurrentDate(viewMode === "month" ? new Date(y, m + 1, 1) : new Date(y, m, d + 7));
        }}
        onToday={() => setCurrentDate(new Date(2026, 4, 22))}
      />

      <CalendarGrid
        cells={cells}
        viewMode={viewMode}
        tasks={tasks}
        showProjectPrefix={showProjectPrefix}
        onTaskClick={handleTaskClick}
        onTaskDrop={handleTaskDrop}
      />

      {selectedTask && (
        <TaskDetailModal
          isOpen={!!selectedTask}
          onClose={() => {
            setSelectedTask(null);
            // Refresh parent calendar tasks
            if (viewContext === "project" && projectId) {
              api.get(`/projects/${projectId}/board`).then(board => {
                const cols = board?.boardColumns || [];
                const allTasks = cols.flatMap((col: any) =>
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
              });
            } else {
              // Reload my-tasks tasks
              api.get("/tasks").then(data => {
                setTasks(data || []);
              }).catch(() => {});
            }
          }}
          task={selectedTask}
          columns={activeColumns}
          onUpdateTask={(updated) => setSelectedTask(updated)}
          assignees={activeAssignees}
        />
      )}
    </div>
  );
}
