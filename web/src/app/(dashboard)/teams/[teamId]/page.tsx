"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  EditTeamModal,
  DeleteTeamButton,
  AddMemberModal,
  TeamMembersTable,
  TeamProjectsGrid,
} from "@/components/team";

import { api } from "@/lib/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { Project } from "@/types/project";

interface PageProps {
  params: Promise<{ teamId: string }>;
}

/**
 * Trang chi tiết nhóm: hiển thị thông tin nhóm, thành viên, dự án.
 * Cho phép Owner/Admin chỉnh sửa, xóa nhóm, và quản lý thành viên.
 */
export default function TeamDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { teamId } = React.use(params);
  const { token, user: currentUser } = useAuth();

  const [team, setTeam] = React.useState<any>(null);
  const [members, setMembers] = React.useState<any[]>([]);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [activeTab, setActiveTab] = React.useState<"members" | "projects">("members");

  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

  const fetchTeamDetails = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const teamData = await api.get(`/teams/${teamId}`);
      setTeam(teamData);
      setMembers(teamData.members || []);

      const projectsData = await api.get(`/teams/${teamId}/projects`);
      setProjects(projectsData || []);
    } catch (err: any) {
      console.error("Failed to load team details:", err);
      setError(err.message || "Không thể tải thông tin chi tiết nhóm.");
    } finally {
      setIsLoading(false);
    }
  }, [teamId]);

  React.useEffect(() => {
    fetchTeamDetails();
  }, [fetchTeamDetails]);



  if (isLoading && !team) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-slate-500 text-xs gap-3 min-h-screen">
        <svg className="animate-spin h-8 w-8 text-[#1868db]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="font-semibold">Đang tải thông tin nhóm...</span>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center space-y-4 select-none mt-20">
        <span className="text-5xl">⚠️</span>
        <h2 className="text-lg font-bold text-slate-800">Không tìm thấy nhóm</h2>
        <p className="text-xs text-slate-500">
          {error || "Nhóm làm việc bạn đang tìm kiếm không tồn tại hoặc đã bị xóa."}
        </p>
        <button
          onClick={() => router.push("/teams")}
          className="bg-[#1868db] hover:bg-[#0052cc] text-white text-xs font-bold px-4 py-2 rounded-[4px] cursor-pointer inline-block"
        >
          Quay lại danh sách nhóm
        </button>
      </div>
    );
  }

  // Check authorization
  const currentUserMemberRecord = members.find((m) => m.userId === currentUser?.id);
  const isOwnerOrAdmin =
    team.ownerUserId === currentUser?.id ||
    currentUserMemberRecord?.role === "leader" ||
    currentUserMemberRecord?.role === "Owner";

  const handleTeamDeleted = () => {
    router.push("/teams");
  };

  const handleTeamUpdated = () => {
    setIsEditModalOpen(false);
    fetchTeamDetails();
  };

  const handleMemberAdded = () => {
    setIsAddModalOpen(false);
    fetchTeamDetails();
  };

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-[#1d2125] select-none">
      {/* 1. Breadcrumb and Header area */}
      <div className="px-6 pt-6 pb-2 border-b border-slate-200 dark:border-[#2c3338] shrink-0">
        <div className="flex items-center gap-1 text-xs text-[#6b6e76] dark:text-[#8c9bab] font-semibold uppercase tracking-wider mb-2">
          <Link href="/teams" className="hover:text-[#1868db] dark:hover:text-[#579dff] transition-colors">
            Nhóm
          </Link>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <span className="text-[#1868db] dark:text-[#579dff] font-bold">{team.name}</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/teams")}
                title="Quay lại danh sách"
                className="p-1 rounded-[4px] text-[#505258] dark:text-[#a5adba] hover:bg-slate-100 dark:hover:bg-[#2c3338] border border-slate-200 dark:border-[#2c3338] cursor-pointer flex items-center justify-center shrink-0"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold tracking-tight text-[#292a2e] dark:text-[#deebff]">
                {team.name}
              </h1>
            </div>
            <p className="text-xs text-[#505258] dark:text-[#a5adba] max-w-4xl mt-2 leading-relaxed pl-9">
              {team.description || "Không có mô tả chi tiết cho nhóm này."}
            </p>
          </div>

          {/* Edit/Delete buttons for Owner/Admin */}
          {isOwnerOrAdmin && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsEditModalOpen(true)}
                title="Chỉnh sửa nhóm"
                className="text-[#505258] dark:text-[#a5adba] hover:text-[#1868db] dark:hover:text-[#579dff] hover:bg-blue-50 dark:hover:bg-slate-800 p-1.5 rounded-[4px] transition-all cursor-pointer inline-flex items-center justify-center border border-slate-200 dark:border-[#2c3338] hover:border-blue-200 dark:hover:border-[#454f59] gap-1.5 text-xs font-bold"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              <DeleteTeamButton
                teamId={teamId}
                teamName={team.name}
                hasProjects={projects.length > 0}
                onDeleted={handleTeamDeleted}
              />
            </div>
          )}
        </div>

        {/* 2. Tabs Switcher */}
        <div className="flex items-center gap-6 mt-2 -mb-[9px] pl-9">
          <button
            onClick={() => setActiveTab("members")}
            className={`pb-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "members"
                ? "border-[#1868db] dark:border-[#579dff] text-[#1868db] dark:text-[#579dff]"
                : "border-transparent text-[#505258] dark:text-[#a5adba] hover:text-[#1868db] dark:hover:text-[#579dff] hover:border-slate-300 dark:hover:border-[#353e47]"
            }`}
          >
            Danh sách thành viên ({members.length})
          </button>
          <button
            onClick={() => setActiveTab("projects")}
            className={`pb-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "projects"
                ? "border-[#1868db] dark:border-[#579dff] text-[#1868db] dark:text-[#579dff]"
                : "border-transparent text-[#505258] dark:text-[#a5adba] hover:text-[#1868db] dark:hover:text-[#579dff] hover:border-slate-300 dark:hover:border-[#353e47]"
            }`}
          >
            Danh sách dự án ({projects.length})
          </button>

        </div>
      </div>

      {/* 3. Tab Contents area */}
      <div className="flex-1 min-h-0 w-full overflow-auto bg-white dark:bg-[#1d2125] p-6 custom-chat-scrollbar">
        {activeTab === "members" && (
          <TeamMembersTable
            teamId={teamId}
            members={members}
            currentUserId={currentUser?.id}
            isOwnerOrAdmin={isOwnerOrAdmin}
            onMemberRemoved={fetchTeamDetails}
            onAddMemberClick={() => setIsAddModalOpen(true)}
          />
        )}

        {activeTab === "projects" && <TeamProjectsGrid projects={projects} />}


      </div>

      {/* 4. Modals */}
      {isAddModalOpen && (
        <AddMemberModal
          teamId={teamId}
          existingMemberIds={members.map((m) => m.userId)}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={handleMemberAdded}
        />
      )}

      {isEditModalOpen && (
        <EditTeamModal
          teamId={teamId}
          currentName={team.name}
          currentDescription={team.description || ""}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleTeamUpdated}
        />
      )}
    </div>
  );
}
