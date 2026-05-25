"use client";

import * as React from "react";
import { BoardColumn } from "@/types/task";

interface WipLimitModalProps {
  isOpen: boolean;
  column: BoardColumn | null;
  onClose: () => void;
  onSave: (limit: number | null) => Promise<void>;
}

export function WipLimitModal({
  isOpen,
  column,
  onClose,
  onSave,
}: WipLimitModalProps) {
  const [wipLimitInput, setWipLimitInput] = React.useState<string>("");

  React.useEffect(() => {
    if (isOpen && column) {
      setWipLimitInput(column.wipLimit ? String(column.wipLimit) : "");
    }
  }, [isOpen, column]);

  if (!isOpen || !column) return null;

  const handleSave = () => {
    const limit = wipLimitInput.trim() === "" ? null : parseInt(wipLimitInput, 10);
    if (limit !== null && (isNaN(limit) || limit < 0)) {
      alert("Giới hạn WIP phải là số lớn hơn hoặc bằng 0.");
      return;
    }
    onSave(limit === 0 ? null : limit);
  };

  return (
    <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none animate-in fade-in duration-200">
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xl w-full max-w-sm overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-sm font-bold text-[#292a2e] uppercase tracking-wide">
            Thiết đặt WIP: {column.name}
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
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#6b6e76] uppercase tracking-wider block">
              Giới hạn công việc (WIP Limit)
            </label>
            <input
              type="number"
              value={wipLimitInput}
              onChange={(e) => setWipLimitInput(e.target.value)}
              placeholder="Không giới hạn"
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-[4px] bg-white text-[#292a2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1868db] focus-visible:border-transparent transition-all"
              min="0"
              autoFocus
            />
            <p className="text-[10px] text-slate-500 italic mt-1">
              Nhập số lớn hơn 0 để giới hạn, hoặc bỏ trống/nhập 0 để không giới hạn.
            </p>
          </div>
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
            onClick={handleSave}
            className="bg-[#1868db] hover:bg-[#0052cc] text-white text-xs font-bold px-3 py-2 rounded-[4px] cursor-pointer transition-colors"
          >
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
}
