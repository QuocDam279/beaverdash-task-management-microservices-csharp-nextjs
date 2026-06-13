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
  
  // Shared email list states
  const [shares, setShares] = React.useState<any[]>([]);
  const [emailInput, setEmailInput] = React.useState("");
  const [isSharing, setIsSharing] = React.useState(false);

  const fetchShares = React.useCallback(async () => {
    if (!project) return;
    try {
      const data = await api.get(`/projects/${project.id}/shares`);
      setShares(data || []);
    } catch (err) {
      console.error("Failed to load project shares:", err);
    }
  }, [project]);

  React.useEffect(() => {
    if (isOpen && project) {
      setIsPublic(project.isPublic || false);
      setShareToken(project.shareToken || null);
      fetchShares();
    }
  }, [isOpen, project, fetchShares]);

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

  const handleShareByEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    try {
      setIsSharing(true);
      const result = await api.post(`/projects/${project.id}/share`, {
        email: emailInput.trim(),
      });
      if (result) {
        setEmailInput("");
        fetchShares();
        onProjectUpdated();
        // Cập nhật lại token nếu đây là lần đầu bật chia sẻ
        if (!shareToken) {
          const updated = await api.get(`/projects/${project.id}/overview`);
          if (updated) {
            setShareToken(updated.shareToken);
            setIsPublic(updated.isPublic);
          }
        }
      }
    } catch (err: any) {
      console.error("Failed to share project:", err);
      alert(
        err.message || "Đã xảy ra lỗi khi chia sẻ dự án.",
        "Thất bại",
        "danger"
      );
    } finally {
      setIsSharing(false);
    }
  };

  const handleRevokeShare = async (email: string) => {
    try {
      const result = await api.delete(`/projects/${project.id}/share?email=${encodeURIComponent(email)}`);
      if (result) {
        fetchShares();
      }
    } catch (err: any) {
      console.error("Failed to revoke project share:", err);
      alert(
        err.message || "Đã xảy ra lỗi khi thu hồi chia sẻ.",
        "Thất bại",
        "danger"
      );
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
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xl w-full max-w-md animate-in fade-in duration-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50 shrink-0">
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
        <div className="p-6 space-y-5 overflow-y-auto flex-1 custom-chat-scrollbar">
          {/* Status and Toggle */}
          <div className="flex items-center justify-between bg-slate-50 border border-slate-200/60 p-4 rounded-lg">
            <div>
              <p className="text-xs font-bold text-[#292a2e]">Bật liên kết chia sẻ dự án</p>
              <p className="text-[11px] text-[#6b6e76] mt-0.5 leading-relaxed">
                Cho phép người dùng được chỉ định truy cập xem dự án này qua liên kết.
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
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Form invite email */}
              <form onSubmit={handleShareByEmail} className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#6b6e76] uppercase tracking-wider block">
                  Chia sẻ với thành viên khác (nhập email)
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="example@gmail.com"
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-[4px] focus:outline-none focus:border-[#1868db] bg-white text-slate-700"
                  />
                  <button
                    type="submit"
                    disabled={isSharing}
                    className="px-4 py-1.5 text-xs font-bold bg-[#1868db] hover:bg-[#0052cc] text-white rounded-[4px] transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1 shrink-0"
                  >
                    {isSharing ? (
                      <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Chia sẻ
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Warning box */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2">
                <span className="text-amber-500 scale-110">⚠️</span>
                <span className="text-[10px] text-amber-800 leading-relaxed font-semibold">
                  Người nhận sẽ nhận được email mời. Họ bắt buộc phải đăng nhập vào hệ thống bằng đúng email này (tài khoản Google tương ứng) để xem dự án.
                </span>
              </div>

              {/* Share url */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#6b6e76] uppercase tracking-wider block">
                  Đường dẫn liên kết dự án
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={getShareUrl()}
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-200 bg-slate-50/50 text-slate-500 rounded-[4px] focus:outline-none select-all"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className={`px-3 py-1.5 text-xs font-bold rounded-[4px] transition-all cursor-pointer border flex items-center gap-1 shrink-0 ${
                      copied
                        ? "bg-emerald-50 border-emerald-300 text-emerald-600"
                        : "bg-white border-slate-350 hover:bg-slate-50 text-[#505258]"
                    }`}
                  >
                    {copied ? "Đã chép" : "Sao chép"}
                  </button>
                </div>
              </div>

              {/* Shared users list */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#6b6e76] uppercase tracking-wider block">
                  Thành viên được chia sẻ ({shares.length})
                </label>
                <div className="border border-slate-100 rounded-lg divide-y divide-slate-100 max-h-[160px] overflow-y-auto custom-chat-scrollbar">
                  {shares.length > 0 ? (
                    shares.map((share) => (
                      <div key={share.id} className="px-3 py-2 flex items-center justify-between gap-3 bg-white hover:bg-slate-50/30 transition-colors">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="h-6 w-6 rounded-full bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center font-bold text-[10px] uppercase shrink-0">
                            {share.recipientEmail.substring(0, 2)}
                          </div>
                          <span className="text-xs text-[#292a2e] font-semibold truncate select-all">{share.recipientEmail}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRevokeShare(share.recipientEmail)}
                          className="text-[10px] text-red-500 hover:text-red-700 font-bold hover:bg-red-50 px-2 py-1 rounded transition-colors cursor-pointer"
                        >
                          Thu hồi
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-[11px] text-slate-400 italic">
                      Chưa có ai được chia sẻ dự án này.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 border border-dashed border-slate-200 rounded-lg bg-slate-50/30">
              <span className="text-2xl">🔒</span>
              <p className="text-xs font-bold mt-2 text-[#292a2e]">Dự án đang ở chế độ riêng tư</p>
              <p className="text-[10px] text-slate-500 mt-1 max-w-[280px] mx-auto leading-normal">
                Bật tính năng chia sẻ ở trên để thiết lập các quyền và nhận liên kết chia sẻ dự án.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50/50 flex justify-end shrink-0">
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
