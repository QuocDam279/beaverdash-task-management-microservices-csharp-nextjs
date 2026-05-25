"use client";

import * as React from "react";

import { api } from "@/lib/api";

/** Props for DeleteTeamButton */
interface DeleteTeamButtonProps {
  teamId: string;
  teamName: string;
  hasProjects: boolean;
  onDeleted: () => void;
}

/**
 * Nút xóa nhóm có xác nhận trước khi xóa.
 * Hiển thị cảnh báo nếu nhóm đang có dự án (ngăn xóa).
 * Gọi DELETE /api/teams/{id} khi xác nhận.
 */
export default function DeleteTeamButton({
  teamId,
  teamName,
  hasProjects,
  onDeleted,
}: DeleteTeamButtonProps) {
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setError(null);
      await api.delete(`/teams/${teamId}`);
      onDeleted();
    } catch (err: any) {
      console.error("Failed to delete team:", err);
      setError(err.message || "Xóa nhóm thất bại.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsConfirmOpen(true)}
        title="Xóa nhóm"
        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-[4px] transition-all cursor-pointer inline-flex items-center justify-center border border-transparent hover:border-red-200 gap-1.5 text-xs font-bold"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      </button>

      {/* Confirmation Dialog */}
      {isConfirmOpen && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xl w-full max-w-sm animate-in fade-in duration-200 overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-200 bg-red-50/50">
              <h2 className="text-xs font-bold text-red-700 uppercase tracking-wide flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                Xác nhận xóa nhóm
              </h2>
            </div>

            {/* Content */}
            <div className="p-5 space-y-3">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold px-3 py-2 rounded-[4px]">
                  {error}
                </div>
              )}

              {hasProjects ? (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs px-3 py-2.5 rounded-[4px] leading-relaxed">
                  <span className="font-bold block mb-1">Không thể xóa nhóm!</span>
                  Nhóm <strong>&quot;{teamName}&quot;</strong> đang chứa dự án.
                  Vui lòng xóa hoặc chuyển tất cả dự án sang nhóm khác trước khi xóa nhóm này.
                </div>
              ) : (
                <p className="text-xs text-[#505258] leading-relaxed">
                  Bạn có chắc chắn muốn xóa nhóm <strong>&quot;{teamName}&quot;</strong>?
                  Hành động này không thể hoàn tác. Tất cả thành viên sẽ bị xóa khỏi nhóm.
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50/50 flex justify-end gap-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => { setIsConfirmOpen(false); setError(null); }}
                className="bg-transparent hover:bg-slate-100 text-[#505258] text-xs font-bold px-3 py-2 rounded-[4px] border border-slate-200 cursor-pointer transition-colors disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              {!hasProjects && (
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-2 rounded-[4px] cursor-pointer transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isDeleting && (
                    <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                  {isDeleting ? "Đang xóa..." : "Xóa nhóm"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
