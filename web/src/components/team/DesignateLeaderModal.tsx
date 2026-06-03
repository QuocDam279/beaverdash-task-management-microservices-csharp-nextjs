"use client";

import * as React from "react";

interface DesignateLeaderModalProps {
  isOpen: boolean;
  members: any[];
  currentUserId: string;
  onClose: () => void;
  onConfirm: (selectedUserId: string) => void;
}

/**
 * Modal chỉ định Trưởng nhóm mới trước khi rời nhóm.
 */
export default function DesignateLeaderModal({
  isOpen,
  members,
  currentUserId,
  onClose,
  onConfirm,
}: DesignateLeaderModalProps) {
  const candidates = React.useMemo(() => {
    return members.filter((m) => m.userId !== currentUserId);
  }, [members, currentUserId]);

  const [selectedUserId, setSelectedUserId] = React.useState<string>("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (isOpen && candidates.length > 0) {
      setSelectedUserId(candidates[0].userId);
    }
  }, [isOpen, candidates]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;
    setIsSubmitting(true);
    onConfirm(selectedUserId);
  };

  return (
    <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xl w-full max-w-md animate-in fade-in duration-200 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xs font-bold text-[#292a2e] uppercase tracking-wide">
            Chỉ định Trưởng nhóm mới
          </h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5 rounded hover:bg-slate-100 disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-5 space-y-4">
            <p className="text-xs text-[#505258] leading-relaxed">
              Bạn là Trưởng nhóm. Trước khi rời khỏi nhóm làm việc này, bạn bắt buộc phải chỉ định một thành viên khác lên làm Trưởng nhóm mới để tiếp quản quản lý dự án.
            </p>

            {candidates.length === 0 ? (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold px-3 py-2.5 rounded-[4px] leading-relaxed">
                ⚠️ Không có thành viên nào khác trong nhóm để bàn giao. Vui lòng giải tán nhóm bằng chức năng xóa nhóm nếu muốn rời đi.
              </div>
            ) : (
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#6b6e76] uppercase tracking-wider block">
                  Chọn Trưởng nhóm mới <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  disabled={isSubmitting}
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-[4px] bg-white text-[#292a2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1868db] focus-visible:border-transparent transition-all disabled:opacity-60 cursor-pointer"
                >
                  {candidates.map((member) => (
                    <option key={member.userId} value={member.userId}>
                      {member.displayName} ({member.email})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-slate-200 bg-slate-50/50 flex justify-end gap-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="bg-transparent hover:bg-slate-100 text-[#505258] text-xs font-bold px-3 py-2 rounded-[4px] border border-slate-200 cursor-pointer transition-colors disabled:opacity-50"
            >
              Hủy bỏ
            </button>
            {candidates.length > 0 && (
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#1868db] hover:bg-[#0052cc] text-white text-xs font-bold px-3 py-2 rounded-[4px] cursor-pointer transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSubmitting && (
                  <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                Xác nhận & Rời nhóm
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
