"use client";

import * as React from "react";
import { TaskItem, BoardColumn } from "@/types/task";
import { api } from "@/lib/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { BoardTaskCard } from "./BoardTaskCard";

interface BoardColumnViewProps {
  column: BoardColumn;
  tasks: TaskItem[];
  onTaskClick: (task: TaskItem) => void;
  onRefresh: () => void;
  isFirst: boolean;
  isLast: boolean;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onSetWipLimit: () => void;
  onDeleteColumn: () => void;
  onMoveTask: (taskId: string, targetColumnId: string) => Promise<void>;
  onSetColumnDone?: (columnId: string) => void;
  assignees?: any[];
  readOnly?: boolean;
  isPersonalProject?: boolean;
}

export function BoardColumnView({
  column,
  tasks,
  onTaskClick,
  onRefresh,
  isFirst,
  isLast,
  onMoveLeft,
  onMoveRight,
  onSetWipLimit,
  onDeleteColumn,
  onMoveTask,
  onSetColumnDone,
  assignees = [],
  readOnly = false,
  isPersonalProject = false,
}: BoardColumnViewProps) {
  const { user: currentUser } = useAuth();
  const [newTitle, setNewTitle] = React.useState("");
  const [isAdding, setIsAdding] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isDraggingOver, setIsDraggingOver] = React.useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    if (readOnly) return;
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    if (readOnly) return;
    setIsDraggingOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    if (readOnly) return;
    e.preventDefault();
    setIsDraggingOver(false);
    const taskId = e.dataTransfer.getData("taskId");
    const sourceColumnId = e.dataTransfer.getData("sourceColumnId");
    
    if (taskId && sourceColumnId !== column.id) {
      await onMoveTask(taskId, column.id);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      await api.post("/tasks", {
        boardColumnId: column.id,
        title: newTitle.trim(),
      });
      setNewTitle("");
      setIsAdding(false);
      onRefresh();
    } catch (err) {
      console.error("Failed to create task:", err);
    }
  };



  const isWipExceeded = column.wipLimit !== null && column.wipLimit > 0 && tasks.length > column.wipLimit;

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col rounded-lg p-3 min-h-[300px] h-fit transition-all duration-200 border-2 ${
        isDraggingOver 
          ? "bg-slate-200 border-dashed border-[#1868db] scale-[1.01]" 
          : isWipExceeded
            ? "bg-[#fff5f5] border-red-200/60 border-t-4 border-t-red-500"
            : "bg-[#f4f5f7] border-transparent"
      }`}
    >
      <div className={`flex items-center justify-between mb-3 px-2 py-1.5 rounded-md transition-all border ${
        isWipExceeded 
          ? "bg-red-50/80 border-red-200/80 text-red-700" 
          : "bg-transparent border-transparent text-[#505258]"
      }`}>
        <div className="flex items-center gap-1.5 min-w-0">
          {column.isDone && (
            <span className={`rounded-[4px] px-1 flex items-center justify-center scale-90 select-none font-bold ${
              isWipExceeded 
                ? "text-red-700 bg-red-100 border border-red-300" 
                : "text-emerald-600 bg-emerald-50 border border-emerald-250"
            }`} title="Cột hoàn thành">
              ✓
            </span>
          )}
          <span className={`text-xs font-bold tracking-wider uppercase truncate ${isWipExceeded ? "text-red-700 font-extrabold" : "text-[#505258]"}`} title={column.name}>
            {column.name}
          </span>
        </div>
        <div className="flex items-center gap-2 relative">
          {column.wipLimit && column.wipLimit > 0 ? (
            <span 
              className={`text-xs font-bold px-2 py-0.5 rounded-full border transition-all ${
                isWipExceeded
                  ? "bg-red-600 text-white border-transparent"
                  : "bg-slate-200/80 text-[#6b6e76] border-transparent"
              }`}
              title={`Số lượng công việc: ${tasks.length} / Giới hạn WIP: ${column.wipLimit}${isWipExceeded ? " (Vượt giới hạn WIP!)" : ""}`}
            >
              {tasks.length}/{column.wipLimit}
            </span>
          ) : (
            <span className="text-xs font-bold text-[#6b6e76] bg-slate-200/80 px-2 py-0.5 rounded-full">
              {tasks.length}
            </span>
          )}

          {/* 3-dots context menu */}
          {!readOnly && (
            <div className="relative flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`p-1 rounded transition-colors cursor-pointer flex items-center justify-center border-0 bg-transparent ${
                  isWipExceeded 
                    ? "hover:bg-red-100 text-red-600 hover:text-red-800" 
                    : "hover:bg-slate-200 text-slate-500 hover:text-slate-700"
                }`}
                title="Thao tác cột"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="5" r="1.5"></circle>
                  <circle cx="12" cy="12" r="1.5"></circle>
                  <circle cx="12" cy="19" r="1.5"></circle>
                </svg>
              </button>

              {isMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 w-44 rounded-md border border-slate-200 bg-white shadow-lg z-20 py-1 text-[11px] text-[#292a2e]">
                    <button
                      disabled={isFirst}
                      onClick={() => {
                        setIsMenuOpen(false);
                        onMoveLeft();
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:cursor-not-allowed border-0 bg-transparent"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                      </svg>
                      Dịch sang trái
                    </button>
                    <button
                      disabled={isLast}
                      onClick={() => {
                        setIsMenuOpen(false);
                        onMoveRight();
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:cursor-not-allowed border-0 bg-transparent"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                      Dịch sang phải
                    </button>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onSetWipLimit();
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-100 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border-0 bg-transparent"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                      </svg>
                      Thiết đặt WIP
                    </button>
                    {!column.isDone && onSetColumnDone && (
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          onSetColumnDone(column.id);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-slate-100 font-semibold text-emerald-600 flex items-center gap-1.5 transition-colors cursor-pointer border-0 bg-transparent"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Đặt làm cột hoàn thành
                      </button>
                    )}
                    <div className="border-t border-slate-100 my-1" />
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onDeleteColumn();
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600 font-bold flex items-center gap-1.5 transition-colors cursor-pointer border-0 bg-transparent"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                      Xóa cột
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-2.5">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <BoardTaskCard
              key={task.id}
              task={task}
              column={column}
              onTaskClick={onTaskClick}
              currentUser={currentUser}
              assignees={assignees}
              readOnly={readOnly}
              isPersonalProject={isPersonalProject}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center border-2 border-dashed border-slate-200/50 rounded-lg text-slate-400 text-xs">
            Không có công việc
          </div>
        )}
      </div>

      {!readOnly && (
        <div className="mt-3">
          {isAdding ? (
            <form onSubmit={handleCreateTask} className="space-y-2">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Nhập tiêu đề công việc..."
                className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-[4px] bg-white text-[#292a2e] focus:outline-none focus:ring-1 focus:ring-[#1868db]"
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setNewTitle("");
                  }}
                  className="px-2 py-1 text-[11px] text-slate-500 hover:bg-slate-200 rounded"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-2 py-1 text-[11px] bg-[#1868db] text-white rounded hover:bg-[#0052cc]"
                >
                  Thêm
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full py-1.5 text-xs text-[#505258] hover:text-[#1868db] hover:bg-slate-200/50 rounded text-left px-2 font-semibold transition-colors"
            >
              + Thêm công việc
            </button>
          )}
        </div>
      )}
    </div>
  );
}
