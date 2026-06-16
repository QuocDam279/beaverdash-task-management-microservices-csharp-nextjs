"use client";

import * as React from "react";
import { TaskItem, BoardColumn } from "@/types/task";
import { Avatar } from "@/components/ui/Avatar";
import { BoardTaskCard } from "./BoardTaskCard";
import { SubTaskBoardCard } from "./SubTaskBoardCard";
import { getTaskPriorityLabel } from "@/lib/utils";

interface BoardGroupedViewProps {
  columns: BoardColumn[];
  tasks: TaskItem[];
  groupBy: "subtask" | string;
  onMoveTask: (taskId: string, columnId: string) => Promise<void>;
  onMoveSubTask: (subTaskId: string, columnId: string) => Promise<void>;
  onTaskClick: (task: TaskItem) => void;
  currentUser: any;
  assignees: any[];
  readOnly?: boolean;
  isPersonalProject?: boolean;
}

export function BoardGroupedView({
  columns,
  tasks,
  groupBy,
  onMoveTask,
  onMoveSubTask,
  onTaskClick,
  currentUser,
  assignees,
  readOnly = false,
  isPersonalProject = false,
}: BoardGroupedViewProps) {


  // Track expanded/collapsed state for each swimlane
  const [collapsedSwimlanes, setCollapsedSwimlanes] = React.useState<Record<string, boolean>>({});

  const toggleSwimlane = (id: string) => {
    setCollapsedSwimlanes((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    if (readOnly) return;
    const subTaskId = e.dataTransfer.getData("subtaskid");
    const taskId = e.dataTransfer.getData("taskid");

    if (subTaskId) {
      await onMoveSubTask(subTaskId, targetColumnId);
    } else if (taskId) {
      if (targetColumnId === "completed") {
        const doneCol = columns.find(c => c.isDone);
        if (doneCol) {
          await onMoveTask(taskId, doneCol.id);
        }
      } else if (targetColumnId === "uncompleted") {
        const todoCol = [...columns].sort((a, b) => a.position - b.position).find(c => !c.isDone);
        if (todoCol) {
          await onMoveTask(taskId, todoCol.id);
        }
      } else {
        await onMoveTask(taskId, targetColumnId);
      }
    }
  };

  // Render priority helper for parent task swimlane header
  const renderPriority = (priority: string | null) => {
    if (!priority) return null;
    const p = priority.toLowerCase();
    const label = getTaskPriorityLabel(priority);
    if (p === "required" || p === "critical" || p === "high") {
      return (
        <span className="rounded bg-red-50 dark:bg-red-950/20 px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-red-700 dark:text-red-400 border border-red-200/50 dark:border-red-900/30">
          {label}
        </span>
      );
    }
    if (p === "important" || p === "medium") {
      return (
        <span className="rounded bg-blue-50 dark:bg-blue-950/20 px-1.5 py-0.5 text-[9px] font-bold uppercase text-blue-700 dark:text-blue-400 border border-blue-200/50 dark:border-blue-900/30">
          {label}
        </span>
      );
    }
    return null;
  };



  // Grouping 2: BY SUBTASK
  if (groupBy === "subtask") {
    // Parent tasks that have at least one subtask
    const parentTasks = tasks.filter((t) => t.subTasks && t.subTasks.length > 0);
    // Tasks that do not have subtasks (these go to the bottom swimlane)
    const otherTasks = tasks.filter((t) => !t.subTasks || t.subTasks.length === 0);

    const doneColumnIds = new Set(columns.filter(c => c.isDone).map(c => c.id));

    return (
      <div className="space-y-4 select-none">
        {/* Parent Task Swimlanes */}
        {parentTasks.map((parentTask) => {
          const isCollapsed = !!collapsedSwimlanes[parentTask.id];
          const subTasks = parentTask.subTasks || [];
          const assignee = parentTask.assigneeUserId 
            ? assignees.find((a) => a.id === parentTask.assigneeUserId)
            : null;

          const uncompletedSubtasks = subTasks.filter((st) => !st.isCompleted);
          const completedSubtasks = subTasks.filter((st) => st.isCompleted);

          return (
            <div key={parentTask.id} className="border border-slate-250 dark:border-[#2c3338] rounded-lg overflow-hidden bg-[#fafbfc] dark:bg-[#161a1d]">
              {/* Swimlane Header */}
              <div 
                onClick={() => toggleSwimlane(parentTask.id)}
                className="px-3.5 py-2.5 bg-slate-100/50 dark:bg-[#1e2227]/40 border-b border-slate-200 dark:border-[#2c3338] flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-[#1e2227]/60 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className={`text-slate-400 dark:text-slate-500 transition-transform flex-shrink-0 ${isCollapsed ? "" : "rotate-90"}`}
                  >
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                  <span className="text-xs font-bold text-[#1868db] dark:text-[#579dff] hover:underline truncate cursor-pointer flex-shrink-0" onClick={(e) => {
                    e.stopPropagation();
                    onTaskClick(parentTask);
                  }}>
                    {parentTask.title}
                  </span>
                  <span className="text-[10px] bg-slate-200 dark:bg-[#2c3338] text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded font-bold flex-shrink-0">
                    {subTasks.length} nhiệm vụ con
                  </span>
                </div>
                
                {/* Parent Task Info Badge in Header */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {renderPriority(parentTask.priority)}
                  {assignee && (
                    <Avatar
                      src={assignee.avatar}
                      alt={assignee.displayName}
                      title={`Phụ trách chính: ${assignee.displayName}`}
                      className="h-5 w-5 rounded-full"
                    />
                  )}
                </div>
              </div>

              {/* Swimlane Columns Grid (renders subtasks in 2 columns) */}
              {!isCollapsed && (
                <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-3 bg-white dark:bg-[#1d2125]/20">
                  {/* Column 1: Chưa hoàn thành */}
                  <div
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, "uncompleted")}
                    className="min-h-[100px] bg-slate-50/50 dark:bg-[#1d2125]/45 border border-dashed border-slate-205 dark:border-[#2c3338]/85 rounded-lg p-2.5 space-y-2.5 transition-colors"
                  >
                    <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                      Chưa hoàn thành ({uncompletedSubtasks.length})
                    </div>
                    {uncompletedSubtasks.length > 0 ? (
                      uncompletedSubtasks.map((st) => (
                        <SubTaskBoardCard
                          key={st.id}
                          subTask={st}
                          parentTask={parentTask}
                          column={null as any}
                          onTaskClick={onTaskClick}
                          currentUser={currentUser}
                          assignees={assignees}
                          readOnly={readOnly}
                        />
                      ))
                    ) : (
                      <div className="h-full min-h-[50px] flex items-center justify-center text-[10px] text-slate-400/60 italic">
                        Kéo thả vào đây
                      </div>
                    )}
                  </div>

                  {/* Column 2: Đã hoàn thành */}
                  <div
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, "completed")}
                    className="min-h-[100px] bg-slate-50/50 dark:bg-[#1d2125]/45 border border-dashed border-slate-205 dark:border-[#2c3338]/85 rounded-lg p-2.5 space-y-2.5 transition-colors"
                  >
                    <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                      Đã hoàn thành ({completedSubtasks.length})
                    </div>
                    {completedSubtasks.length > 0 ? (
                      completedSubtasks.map((st) => (
                        <SubTaskBoardCard
                          key={st.id}
                          subTask={st}
                          parentTask={parentTask}
                          column={null as any}
                          onTaskClick={onTaskClick}
                          currentUser={currentUser}
                          assignees={assignees}
                          readOnly={readOnly}
                        />
                      ))
                    ) : (
                      <div className="h-full min-h-[50px] flex items-center justify-center text-[10px] text-slate-400/60 italic">
                        Kéo thả vào đây
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Other Tasks Swimlane (Everything else / Tasks without subtasks) */}
        {otherTasks.length > 0 && (() => {
          const isCollapsed = !!collapsedSwimlanes["other"];
          const uncompletedOtherTasks = otherTasks.filter((t) => !doneColumnIds.has(t.boardColumnId));
          const completedOtherTasks = otherTasks.filter((t) => doneColumnIds.has(t.boardColumnId));

          return (
            <div className="border border-slate-250 dark:border-[#2c3338] rounded-lg overflow-hidden bg-[#fafbfc] dark:bg-[#161a1d]">
              <div 
                onClick={() => toggleSwimlane("other")}
                className="px-3.5 py-2.5 bg-slate-100/50 dark:bg-[#1e2227]/40 border-b border-slate-200 dark:border-[#2c3338] flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-[#1e2227]/60 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className={`text-slate-400 dark:text-slate-500 transition-transform ${isCollapsed ? "" : "rotate-90"}`}
                  >
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-350">
                    Công việc khác (không có nhiệm vụ con)
                  </span>
                  <span className="text-[10px] bg-slate-200 dark:bg-[#2c3338] text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded font-bold">
                    {otherTasks.length} công việc
                  </span>
                </div>
              </div>

              {!isCollapsed && (
                <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-3 bg-white dark:bg-[#1d2125]/20">
                  {/* Column 1: Chưa hoàn thành */}
                  <div
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, "uncompleted")}
                    className="min-h-[120px] bg-slate-50/50 dark:bg-[#1d2125]/45 border border-dashed border-slate-205 dark:border-[#2c3338]/85 rounded-lg p-2.5 space-y-2.5 transition-colors"
                  >
                    <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                      Chưa hoàn thành ({uncompletedOtherTasks.length})
                    </div>
                    {uncompletedOtherTasks.length > 0 ? (
                      uncompletedOtherTasks.map((task) => (
                        <BoardTaskCard
                          key={task.id}
                          task={task}
                          column={null as any}
                          onTaskClick={onTaskClick}
                          currentUser={currentUser}
                          assignees={assignees}
                          readOnly={readOnly}
                          isPersonalProject={isPersonalProject}
                        />
                      ))
                    ) : (
                      <div className="h-full min-h-[60px] flex items-center justify-center text-[10px] text-slate-400/70 italic">
                        Kéo thả vào đây
                      </div>
                    )}
                  </div>

                  {/* Column 2: Đã hoàn thành */}
                  <div
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, "completed")}
                    className="min-h-[120px] bg-slate-50/50 dark:bg-[#1d2125]/45 border border-dashed border-slate-205 dark:border-[#2c3338]/85 rounded-lg p-2.5 space-y-2.5 transition-colors"
                  >
                    <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                      Đã hoàn thành ({completedOtherTasks.length})
                    </div>
                    {completedOtherTasks.length > 0 ? (
                      completedOtherTasks.map((task) => (
                        <BoardTaskCard
                          key={task.id}
                          task={task}
                          column={null as any}
                          onTaskClick={onTaskClick}
                          currentUser={currentUser}
                          assignees={assignees}
                          readOnly={readOnly}
                          isPersonalProject={isPersonalProject}
                        />
                      ))
                    ) : (
                      <div className="h-full min-h-[60px] flex items-center justify-center text-[10px] text-slate-400/70 italic">
                        Kéo thả vào đây
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </div>
    );
  }

  return null;
}
