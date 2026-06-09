"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardBody, CardFooter } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { api } from "@/lib/api";
import { Team } from "@/types/team";
import dynamic from "next/dynamic";

const CreateTeamModal = dynamic(() =>
  import("@/components/team/CreateTeamModal"),
  { ssr: false }
);

export default function TeamsPage() {
  const router = useRouter();
  const [teams, setTeams] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Modal state for creating a new team
  const [isModalOpen, setIsModalOpen] = React.useState(false);

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

  // Filter logic
  const filteredTeams = teams.filter((team) => {
    const query = searchQuery.toLowerCase().trim();
    return (
      team.name.toLowerCase().includes(query) ||
      (team.description && team.description.toLowerCase().includes(query))
    );
  });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 select-none bg-white dark:bg-[#1d2125]">
      {/* 1. Header Area */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 dark:border-[#2c3338] pb-5 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#292a2e] dark:text-[#deebff]">
            Danh sách nhóm
          </h1>
          <p className="text-xs text-[#505258] dark:text-[#a5adba] mt-1">
            Xem thông tin các nhóm làm việc, số lượng thành viên, dự án trực thuộc và phân bổ công việc.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="self-start md:self-auto bg-[#1868db] hover:bg-[#0052cc] active:bg-[#0747a6] dark:bg-[#579dff] dark:hover:bg-[#85b8ff] dark:active:bg-[#4c9aff] text-white dark:text-[#1d2125] text-xs font-bold px-4 py-2 rounded-[4px] shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
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
            className="w-full px-3 py-2 pl-9 text-xs border border-slate-300 dark:border-[#454f59] rounded-[4px] bg-white dark:bg-[#22272b] text-[#292a2e] dark:text-[#deebff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1868db] dark:focus-visible:ring-[#579dff] focus-visible:border-transparent transition-all placeholder:text-slate-400 dark:placeholder:text-[#626f7f]"
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
        <div className="flex flex-col items-center justify-center p-20 text-slate-500 dark:text-[#8c9bab] text-xs gap-3">
          <svg className="animate-spin h-6 w-6 text-[#1868db] dark:text-[#579dff]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="font-semibold">Đang tải danh sách nhóm...</span>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 dark:bg-[rgba(239,68,68,0.15)] border border-red-200 dark:border-[rgba(239,68,68,0.3)] text-red-700 dark:text-[#f87171] text-xs font-semibold rounded-md flex items-center justify-between">
          <span>⚠️ {error}</span>
          <button onClick={fetchTeams} className="text-[#1868db] dark:text-[#579dff] hover:underline cursor-pointer">Thử lại</button>
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
                className="hover:border-slate-300 dark:hover:border-[#454f59] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[190px] border border-slate-200 dark:border-[#353e47] dark:bg-[#22272b]"
              >
                <CardHeader className="p-5 pb-3">
                  <h3 className="text-base font-bold text-[#292a2e] dark:text-[#deebff] tracking-tight hover:text-[#1868db] dark:hover:text-[#579dff] transition-colors line-clamp-1">
                    {team.name}
                  </h3>
                  <p className="text-xs text-[#505258] dark:text-[#a5adba] mt-2 line-clamp-2 leading-relaxed">
                    {team.description || "Không có mô tả cho nhóm này."}
                  </p>
                </CardHeader>

                <CardBody className="px-5 py-2 flex flex-col gap-3">
                  {/* Info badges */}
                  <div className="flex items-center gap-4 text-xs font-semibold text-[#505258] dark:text-[#a5adba]">
                    <span className="flex items-center gap-1">
                      <span className="text-sm">👥</span> {membersCount} thành viên
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">|</span>
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
                          className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-[#22272b] object-cover bg-slate-50 dark:bg-slate-800"
                          src={member.avatar}
                          alt={member.displayName}
                          title={member.displayName}
                        />
                      ))}
                    </div>
                    {membersCount > members.length && (
                      <span className="text-[10px] font-bold text-[#6b6e76] dark:text-[#a5adba] bg-slate-100 dark:bg-[#2c3338] border border-slate-200 dark:border-[#353e47] rounded-full h-6 px-1.5 flex items-center justify-center">
                        +{membersCount - members.length}
                      </span>
                    )}
                  </div>
                </CardBody>

                <CardFooter className="p-5 pt-3 border-t border-slate-50 dark:border-[#2c3338] flex items-center justify-between text-xs font-bold text-[#1868db] dark:text-[#579dff] hover:text-[#0052cc] dark:hover:text-[#85b8ff]">
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
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-slate-200 dark:border-[#2c3338] rounded-lg text-slate-500 dark:text-[#8c9bab] text-sm bg-slate-50/30 dark:bg-slate-900/10">
          <span className="text-3xl mb-2">👥</span>
          <p className="font-semibold text-slate-600 dark:text-[#a5adba]">Không tìm thấy nhóm nào</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Hãy thử tìm kiếm với từ khóa khác hoặc tạo nhóm mới.</p>
        </div>
      )}

      {/* 4. Interactive "Create Team" Modal */}
      <CreateTeamModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchTeams}
      />
    </div>
  );
}
