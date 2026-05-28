"use client";

import * as React from "react";
import { api } from "@/lib/api";
import { useAlertConfirm } from "@/components/providers/AlertConfirmProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import EmailListInput from "@/components/ui/EmailListInput";

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Modal tạo nhóm làm việc mới và thêm các thành viên ban đầu.
 */
export default function CreateTeamModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateTeamModalProps) {
  const { alert } = useAlertConfirm();
  const { user: currentUser } = useAuth();

  const [newTeamName, setNewTeamName] = React.useState("");
  const [newTeamDesc, setNewTeamDesc] = React.useState("");
  const [newTeamEmails, setNewTeamEmails] = React.useState<string[]>([]);
  const [isCreating, setIsCreating] = React.useState(false);

  const handleValidateEmail = async (email: string): Promise<string | null> => {
    if (email === currentUser?.email?.toLowerCase()) {
      return "Bạn không thể thêm chính mình vào danh sách.";
    }
    try {
      const user = await api.get(`/users?email=${encodeURIComponent(email)}`);
      if (!user || !user.id) {
        return "Không tìm thấy người dùng này trong hệ thống.";
      }
      return null;
    } catch (err) {
      return "Không tìm thấy người dùng này trong hệ thống.";
    }
  };

  if (!isOpen) return null;

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    try {
      setIsCreating(true);

      // 1. Create team
      const res = await api.post("/teams", {
        name: newTeamName.trim(),
        description: newTeamDesc.trim() || null,
      });

      const teamId = res.id;

      // 2. Add initial members if any emails are provided
      if (newTeamEmails.length > 0 && teamId) {
        const failedEmails: string[] = [];
        for (const email of newTeamEmails) {
          try {
            // Find user in IdentityService
            const user = await api.get(`/users?email=${encodeURIComponent(email)}`);
            if (user && user.id) {
              // Add to team
              await api.post(`/teams/${teamId}/members`, {
                userId: user.id,
              });
            } else {
              failedEmails.push(email);
            }
          } catch (memberErr) {
            console.error(`Failed to add user with email ${email}:`, memberErr);
            failedEmails.push(email);
          }
        }

        if (failedEmails.length > 0) {
          alert(
            `Đã tạo nhóm thành công, nhưng không thể thêm một số thành viên: ${failedEmails.join(
              ", "
            )}. Vui lòng kiểm tra lại email của họ.`,
            "Cảnh báo",
            "warning"
          );
        }
      }

      // Reset and Close
      setNewTeamName("");
      setNewTeamDesc("");
      setNewTeamEmails([]);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Failed to create team:", err);
      alert(err.message || "Tạo nhóm thất bại.", "Thất bại", "danger");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xl w-full max-w-md animate-in fade-in duration-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-sm font-bold text-[#292a2e] uppercase tracking-wide">
            Tạo nhóm làm việc mới
          </h2>
          <button
            onClick={onClose}
            disabled={isCreating}
            className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5 rounded hover:bg-slate-100 disabled:opacity-50"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleCreateTeam}>
          <div className="p-5 space-y-4">
            {/* Team Name */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#6b6e76] uppercase tracking-wider block">
                Tên nhóm <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                disabled={isCreating}
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="Ví dụ: Nhóm Thiết kế Figma, Nhóm Frontend..."
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-[4px] bg-white text-[#292a2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1868db] focus-visible:border-transparent transition-all disabled:opacity-60"
              />
            </div>

            {/* Team Description */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#6b6e76] uppercase tracking-wider block">
                Mô tả ngắn
              </label>
              <textarea
                rows={3}
                disabled={isCreating}
                value={newTeamDesc}
                onChange={(e) => setNewTeamDesc(e.target.value)}
                placeholder="Mô tả mục tiêu hoạt động hoặc phân công chung của nhóm..."
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-[4px] bg-white text-[#292a2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1868db] focus-visible:border-transparent transition-all resize-none disabled:opacity-60"
              />
            </div>

            {/* Select Initial Members */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#6b6e76] uppercase tracking-wider block">
                Thêm thành viên ban đầu
              </label>
              <EmailListInput
                emails={newTeamEmails}
                onChange={setNewTeamEmails}
                disabled={isCreating}
                onValidateEmail={handleValidateEmail}
                placeholder="Nhập email thành viên, nhấn Enter hoặc click icon để thêm..."
              />
            </div>
          </div>

          <div className="px-5 py-3 border-t border-slate-200 bg-slate-50/50 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isCreating}
              className="bg-transparent hover:bg-slate-100 text-[#505258] text-xs font-bold px-3 py-2 rounded-[4px] border border-slate-200 cursor-pointer transition-colors disabled:opacity-50"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="bg-[#1868db] hover:bg-[#0052cc] text-white text-xs font-bold px-3 py-2 rounded-[4px] cursor-pointer transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {isCreating && (
                <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              {isCreating ? "Đang xử lý..." : "Tạo nhóm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
