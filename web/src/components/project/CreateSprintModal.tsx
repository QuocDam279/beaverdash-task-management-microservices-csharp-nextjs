"use client";

import * as React from "react";

interface CreateSprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, goal?: string, startDate?: string, endDate?: string) => Promise<void>;
  defaultSprintNumber: number;
  projectStartDate?: string | null;
  projectDueDate?: string | null;
}

export function CreateSprintModal({
  isOpen,
  onClose,
  onSubmit,
  defaultSprintNumber,
  projectStartDate = null,
  projectDueDate = null,
}: CreateSprintModalProps) {
  const [name, setName] = React.useState("");
  const [goal, setGoal] = React.useState("");
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [duration, setDuration] = React.useState("2"); // defaults to 2 weeks
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setName(`Sprint ${defaultSprintNumber}`);
      setGoal("");
      setDuration("2");
      // Default StartDate to today (or project start date if today is before project start)
      const now = new Date();
      let defaultStart = now;
      if (projectStartDate) {
        const projStart = new Date(projectStartDate);
        if (now < projStart) {
          defaultStart = projStart;
        }
      }
      const yyyy = defaultStart.getFullYear();
      const mm = String(defaultStart.getMonth() + 1).padStart(2, "0");
      const dd = String(defaultStart.getDate()).padStart(2, "0");
      setStartDate(`${yyyy}-${mm}-${dd}`);
      setEndDate("");
    }
  }, [isOpen, defaultSprintNumber, projectStartDate]);

  React.useEffect(() => {
    if (startDate && duration !== "custom") {
      const start = new Date(startDate);
      const end = new Date(start.getTime() + parseInt(duration) * 7 * 24 * 60 * 60 * 1000);
      const yyyy = end.getFullYear();
      const mm = String(end.getMonth() + 1).padStart(2, "0");
      const dd = String(end.getDate()).padStart(2, "0");
      setEndDate(`${yyyy}-${mm}-${dd}`);
    }
  }, [startDate, duration]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsSubmitting(true);
      await onSubmit(
        name.trim(),
        goal.trim() || undefined,
        startDate || undefined,
        endDate || undefined
      );
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/45 dark:bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#161a1d] rounded-lg border border-slate-200 dark:border-[#2c3338] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-[#2c3338] flex justify-between items-center bg-slate-50/50 dark:bg-[#1d2125]">
          <h2 className="text-sm font-bold text-[#292a2e] dark:text-[#deebff] uppercase tracking-wide">
            Tạo Sprint mới
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-350 cursor-pointer p-0.5 rounded hover:bg-slate-100 dark:hover:bg-[#2c3338]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="p-5 space-y-4 overflow-y-auto scrollbar-thin flex-1">
            {/* Sprint Name */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#6b6e76] dark:text-slate-400 uppercase tracking-wider block">
                Tên Sprint <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập tên Sprint (ví dụ: Sprint 1)..."
                className="w-full px-3 py-1.5 text-xs border border-slate-300 dark:border-[#353e47] rounded-[4px] bg-white dark:bg-[#22272b] text-[#292a2e] dark:text-[#deebff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1868db] dark:focus-visible:ring-[#579dff] focus-visible:border-transparent transition-all"
                autoFocus
              />
            </div>

            {/* Goal */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#6b6e76] dark:text-slate-400 uppercase tracking-wider block">
                Mục tiêu Sprint
              </label>
              <textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="Mô tả mục tiêu chính của Sprint này..."
                rows={3}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 dark:border-[#353e47] rounded-[4px] bg-white dark:bg-[#22272b] text-[#292a2e] dark:text-[#deebff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1868db] dark:focus-visible:ring-[#579dff] focus-visible:border-transparent transition-all resize-none"
              />
            </div>

            {/* Sprint Duration */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#6b6e76] dark:text-slate-400 uppercase tracking-wider block">
                Chu kỳ chạy Sprint
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 dark:border-[#353e47] rounded-[4px] bg-white dark:bg-[#22272b] text-[#292a2e] dark:text-[#deebff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1868db] dark:focus-visible:ring-[#579dff] focus-visible:border-transparent transition-all cursor-pointer"
              >
                <option value="1">1 tuần</option>
                <option value="2">2 tuần (Mặc định)</option>
                <option value="3">3 tuần</option>
                <option value="4">4 tuần</option>
                <option value="custom">Tùy chọn ngày bắt đầu - kết thúc</option>
              </select>
            </div>

            {/* Start & End Date Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#6b6e76] dark:text-slate-400 uppercase tracking-wider block font-semibold text-slate-500 dark:text-slate-400">
                  Ngày bắt đầu (Dự kiến)
                </label>
                <input
                  type="date"
                  value={startDate}
                  min={projectStartDate ? projectStartDate.substring(0, 10) : undefined}
                  max={projectDueDate ? projectDueDate.substring(0, 10) : undefined}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-slate-300 dark:border-[#353e47] rounded-[4px] bg-white dark:bg-[#22272b] text-[#292a2e] dark:text-[#deebff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1868db] dark:focus-visible:ring-[#579dff] focus-visible:border-transparent transition-all cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#6b6e76] dark:text-slate-400 uppercase tracking-wider block font-semibold text-slate-500 dark:text-slate-400">
                  Ngày kết thúc (Dự kiến)
                </label>
                <input
                  type="date"
                  value={endDate}
                  disabled={duration !== "custom"}
                  min={startDate || (projectStartDate ? projectStartDate.substring(0, 10) : undefined)}
                  max={projectDueDate ? projectDueDate.substring(0, 10) : undefined}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`w-full px-2 py-1.5 text-xs border border-slate-300 dark:border-[#353e47] rounded-[4px] bg-white dark:bg-[#22272b] text-[#292a2e] dark:text-[#deebff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1868db] dark:focus-visible:ring-[#579dff] focus-visible:border-transparent transition-all cursor-pointer ${
                    duration !== "custom" ? "opacity-60 cursor-not-allowed bg-slate-50 dark:bg-[#22272b]" : ""
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-5 py-3 border-t border-slate-200 dark:border-[#2c3338] bg-slate-50/50 dark:bg-[#1d2125] flex justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="bg-transparent hover:bg-slate-100 dark:hover:bg-[#22272b] text-[#505258] dark:text-slate-400 text-xs font-bold px-3 py-2 rounded-[4px] border border-slate-200 dark:border-[#353e47] cursor-pointer transition-colors disabled:opacity-50"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#1868db] dark:bg-[#579dff] hover:bg-[#0052cc] dark:hover:bg-blue-400 text-white dark:text-[#1d2125] text-xs font-bold px-3 py-2 rounded-[4px] cursor-pointer transition-colors flex items-center gap-1.5 disabled:opacity-75"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Đang tạo...</span>
                </>
              ) : (
                <span>Tạo Sprint</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
