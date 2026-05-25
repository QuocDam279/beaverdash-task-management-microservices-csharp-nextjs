"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardBody, CardFooter } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { api } from "@/lib/api";
import { Team } from "@/types/team";

export default function TeamsPage() {
  const router = useRouter();

  const [teams, setTeams] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isCreating, setIsCreating] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Modal state for creating a new team
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [newTeamName, setNewTeamName] = React.useState("");
  const [newTeamDesc, setNewTeamDesc] = React.useState("");
  const [newTeamEmails, setNewTeamEmails] = React.useState("");

  const fetchTeams = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.get("/teams");
      setTeams(data || []);
    } catch (err: any) {
      console.error("Failed to load teams:", err);
      setError(err.message || "Không thể kết nối đến máy chủ.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

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
      if (newTeamEmails.trim() && teamId) {
        const emailList = newTeamEmails.split(",").map((email) => email.trim().toLowerCase());
        for (const email of emailList) {
          try {
            // Find user in IdentityService
            const user = await api.get(`/users?email=${encodeURIComponent(email)}`);
            if (user && user.id) {
              // Add to team
              await api.post(`/teams/${teamId}/members`, {
                userId: user.id
              });
            }
          } catch (memberErr) {
            console.error(`Failed to add user with email ${email}:`, memberErr);
          }
        }
      }

      // 3. Refresh list
      await fetchTeams();

      // Reset and Close
      setNewTeamName("");
      setNewTeamDesc("");
      setNewTeamEmails("");
      setIsModalOpen(false);
    } catch (err: any) {
      console.error("Failed to create team:", err);
      alert(err.message || "Tạo nhóm thất bại.");
    } finally {
      setIsCreating(false);
    }
  };

  // Filter logic
  const filteredTeams = teams.filter((team) => {
    const query = searchQuery.toLowerCase().trim();
    return (
      team.name.toLowerCase().includes(query) ||
      (team.description && team.description.toLowerCase().includes(query))
    );
  });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 select-none bg-white">
      {/* 1. Header Area */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-5 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#292a2e]">
            Danh sách nhóm
          </h1>
          <p className="text-xs text-[#505258] mt-1">
            Xem thông tin các nhóm làm việc, số lượng thành viên, dự án trực thuộc và phân bổ công việc.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="self-start md:self-auto bg-[#1868db] hover:bg-[#0052cc] active:bg-[#0747a6] text-white text-xs font-bold px-4 py-2 rounded-[4px] shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Tạo nhóm mới
        </button>
      </div>

      {/* 2. Search & Toolbar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Tìm kiếm nhóm theo tên hoặc mô tả..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 pl-9 text-xs border border-slate-300 rounded-[4px] bg-white text-[#292a2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1868db] focus-visible:border-transparent transition-all placeholder:text-slate-400"
          />
          <svg
            className="absolute left-3 top-2.5 h-4 w-4 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>
      </div>

      {/* 3. Loading/Error/Grid states */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-20 text-slate-500 text-xs gap-3">
          <svg className="animate-spin h-6 w-6 text-[#1868db]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="font-semibold">Đang tải danh sách nhóm...</span>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-md flex items-center justify-between">
          <span>⚠️ {error}</span>
          <button onClick={fetchTeams} className="text-[#1868db] hover:underline cursor-pointer">Thử lại</button>
        </div>
      ) : filteredTeams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => {
            const members = team.members || [];
            const membersCount = team.membersCount || members.length;
            const projectsCount = team.projectsCount || 0;

            return (
              <Card
                key={team.id}
                onClick={() => router.push(`/teams/${team.id}`)}
                className="hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[190px] border border-slate-200"
              >
                <CardHeader className="p-5 pb-3">
                  <h3 className="text-base font-bold text-[#292a2e] tracking-tight hover:text-[#1868db] transition-colors line-clamp-1">
                    {team.name}
                  </h3>
                  <p className="text-xs text-[#505258] mt-2 line-clamp-2 leading-relaxed">
                    {team.description || "Không có mô tả cho nhóm này."}
                  </p>
                </CardHeader>

                <CardBody className="px-5 py-2 flex flex-col gap-3">
                  {/* Info badges */}
                  <div className="flex items-center gap-4 text-xs font-semibold text-[#505258]">
                    <span className="flex items-center gap-1">
                      <span className="text-sm">👥</span> {membersCount} thành viên
                    </span>
                    <span className="text-slate-300">|</span>
                    <span className="flex items-center gap-1">
                      <span className="text-sm">📂</span> {projectsCount} dự án
                    </span>
                  </div>

                  {/* Avatar stack overlay */}
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="flex -space-x-2.5 overflow-hidden">
                      {members.map((member: any) => (
                        <Avatar
                          key={member.userId}
                          className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover bg-slate-50"
                          src={member.avatar}
                          alt={member.displayName}
                          title={member.displayName}
                        />
                      ))}
                    </div>
                    {membersCount > members.length && (
                      <span className="text-[10px] font-bold text-[#6b6e76] bg-slate-100 border border-slate-200 rounded-full h-6 px-1.5 flex items-center justify-center">
                        +{membersCount - members.length}
                      </span>
                    )}
                  </div>
                </CardBody>

                <CardFooter className="p-5 pt-3 border-t border-slate-50 flex items-center justify-between text-xs font-bold text-[#1868db] hover:text-[#0052cc]">
                  <span>Xem chi tiết nhóm</span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-slate-200 rounded-lg text-slate-500 text-sm bg-slate-50/30">
          <span className="text-3xl mb-2">👥</span>
          <p className="font-semibold text-slate-600">Không tìm thấy nhóm nào</p>
          <p className="text-xs text-slate-400 mt-1">Hãy thử tìm kiếm với từ khóa khác hoặc tạo nhóm mới.</p>
        </div>
      )}

      {/* 4. Interactive "Create Team" Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xl w-full max-w-md animate-in fade-in duration-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-sm font-bold text-[#292a2e] uppercase tracking-wide">
                Tạo nhóm làm việc mới
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
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
                  <p className="text-[10px] text-slate-400 mb-2">
                    (Bạn sẽ tự động được đặt làm Trưởng nhóm/Owner)
                  </p>
                  <textarea
                    rows={2}
                    disabled={isCreating}
                    value={newTeamEmails}
                    onChange={(e) => setNewTeamEmails(e.target.value)}
                    placeholder="Nhập email các thành viên, phân cách bằng dấu phẩy (,)"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-[4px] bg-white text-[#292a2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1868db] focus-visible:border-transparent transition-all resize-none disabled:opacity-60"
                  />
                  <p className="text-[10px] text-slate-400 mt-1 italic">
                    Các email hợp lệ trong hệ thống sẽ tự động được thêm vào với vai trò Thành viên.
                  </p>
                </div>
              </div>

              <div className="px-5 py-3 border-t border-slate-200 bg-slate-50/50 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
      )}
    </div>
  );
}
