"use client";

import * as React from "react";
import { api } from "@/lib/api";
import { useAlertConfirm } from "@/components/providers/AlertConfirmProvider";

interface ShareProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: any;
  onProjectUpdated: () => void;
}

export function ShareProjectModal({
  isOpen,
  onClose,
  project,
  onProjectUpdated,
}: ShareProjectModalProps) {
  const { alert } = useAlertConfirm();
  const [isPublic, setIsPublic] = React.useState(false);
  const [shareToken, setShareToken] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (isOpen && project) {
      setIsPublic(project.isPublic || false);
      setShareToken(project.shareToken || null);
    }
  }, [isOpen, project]);

  if (!isOpen) return null;

  const handleToggleShare = async () => {
    try {
      setIsSubmitting(true);
      const newStatus = !isPublic;

      const result = await api.patch(`/projects/${project.id}`, {
        isPublic: newStatus,
      });

      if (result) {
        setIsPublic(result.isPublic);
        setShareToken(result.shareToken);
        onProjectUpdated();
      }
    } catch (err: any) {
      console.error("Failed to toggle project share status:", err);
      alert(
        err.message || "Đã xảy ra lỗi khi cập nhật trạng thái chia sẻ.",
        "Thất bại",
        "danger"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getShareUrl = () => {
    if (!shareToken) return "";
    if (typeof window !== "undefined") {
      return `${window.location.origin}/shared/projects/${shareToken}`;
    }
    return `/shared/projects/${shareToken}`;
  };

  const handleCopyLink = () => {
    const url = getShareUrl();
    if (!url) return;

    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none">
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xl w-full max-w-md animate-in fade-in duration-200 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-sm font-bold text-[#292a2e] uppercase tracking-wide flex items-center gap-1.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#1868db]">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            Chia sẻ dự án
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5 rounded hover:bg-slate-100"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status and Toggle */}
          <div className="flex items-center justify-between bg-slate-50 border border-slate-200/60 p-4 rounded-lg">
            <div>
              <p className="text-xs font-bold text-[#292a2e]">Liên kết chia sẻ công khai</p>
              <p className="text-[11px] text-[#6b6e76] mt-0.5 leading-relaxed">
                Cho phép bất cứ ai có liên kết truy cập xem dự án này.
              </p>
            </div>
            
            {/* Toggle switch */}
            <button
              onClick={handleToggleShare}
              disabled={isSubmitting}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
                isPublic ? "bg-[#1868db]" : "bg-slate-200"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  isPublic ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {isPublic && shareToken ? (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#6b6e76] uppercase tracking-wider block">
                  Đường dẫn liên kết dự án
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={getShareUrl()}
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-350 bg-slate-50/50 text-slate-700 rounded-[4px] focus:outline-none select-all"
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`px-3 py-1.5 text-xs font-bold rounded-[4px] transition-all cursor-pointer border flex items-center gap-1 shrink-0 ${
                      copied
                        ? "bg-emerald-50 border-emerald-300 text-emerald-600"
                        : "bg-[#1868db] border-transparent text-white hover:bg-[#0052cc]"
                    }`}
                  >
                    {copied ? (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Đã chép
                      </>
                    ) : (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                        Sao chép
                      </>
                    )}
                  </button>
                </div>
              </div>
              <div className="bg-blue-50/50 border border-blue-200/50 rounded-lg p-3 flex gap-2">
                <span className="text-blue-500 scale-110">ℹ️</span>
                <span className="text-[10px] text-blue-800/80 leading-relaxed font-semibold">
                  Người khác nhận được liên kết này sẽ có quyền xem dự án (bao gồm bảng, danh sách, lịch, gantt, công việc con) mà không cần tạo tài khoản hay đăng nhập.
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-slate-400 border border-dashed border-slate-200 rounded-lg bg-slate-50/30">
              <span className="text-2xl">🔒</span>
              <p className="text-xs font-bold mt-2 text-[#292a2e]">Dự án đang ở chế độ riêng tư</p>
              <p className="text-[10px] text-slate-500 mt-1 max-w-[280px] mx-auto leading-normal">
                Bật tính năng chia sẻ ở trên để tạo liên kết truy cập công khai.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="bg-transparent hover:bg-slate-100 text-[#505258] text-xs font-bold px-4 py-2 rounded-[4px] border border-slate-200 cursor-pointer transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
