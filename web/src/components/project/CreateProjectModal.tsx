"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Project } from "@/types/project";
import { api } from "@/lib/api";
import { useAlertConfirm } from "@/components/providers/AlertConfirmProvider";
import { useAuth } from "@/components/providers/AuthProvider";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: Project) => void;
}

export function CreateProjectModal({ isOpen, onClose, onProjectCreated }: CreateProjectModalProps) {
  const router = useRouter();
  const { alert } = useAlertConfirm();
  const { user: currentUser } = useAuth();
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [teamId, setTeamId] = React.useState<string>("");
  const [isPublic, setIsPublic] = React.useState(false);
  const [startDate, setStartDate] = React.useState("");
  const [dueDate, setDueDate] = React.useState("");
  const [teams, setTeams] = React.useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    const fetchTeams = async () => {
      try {
        const data = await api.get("/teams");
        const leaderTeams = (data || []).filter((t: any) => t.currentUserRole === "leader");
        setTeams(leaderTeams);
        if (leaderTeams.length > 0) {
          setTeamId(leaderTeams[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch teams for project creation:", err);
      }
    };
    if (isOpen) {
      fetchTeams();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (startDate && dueDate && new Date(startDate) > new Date(dueDate)) {
      alert("Ngày bắt đầu không thể lớn hơn ngày kết thúc.", "Thông báo", "warning");
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await api.post("/projects", {
        name: name.trim(),
        description: description.trim() || null,
        teamId: teamId || null,
        isPublic,
        startDate: startDate ? new Date(startDate).toISOString() : null,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      });

      if (result && result.id) {
        const newProject: Project = {
          id: result.id,
          teamId: teamId || null,
          name: name.trim(),
          description: description.trim() || null,
          status: "To Do",
          progress: 0,
          startDate: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
          dueDate: dueDate ? new Date(dueDate).toISOString() : null,
          isPublic,
          shareToken: null,
          createdByUserId: currentUser?.id || "", // populated by backend
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        onProjectCreated(newProject);
        
        // Reset state
        setName("");
        setDescription("");
        setTeamId("");
        setIsPublic(false);
        setStartDate("");
        setDueDate("");
        
        onClose();
        
        // Redirect to the new project
        router.push(`/projects/${newProject.id}`);
      }
    } catch (err: any) {
      console.error("Failed to create project:", err);
      alert(err.message || "Đã xảy ra lỗi khi tạo dự án.", "Thất bại", "danger");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xl w-full max-w-md animate-in fade-in duration-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-sm font-bold text-[#292a2e] uppercase tracking-wide">
            Tạo dự án mới
          </h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5 rounded hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
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

        <form onSubmit={handleSubmit}>
          <div className="p-5 space-y-4">
            {/* Tên dự án */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#6b6e76] uppercase tracking-wider block">
                Tên dự án <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                disabled={isSubmitting}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: Thiết kế Website, Marketing Q1..."
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-[4px] bg-white text-[#292a2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1868db] focus-visible:border-transparent transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-slate-50"
              />
            </div>

            {/* Mô tả dự án */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#6b6e76] uppercase tracking-wider block">
                Mô tả dự án
              </label>
              <textarea
                disabled={isSubmitting}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả ngắn gọn về mục tiêu, phạm vi hoặc yêu cầu của dự án..."
                rows={3}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-[4px] bg-white text-[#292a2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1868db] focus-visible:border-transparent transition-all resize-none disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-slate-50"
              />
            </div>

            {/* Thuộc nhóm */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#6b6e76] uppercase tracking-wider block">
                Thuộc nhóm làm việc <span className="text-red-500">*</span>
              </label>
              {teams.length > 0 ? (
                <select
                  value={teamId}
                  required
                  disabled={isSubmitting}
                  onChange={(e) => setTeamId(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-[4px] bg-white text-[#292a2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1868db] focus-visible:border-transparent transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-slate-50"
                >
                  <option value="" disabled>-- Chọn nhóm làm việc --</option>
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              ) : (
                <div className="text-[10px] text-amber-600 bg-amber-50 border border-amber-200 p-2.5 rounded-[4px] font-bold leading-normal">
                  ⚠️ Bạn cần là Trưởng nhóm (Leader) của ít nhất một nhóm để tạo dự án. Vui lòng tạo nhóm mới trước.
                </div>
              )}
            </div>

            {/* Ngày bắt đầu & Hạn chót */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#6b6e76] uppercase tracking-wider block">
                  Ngày bắt đầu
                </label>
                <input
                  type="date"
                  value={startDate}
                  disabled={isSubmitting}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-[4px] bg-white text-[#292a2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1868db] focus-visible:border-transparent transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-slate-50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#6b6e76] uppercase tracking-wider block">
                  Hạn chót
                </label>
                <input
                  type="date"
                  value={dueDate}
                  disabled={isSubmitting}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-[4px] bg-white text-[#292a2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1868db] focus-visible:border-transparent transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-slate-50"
                />
              </div>
            </div>
          </div>

          <div className="px-5 py-3 border-t border-slate-200 bg-slate-50/50 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="bg-transparent hover:bg-slate-100 text-[#505258] text-xs font-bold px-3 py-2 rounded-[4px] border border-slate-200 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting || teams.length === 0}
              className="bg-[#1868db] hover:bg-[#0052cc] text-white text-xs font-bold px-3 py-2 rounded-[4px] cursor-pointer transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting && (
                <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              {isSubmitting ? "Đang tạo..." : "Tạo dự án"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
