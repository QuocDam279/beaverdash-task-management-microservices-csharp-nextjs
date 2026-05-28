"use client";

import * as React from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/components/providers/AuthProvider";
import EmailListInput from "@/components/ui/EmailListInput";
import AddMemberResults, { MemberAddResult } from "./AddMemberResults";

interface AddMemberModalProps {
  teamId: string;
  existingMemberIds: string[];
  onClose: () => void;
  onSuccess: () => void;
}

/** Modal thêm thành viên vào nhóm bằng danh sách email. */
export default function AddMemberModal({
  teamId,
  existingMemberIds,
  onClose,
  onSuccess,
}: AddMemberModalProps) {
  const { user: currentUser } = useAuth();
  const [emails, setEmails] = React.useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [results, setResults] = React.useState<MemberAddResult[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleValidateEmail = async (email: string): Promise<string | null> => {
    if (email === currentUser?.email?.toLowerCase()) {
      return "Bạn không thể thêm chính mình vào danh sách.";
    }
    try {
      const user = await api.get(`/users?email=${encodeURIComponent(email)}`);
      if (!user || !user.id) return "Không tìm thấy người dùng này trong hệ thống.";
      if (existingMemberIds.includes(user.id)) return "Người dùng này đã là thành viên của nhóm.";
      return null;
    } catch {
      return "Không tìm thấy người dùng này trong hệ thống.";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (emails.length === 0) return;
    try {
      setIsSubmitting(true);
      setError(null);
      setResults(null);
      const batchResults: MemberAddResult[] = [];
      let successCount = 0;

      for (const email of emails) {
        try {
          const user = await api.get(`/users?email=${encodeURIComponent(email)}`);
          if (!user || !user.id) {
            batchResults.push({ email, success: false, message: "Không tìm thấy người dùng này." });
            continue;
          }
          if (existingMemberIds.includes(user.id)) {
            batchResults.push({ email, success: false, message: "Đã là thành viên." });
            continue;
          }
          await api.post(`/teams/${teamId}/members`, { userId: user.id });
          batchResults.push({ email, success: true, message: "Thêm thành công." });
          successCount++;
        } catch (err: any) {
          console.error(`Failed to add user with email ${email}:`, err);
          batchResults.push({ email, success: false, message: err.message || "Lỗi hệ thống." });
        }
      }

      setResults(batchResults);
      if (successCount > 0) onSuccess();
      const hasErrors = batchResults.some((r) => !r.success);
      if (!hasErrors) onClose();
    } catch (err: any) {
      console.error("Failed to process add members:", err);
      setError("Đã xảy ra lỗi trong quá trình xử lý.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xl w-full max-w-md animate-in fade-in duration-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-sm font-bold text-[#292a2e] uppercase tracking-wide">
            Thêm thành viên vào nhóm
          </h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5 rounded hover:bg-slate-100 disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-5 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold px-3 py-2 rounded-[4px]">
                {error}
              </div>
            )}
            {!results ? (
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#6b6e76] uppercase tracking-wider block">
                  Danh sách email thành viên <span className="text-red-500">*</span>
                </label>
                <EmailListInput
                  emails={emails}
                  onChange={setEmails}
                  disabled={isSubmitting}
                  onValidateEmail={handleValidateEmail}
                  placeholder="Nhập email, nhấn Enter hoặc click icon để thêm..."
                />
                <p className="text-[10px] text-slate-400 mt-2">
                  Thành viên sẽ được thêm vào nhóm với vai trò &quot;Thành viên&quot;.
                </p>
              </div>
            ) : (
              <AddMemberResults results={results} />
            )}
          </div>

          <div className="px-5 py-3 border-t border-slate-200 bg-slate-50/50 flex justify-end gap-2">
            {!results ? (
              <>
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
                  disabled={isSubmitting || emails.length === 0}
                  className="bg-[#1868db] hover:bg-[#0052cc] text-white text-xs font-bold px-3 py-2 rounded-[4px] cursor-pointer transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmitting && (
                    <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                  {isSubmitting ? "Đang xử lý..." : "Thêm vào nhóm"}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="bg-[#1868db] hover:bg-[#0052cc] text-white text-xs font-bold px-4 py-2 rounded-[4px] cursor-pointer transition-colors"
              >
                Đóng
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
