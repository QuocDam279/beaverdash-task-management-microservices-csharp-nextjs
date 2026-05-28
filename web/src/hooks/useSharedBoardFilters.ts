import * as React from "react";
import { TaskItem, BoardColumn } from "@/types/task";

/**
 * Hook quản lý logic lọc và state bộ lọc cho bảng công việc chia sẻ (shared board).
 */
export function useSharedBoardFilters(tasks: TaskItem[], columns: BoardColumn[]) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedAssignee, setSelectedAssignee] = React.useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = React.useState<string | null>(null);
  const [selectedDueDateFilter, setSelectedDueDateFilter] = React.useState<string | null>(null);

  const filteredTasks = React.useMemo(() => {
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);
    const doneColumnIds = columns.filter((c) => c.isDone).map((c) => c.id);

    return tasks.filter((t) => {
      const matchSearch =
        !searchQuery.trim() ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase());

      const matchAssignee =
        !selectedAssignee ||
        (selectedAssignee === "unassigned"
          ? !t.assigneeUserId && (!t.subTasks || t.subTasks.every((st) => !st.assigneeUserId))
          : t.assigneeUserId === selectedAssignee ||
            (t.subTasks && t.subTasks.some((st) => st.assigneeUserId === selectedAssignee)));

      const matchPriority =
        !selectedPriority || t.priority === selectedPriority;

      let matchDueDate = true;
      if (selectedDueDateFilter === "overdue") {
        matchDueDate =
          !!t.dueDate &&
          !doneColumnIds.includes(t.boardColumnId) &&
          new Date(t.dueDate) < now;
      } else if (selectedDueDateFilter === "upcoming7") {
        matchDueDate =
          !!t.dueDate &&
          !doneColumnIds.includes(t.boardColumnId) &&
          new Date(t.dueDate) >= now &&
          new Date(t.dueDate) <= sevenDaysFromNow;
      }

      return matchSearch && matchAssignee && matchPriority && matchDueDate;
    });
  }, [tasks, columns, searchQuery, selectedAssignee, selectedPriority, selectedDueDateFilter]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedAssignee(null);
    setSelectedPriority(null);
    setSelectedDueDateFilter(null);
  };

  return {
    searchQuery,
    setSearchQuery,
    selectedAssignee,
    setSelectedAssignee,
    selectedPriority,
    setSelectedPriority,
    selectedDueDateFilter,
    setSelectedDueDateFilter,
    filteredTasks,
    handleResetFilters,
  };
}
