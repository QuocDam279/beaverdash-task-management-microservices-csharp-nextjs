"use client";

import * as React from "react";
import { api } from "@/lib/api";
import { useAlertConfirm } from "@/components/providers/AlertConfirmProvider";
import { Avatar } from "@/components/ui/Avatar";

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
      fetchShares();
    }
  }, [isOpen, project, fetchShares]);

  if (!isOpen) return null;

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

          {/* Shared users list */}
          <div className="space-y-2 pt-2">
            <label className="text-[11px] font-bold text-[#6b6e76] uppercase tracking-wider block">
              Thành viên được chia sẻ ({shares.length})
            </label>
            <div className="border border-slate-100 rounded-lg divide-y divide-slate-100 max-h-[220px] overflow-y-auto custom-chat-scrollbar">
              {shares.length > 0 ? (
                shares.map((share) => (
                  <div key={share.id} className="px-3 py-2 flex items-center justify-between gap-3 bg-white hover:bg-slate-50/30 transition-colors">
                    <div className="flex items-center gap-2 min-w-0">
                      {share.recipientAvatar ? (
                        <Avatar
                          src={share.recipientAvatar}
                          alt={share.recipientDisplayName || share.recipientEmail}
                          className="h-6 w-6 rounded-full border border-slate-100 shrink-0"
                        />
                      ) : (
                        <div className="h-6 w-6 rounded-full bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center font-bold text-[10px] uppercase shrink-0">
                          {share.recipientEmail.substring(0, 2)}
                        </div>
                      )}
                      <div className="flex flex-col min-w-0">
                        {share.recipientDisplayName && (
                          <span className="text-[11px] text-[#292a2e] font-bold truncate leading-tight">
                            {share.recipientDisplayName}
                          </span>
                        )}
                        <span className={`text-[10px] truncate select-all leading-normal ${share.recipientDisplayName ? "text-slate-500" : "text-[#292a2e] font-semibold"}`}>
                          {share.recipientEmail}
                        </span>
                      </div>
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
                <div className="text-center py-6 text-[11px] text-slate-400 italic">
                  Chưa có ai được chia sẻ dự án này.
                </div>
              )}
            </div>
          </div>
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
