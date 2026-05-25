"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Project } from "@/types/project";
import { api } from "@/lib/api";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: Project) => void;
}

export function CreateProjectModal({ isOpen, onClose, onProjectCreated }: CreateProjectModalProps) {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [teamId, setTeamId] = React.useState<string>("");
  const [isPublic, setIsPublic] = React.useState(false);
  const [startDate, setStartDate] = React.useState("");
  const [dueDate, setDueDate] = React.useState("");
  const [teams, setTeams] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchTeams = async () => {
      try {
        const data = await api.get("/teams");
        const leaderTeams = (data || []).filter((t: any) => t.currentUserRole === "leader");
        setTeams(leaderTeams);
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

    try {
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
          createdByUserId: "", // populated by backend
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
    } catch (err) {
      console.error("Failed to create project:", err);
      alert("Đã xảy ra lỗi khi tạo dự án.");
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
            className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5 rounded hover:bg-slate-100"
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
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: Thiết kế Website, Marketing Q1..."
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-[4px] bg-white text-[#292a2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1868db] focus-visible:border-transparent transition-all"
              />
            </div>

            {/* Thuộc nhóm */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#6b6e76] uppercase tracking-wider block">
                Thuộc nhóm làm việc
              </label>
              <select
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-[4px] bg-white text-[#292a2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1868db] focus-visible:border-transparent transition-all cursor-pointer"
              >
                <option value="">Không có nhóm (Dự án cá nhân)</option>
                {teams.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
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
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-[4px] bg-white text-[#292a2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1868db] focus-visible:border-transparent transition-all cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#6b6e76] uppercase tracking-wider block">
                  Hạn chót
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-[4px] bg-white text-[#292a2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1868db] focus-visible:border-transparent transition-all cursor-pointer"
                />
              </div>
            </div>

            {/* Quyền riêng tư */}
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="h-3.5 w-3.5 accent-[#1868db] cursor-pointer rounded"
              />
              <label htmlFor="isPublic" className="text-xs text-[#292a2e] cursor-pointer">
                Công khai dự án này (Ai có link đều có thể xem)
              </label>
            </div>
          </div>

          <div className="px-5 py-3 border-t border-slate-200 bg-slate-50/50 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-transparent hover:bg-slate-100 text-[#505258] text-xs font-bold px-3 py-2 rounded-[4px] border border-slate-200 cursor-pointer transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="bg-[#1868db] hover:bg-[#0052cc] text-white text-xs font-bold px-3 py-2 rounded-[4px] cursor-pointer transition-colors"
            >
              Tạo dự án
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
