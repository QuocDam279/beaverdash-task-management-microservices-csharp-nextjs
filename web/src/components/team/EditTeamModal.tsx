"use client";

import * as React from "react";

import { api } from "@/lib/api";

/** Props for EditTeamModal */
interface EditTeamModalProps {
  teamId: string;
  currentName: string;
  currentDescription: string;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Modal cho phép chỉnh sửa tên và mô tả nhóm.
 * Gọi PUT /api/teams/{id} khi submit.
 */
export default function EditTeamModal({
  teamId,
  currentName,
  currentDescription,
  onClose,
  onSuccess,
}: EditTeamModalProps) {
  const [name, setName] = React.useState(currentName);
  const [description, setDescription] = React.useState(currentDescription);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Tên nhóm không được để trống.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await api.put(`/teams/${teamId}`, {
        name: name.trim(),
        description: description.trim() || null,
      });
      onSuccess();
    } catch (err: any) {
      console.error("Failed to update team:", err);
      setError(err.message || "Cập nhật nhóm thất bại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xl w-full max-w-md animate-in fade-in duration-200 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xs font-bold text-[#292a2e] uppercase tracking-wide">
            Chỉnh sửa nhóm
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
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold px-3 py-2 rounded-[4px]">
                {error}
              </div>
            )}

            {/* Name input */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#6b6e76] uppercase tracking-wider block">
                Tên nhóm <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                disabled={isSubmitting}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập tên nhóm..."
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-[4px] bg-white text-[#292a2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1868db] focus-visible:border-transparent transition-all disabled:opacity-60"
              />
            </div>

            {/* Description input */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#6b6e76] uppercase tracking-wider block">
                Mô tả
              </label>
              <textarea
                disabled={isSubmitting}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Nhập mô tả nhóm..."
                rows={3}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-[4px] bg-white text-[#292a2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1868db] focus-visible:border-transparent transition-all resize-none disabled:opacity-60"
              />
            </div>
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
              {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
