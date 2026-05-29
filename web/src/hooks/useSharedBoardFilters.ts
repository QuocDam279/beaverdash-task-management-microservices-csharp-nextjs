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
  const [sortBy, setSortBy] = React.useState<string>("manual");

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

  const getPriorityWeight = (p: string | null) => {
    if (!p) return 0;
    switch (p) {
      case "Required": case "Critical": case "High": return 3;
      case "Important": case "Medium": return 2;
      case "Extended": case "Low": return 1;
      default: return 0;
    }
  };

  const sortedTasks = React.useMemo(() => {
    const list = [...filteredTasks];
    if (sortBy === "dueDate") {
      list.sort((a, b) => {
        if (a.dueDate && b.dueDate) {
          const diff = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          if (diff !== 0) return diff;
        } else if (a.dueDate) {
          return -1;
        } else if (b.dueDate) {
          return 1;
        }
        return getPriorityWeight(b.priority) - getPriorityWeight(a.priority);
      });
    } else if (sortBy === "priority") {
      list.sort((a, b) => {
        const diff = getPriorityWeight(b.priority) - getPriorityWeight(a.priority);
        if (diff !== 0) return diff;
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        } else if (a.dueDate) {
          return -1;
        } else if (b.dueDate) {
          return 1;
        }
        return 0;
      });
    } else {
      list.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    }
    return list;
  }, [filteredTasks, sortBy]);

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
    filteredTasks: sortedTasks,
    handleResetFilters,
    sortBy,
    setSortBy,
  };
}
