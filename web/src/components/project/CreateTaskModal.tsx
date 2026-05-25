"use client";

import * as React from "react";
import { api } from "@/lib/api";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  columns: any[];
  assignees: any[];
  onTaskCreated: () => void;
  projectStartDate?: string | null;
  projectDueDate?: string | null;
}

export function CreateTaskModal({
  isOpen,
  onClose,
  columns,
  assignees,
  onTaskCreated,
  projectStartDate,
  projectDueDate,
}: CreateTaskModalProps) {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [boardColumnId, setBoardColumnId] = React.useState("");
  const [assigneeUserId, setAssigneeUserId] = React.useState("");
  const [priority, setPriority] = React.useState("Medium");
  const [startDate, setStartDate] = React.useState("");
  const [dueDate, setDueDate] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Initialize fields on open
  React.useEffect(() => {
    if (isOpen) {
      setTitle("");
      setDescription("");
      setAssigneeUserId("");
      setPriority("Medium");
      setStartDate("");
      setDueDate("");
      if (columns && columns.length > 0) {
        setBoardColumnId(columns[0].id);
      } else {
        setBoardColumnId("");
      }
    }
  }, [isOpen, columns]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !boardColumnId) return;

    try {
      setIsSubmitting(true);
      await api.post("/tasks", {
        boardColumnId,
        title: title.trim(),
        description: description.trim() || null,
        priority: priority || null,
        assigneeUserId: assigneeUserId || null,
        startDate: startDate ? new Date(startDate).toISOString() : null,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      });

      onTaskCreated();
      onClose();
    } catch (err: any) {
      console.error("Failed to create task:", err);
      alert(err.message || "Đã xảy ra lỗi khi tạo công việc.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none animate-in fade-in duration-200">
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-sm font-bold text-[#292a2e] uppercase tracking-wide">
            Tạo công việc mới
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5 rounded hover:bg-slate-100"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="p-5 space-y-4 overflow-y-auto scrollbar-thin flex-1">
            {/* Title */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#6b6e76] uppercase tracking-wider block">
                Tiêu đề công việc <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nhập tiêu đề công việc..."
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-[4px] bg-white text-[#292a2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1868db] focus-visible:border-transparent transition-all"
                autoFocus
              />
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#6b6e76] uppercase tracking-wider block">
                Mô tả chi tiết
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả các bước thực hiện, mục tiêu..."
                rows={3}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-[4px] bg-white text-[#292a2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1868db] focus-visible:border-transparent transition-all resize-none"
              />
            </div>

            {/* Grid 2 Columns */}
            <div className="grid grid-cols-2 gap-4">
              {/* Board Column */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#6b6e76] uppercase tracking-wider block">
                  Cột công việc <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={boardColumnId}
                  onChange={(e) => setBoardColumnId(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-[4px] bg-white text-[#292a2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1868db] focus-visible:border-transparent transition-all cursor-pointer"
                >
                  {columns.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Assignee */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#6b6e76] uppercase tracking-wider block">
                  Người thực hiện
                </label>
                <select
                  value={assigneeUserId}
                  onChange={(e) => setAssigneeUserId(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-[4px] bg-white text-[#292a2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1868db] focus-visible:border-transparent transition-all cursor-pointer"
                >
                  <option value="">Chưa giao việc</option>
                  {assignees.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.displayName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Grid 3 Columns */}
            <div className="grid grid-cols-3 gap-3">
              {/* Priority */}
              <div className="space-y-1 col-span-1">
                <label className="text-[11px] font-bold text-[#6b6e76] uppercase tracking-wider block">
                  Độ ưu tiên
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-[4px] bg-white text-[#292a2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1868db] focus-visible:border-transparent transition-all cursor-pointer"
                >
                  <option value="Low">Thấp (Low)</option>
                  <option value="Medium">Trung bình (Medium)</option>
                  <option value="High">Cao (High)</option>
                  <option value="Critical">Khẩn cấp (Critical)</option>
                </select>
              </div>

              {/* Start Date */}
              <div className="space-y-1 col-span-1">
                <label className="text-[11px] font-bold text-[#6b6e76] uppercase tracking-wider block font-semibold text-slate-500">
                  Ngày bắt đầu
                </label>
                <input
                  type="date"
                  value={startDate}
                  min={projectStartDate ? projectStartDate.substring(0, 10) : undefined}
                  max={dueDate ? dueDate : (projectDueDate ? projectDueDate.substring(0, 10) : undefined)}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-[4px] bg-white text-[#292a2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1868db] focus-visible:border-transparent transition-all cursor-pointer"
                />
              </div>

              {/* Due Date */}
              <div className="space-y-1 col-span-1">
                <label className="text-[11px] font-bold text-[#6b6e76] uppercase tracking-wider block font-semibold text-slate-500">
                  Hạn chót
                </label>
                <input
                  type="date"
                  value={dueDate}
                  min={startDate ? startDate : (projectStartDate ? projectStartDate.substring(0, 10) : undefined)}
                  max={projectDueDate ? projectDueDate.substring(0, 10) : undefined}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-[4px] bg-white text-[#292a2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1868db] focus-visible:border-transparent transition-all cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-5 py-3 border-t border-slate-200 bg-slate-50/50 flex justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="bg-transparent hover:bg-slate-100 text-[#505258] text-xs font-bold px-3 py-2 rounded-[4px] border border-slate-200 cursor-pointer transition-colors disabled:opacity-50"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#1868db] hover:bg-[#0052cc] text-white text-xs font-bold px-3 py-2 rounded-[4px] cursor-pointer transition-colors flex items-center gap-1.5 disabled:opacity-75"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Đang lưu...</span>
                </>
              ) : (
                <span>Tạo công việc</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
