"use client";

import * as React from "react";
import { Avatar } from "@/components/ui/Avatar";
import { api } from "@/lib/api";
import { useAlertConfirm } from "@/components/providers/AlertConfirmProvider";

/** Props for TeamMembersTable */
interface TeamMembersTableProps {
  teamId: string;
  members: any[];
  currentUserId: string | undefined;
  isOwnerOrAdmin: boolean;
  onMemberRemoved: () => void;
  onAddMemberClick: () => void;
}

/**
 * Bảng hiển thị danh sách thành viên trong nhóm.
 * Cho phép Owner/Admin thêm hoặc xóa thành viên.
 */
export default function TeamMembersTable({
  teamId,
  members,
  currentUserId,
  isOwnerOrAdmin,
  onMemberRemoved,
  onAddMemberClick,
}: TeamMembersTableProps) {
  const { alert, confirm } = useAlertConfirm();

  const handleRemoveMember = async (userId: string) => {
    if (userId === currentUserId) {
      alert("Bạn không thể tự xóa chính mình khỏi nhóm!", "Cảnh báo", "warning");
      return;
    }

    const confirmDelete = await confirm("Bạn có chắc chắn muốn xóa thành viên này khỏi nhóm?", {
      title: "Xóa thành viên khỏi nhóm",
      confirmLabel: "Xóa thành viên",
      variant: "danger",
    });
    if (!confirmDelete) return;

    try {
      await api.delete(`/teams/${teamId}/members/${userId}`);
      onMemberRemoved();
    } catch (err: any) {
      console.error("Failed to remove member:", err);
      alert(err.message || "Xóa thành viên thất bại.", "Thất bại", "danger");
    }
  };

  const renderRoleBadge = (role: string) => {
    switch (role) {
      case "Owner":
      case "leader":
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
            Trưởng nhóm
          </span>
        );
      case "Member":
      case "member":
      default:
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
            Thành viên
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 max-w-4xl">
      {/* Header */}
      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
        <h2 className="text-sm font-bold text-[#292a2e] uppercase tracking-wide">
          Thành viên trong nhóm
        </h2>
        {isOwnerOrAdmin && (
          <button
            onClick={onAddMemberClick}
            className="bg-[#1868db] hover:bg-[#0052cc] text-white text-xs font-bold px-3 py-1.5 rounded-[4px] transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Thêm thành viên
          </button>
        )}
      </div>

      {/* Table */}
      <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[#6b6e76] text-[10px] font-bold uppercase tracking-wider">
              <th className="px-5 py-3">Thành viên</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Vai trò</th>
              {isOwnerOrAdmin && <th className="px-5 py-3 text-right">Hành động</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {members.map((member) => (
              <tr
                key={member.userId}
                className="hover:bg-slate-50/70 transition-colors text-xs text-[#292a2e]"
              >
                <td className="px-5 py-3.5 flex items-center gap-3 font-semibold">
                  <Avatar
                    src={member.avatar}
                    alt={member.displayName}
                    className="h-8 w-8 rounded-full border border-slate-200 object-cover"
                  />
                  <span>
                    {member.displayName}{" "}
                    {member.userId === currentUserId && (
                      <span className="text-[10px] text-slate-400 font-normal italic">(Bạn)</span>
                    )}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-slate-500 font-medium">{member.email}</td>
                <td className="px-5 py-3.5">{renderRoleBadge(member.role)}</td>
                {isOwnerOrAdmin && (
                  <td className="px-5 py-3.5 text-right">
                    {member.userId !== currentUserId && member.role !== "Owner" && member.role !== "leader" ? (
                      <button
                        onClick={() => handleRemoveMember(member.userId)}
                        title="Xóa khỏi nhóm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded transition-all cursor-pointer inline-flex items-center justify-center border border-transparent hover:border-red-200"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    ) : (
                      <span className="text-slate-400 text-[10px] italic">Không khả dụng</span>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
