"use client";

import * as React from "react";
import type { SprintDto } from "@/types/api";

interface CloseSprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (action: "MoveToBacklog" | "MoveToNextSprint", moveToSprintId?: string) => Promise<void>;
  sprint: SprintDto;
  futureSprints: SprintDto[];
}

export function CloseSprintModal({
  isOpen,
  onClose,
  onConfirm,
  sprint,
  futureSprints
}: CloseSprintModalProps) {
  const [action, setAction] = React.useState<"MoveToBacklog" | "MoveToNextSprint">("MoveToBacklog");
  const [moveToSprintId, setMoveToSprintId] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setAction("MoveToBacklog");
      if (futureSprints && futureSprints.length > 0) {
        setMoveToSprintId(futureSprints[0].id);
      } else {
        setMoveToSprintId("");
      }
    }
  }, [isOpen, futureSprints]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await onConfirm(
        action,
        action === "MoveToNextSprint" && moveToSprintId ? moveToSprintId : undefined
      );
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalTasks = sprint.taskCount;
  const completedTasks = sprint.completedTaskCount;
  const incompleteTasks = totalTasks - completedTasks;

  return (
    <div className="fixed inset-0 bg-black/45 dark:bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#161a1d] rounded-lg border border-slate-200 dark:border-[#2c3338] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-[#2c3338] flex justify-between items-center bg-slate-50/50 dark:bg-[#1d2125]">
          <h2 className="text-sm font-bold text-[#292a2e] dark:text-[#deebff] uppercase tracking-wide">
            Kết thúc {sprint.name}
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
            {/* Stats Overview */}
            <div className="bg-slate-50 dark:bg-[#22272b] p-4 rounded-md border border-slate-150 dark:border-[#353e47] space-y-2">
              <h3 className="text-xs font-bold text-[#292a2e] dark:text-[#deebff] uppercase tracking-wider">
                Tổng kết Sprint
              </h3>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-white dark:bg-[#1d2125] border border-slate-100 dark:border-[#2c3338] rounded">
                  <div className="text-lg font-bold text-slate-800 dark:text-slate-300">{totalTasks}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">Công việc</div>
                </div>
                <div className="p-2 bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30 rounded">
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">{completedTasks}</div>
                  <div className="text-[10px] text-green-600 dark:text-green-400 uppercase">Hoàn thành</div>
                </div>
                <div className="p-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded">
                  <div className="text-lg font-bold text-amber-600 dark:text-amber-400">{incompleteTasks}</div>
                  <div className="text-[10px] text-amber-600 dark:text-amber-400 uppercase">Dở dang</div>
                </div>
              </div>
            </div>

            {/* Actions for uncompleted tasks */}
            {incompleteTasks > 0 && (
              <div className="space-y-3">
                <p className="text-xs text-slate-600 dark:text-slate-350">
                  Sprint này còn <strong>{incompleteTasks}</strong> công việc chưa hoàn thành. Bạn muốn di chuyển chúng đi đâu?
                </p>

                <div className="space-y-2.5">
                  {/* Option 1: Backlog */}
                  <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-50 dark:hover:bg-[#22272b] rounded border border-transparent hover:border-slate-150 dark:hover:border-[#353e47] transition-all">
                    <input
                      type="radio"
                      name="uncompletedAction"
                      checked={action === "MoveToBacklog"}
                      onChange={() => setAction("MoveToBacklog")}
                      className="cursor-pointer text-[#1868db]"
                    />
                    <div className="text-xs">
                      <div className="font-semibold text-slate-800 dark:text-slate-300">Chuyển về Product Backlog</div>
                      <div className="text-[10px] text-slate-500">Các công việc dở dang sẽ bị rút khỏi bảng Kanban và đưa về Backlog.</div>
                    </div>
                  </label>

                  {/* Option 2: Next Sprint */}
                  <label className={`flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-50 dark:hover:bg-[#22272b] rounded border border-transparent hover:border-slate-150 dark:hover:border-[#353e47] transition-all ${futureSprints.length === 0 ? "opacity-50 pointer-events-none" : ""}`}>
                    <input
                      type="radio"
                      name="uncompletedAction"
                      disabled={futureSprints.length === 0}
                      checked={action === "MoveToNextSprint"}
                      onChange={() => setAction("MoveToNextSprint")}
                      className="cursor-pointer text-[#1868db]"
                    />
                    <div className="text-xs flex-1">
                      <div className="font-semibold text-slate-800 dark:text-slate-300">
                        Chuyển sang Sprint tiếp theo {futureSprints.length === 0 && "(Chưa có Sprint tiếp theo)"}
                      </div>
                      <div className="text-[10px] text-slate-500">Các công việc dở dang sẽ được đẩy thẳng sang một Sprint đã lên kế hoạch.</div>
                    </div>
                  </label>
                </div>

                {/* Dropdown selection for Next Sprint */}
                {action === "MoveToNextSprint" && futureSprints.length > 0 && (
                  <div className="space-y-1 pl-6">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      Chọn Sprint đích
                    </label>
                    <select
                      value={moveToSprintId}
                      onChange={(e) => setMoveToSprintId(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 dark:border-[#353e47] rounded-[4px] bg-white dark:bg-[#22272b] text-[#292a2e] dark:text-[#deebff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1868db] dark:focus-visible:ring-[#579dff] focus-visible:border-transparent cursor-pointer"
                    >
                      {futureSprints.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.taskCount} công việc)
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {incompleteTasks === 0 && (
              <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                Tuyệt vời! Tất cả công việc trong Sprint này đã hoàn thành. Bạn có thể tiến hành kết thúc Sprint.
              </p>
            )}
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
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-2 rounded-[4px] cursor-pointer transition-colors flex items-center gap-1.5 disabled:opacity-75"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Đang kết thúc...</span>
                </>
              ) : (
                <span>Kết thúc Sprint</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
