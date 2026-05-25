"use client";

import * as React from "react";
import { BoardColumn, TaskItem } from "@/types/task";

interface DeleteColumnModalProps {
  isOpen: boolean;
  column: BoardColumn | null;
  tasks: TaskItem[];
  allColumns: BoardColumn[];
  onClose: () => void;
  onConfirm: (targetColumnId?: string) => Promise<void>;
}

export function DeleteColumnModal({
  isOpen,
  column,
  tasks,
  allColumns,
  onClose,
  onConfirm,
}: DeleteColumnModalProps) {
  const [migrationTargetId, setMigrationTargetId] = React.useState<string>("");

  const colTasks = React.useMemo(() => {
    if (!column) return [];
    return tasks.filter((t) => t.boardColumnId === column.id);
  }, [column, tasks]);

  const migrationOptions = React.useMemo(() => {
    if (!column) return [];
    const index = allColumns.findIndex((c) => c.id === column.id);
    if (index === -1) return [];
    const options = [];
    if (index > 0) {
      options.push({
        direction: "left",
        column: allColumns[index - 1],
      });
    }
    if (index < allColumns.length - 1) {
      options.push({
        direction: "right",
        column: allColumns[index + 1],
      });
    }
    return options;
  }, [column, allColumns]);

  React.useEffect(() => {
    if (isOpen && colTasks.length > 0 && migrationOptions.length > 0) {
      setMigrationTargetId(migrationOptions[0].column.id);
    } else {
      setMigrationTargetId("");
    }
  }, [isOpen, colTasks, migrationOptions]);

  if (!isOpen || !column) return null;

  const handleConfirm = () => {
    if (colTasks.length > 0 && !migrationTargetId) {
      return;
    }
    onConfirm(colTasks.length > 0 ? migrationTargetId : undefined);
  };

  const isOnlyColumnWithTasks = colTasks.length > 0 && migrationOptions.length === 0;

  return (
    <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none animate-in fade-in duration-200">
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-sm font-bold text-[#292a2e] uppercase tracking-wide">
            Xóa cột: {column.name}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5 rounded hover:bg-slate-100 border-0 bg-transparent"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {colTasks.length === 0 ? (
            <p className="text-xs text-[#292a2e] leading-relaxed">
              Bạn có chắc chắn muốn xóa cột <strong className="font-semibold">{column.name}</strong> không? Hành động này không thể hoàn tác.
            </p>
          ) : isOnlyColumnWithTasks ? (
            <div className="space-y-3">
              <p className="text-xs text-red-600 font-semibold leading-relaxed">
                Không thể xóa cột vì đây là cột duy nhất có chứa công việc và không có cột khác để di chuyển.
              </p>
              <p className="text-[11px] text-slate-500">
                Vui lòng tạo thêm một cột khác hoặc xóa hết các công việc trong cột này trước khi thực hiện.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-[#292a2e] leading-relaxed">
                Cột <strong className="font-semibold">{column.name}</strong> hiện đang chứa <strong className="text-[#1868db]">{colTasks.length} công việc</strong>. Vui lòng chọn cột tiếp nhận trước khi xóa:
              </p>

              <div className="space-y-2">
                {migrationOptions.map((opt) => (
                  <label
                    key={opt.column.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      migrationTargetId === opt.column.id
                        ? "border-[#1868db] bg-[#1868db]/5 text-[#1868db]"
                        : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="migration-target"
                      checked={migrationTargetId === opt.column.id}
                      onChange={() => setMigrationTargetId(opt.column.id)}
                      className="h-4 w-4 accent-[#1868db]"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">
                        Di chuyển sang cột bên {opt.direction === "left" ? "trái" : "phải"} ({opt.column.name})
                      </p>
                      {opt.column.isDone && (
                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200 mt-0.5 inline-block">
                          Cột hoàn thành
                        </span>
                      )}
                    </div>
                  </label>
                ))}
              </div>

              {column.isDone && (
                <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-250 p-2.5 rounded mt-3">
                  <strong>Lưu ý:</strong> Cột bị xóa là cột hoàn thành (Done). Thuộc tính hoàn thành sẽ tự động được chuyển sang cột tiếp nhận được chọn.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50/50 flex justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="bg-transparent hover:bg-slate-100 text-[#505258] text-xs font-bold px-3 py-2 rounded-[4px] border border-slate-200 cursor-pointer transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            disabled={colTasks.length > 0 && (!migrationTargetId || isOnlyColumnWithTasks)}
            onClick={handleConfirm}
            className="bg-red-600 hover:bg-red-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold px-3 py-2 rounded-[4px] cursor-pointer transition-colors disabled:cursor-not-allowed border-0"
          >
            Xác nhận xóa
          </button>
        </div>
      </div>
    </div>
  );
}
