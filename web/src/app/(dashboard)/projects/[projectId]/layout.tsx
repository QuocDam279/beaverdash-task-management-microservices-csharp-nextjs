"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { EditProjectModal } from "@/components/project";
import { useAlertConfirm } from "@/components/providers/AlertConfirmProvider";
import { FloatingAssistant } from "@/components/features/ai-assistant";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}



export default function ProjectLayout({ children, params }: LayoutProps) {
  const { projectId } = React.use(params);
  const pathname = usePathname();
  const router = useRouter();
  const { user: currentUser } = useAuth();

  const [project, setProject] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = React.useState(false);
  const { alert, confirm } = useAlertConfirm();

  const fetchProjectDetails = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await api.get(`/projects/${projectId}/overview`);
      if (data) {
        setProject(data);
      }
    } catch (err) {
      console.error("Failed to load project overview in layout:", err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  React.useEffect(() => {
    fetchProjectDetails();
  }, [fetchProjectDetails]);

  const handleDeleteProject = async () => {
    const confirmDelete = await confirm(
      "Bạn có chắc chắn muốn xóa dự án này? Thao tác này không thể hoàn tác và tất cả các công việc liên quan sẽ bị xóa hoàn toàn.",
      {
        title: "Xóa dự án",
        confirmLabel: "Xóa dự án",
        variant: "danger",
      }
    );
    if (!confirmDelete) return;

    try {
      await api.delete(`/projects/${projectId}`);
      window.location.href = "/";
    } catch (err: any) {
      alert(err.message || "Không thể xóa dự án.", "Thất bại", "danger");
    }
  };



  const tabs: { name: string; href: string; exact: boolean; disabled?: boolean }[] = [
    { name: "Tổng quan", href: `/projects/${projectId}`, exact: true },
    { name: "Bảng công việc", href: `/projects/${projectId}/board`, exact: false },
    { name: "Lịch", href: `/projects/${projectId}/calendar`, exact: false },
    { name: "Danh sách", href: `/projects/${projectId}/list`, exact: false },
    { name: "Sơ đồ gantt", href: `/projects/${projectId}/gantt`, exact: false },
  ];

  if (isLoading || !project) {
    return (
      <div className="min-h-full flex items-center justify-center p-8 bg-white">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-[#1868db]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm font-semibold text-slate-500">Đang tải thông tin dự án...</span>
        </div>
      </div>
    );
  }

  const userWorkload = project?.memberWorkloads?.find((w: any) => w.userId === currentUser?.id);
  const isLeaderOrOwner = project.teamId
    ? (userWorkload?.role === "Trưởng nhóm")
    : (project?.createdByUserId === currentUser?.id || userWorkload?.role === "Chủ sở hữu");

  return (
    <div className="flex flex-col h-full w-full bg-white select-none">
      {/* Project Header Area */}
      <div className="px-6 pt-6 pb-2 border-b border-slate-200 shrink-0">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div>
            {/* Breadcrumb / Project Type */}
            <div className="flex items-center gap-1.5 text-xs text-[#505258] font-semibold mb-1 uppercase tracking-wider">
              <span>Dự án</span>
              <span className="text-slate-300">/</span>
              <span className="text-[#1868db]">
                {project.teamId ? "Dự án nhóm" : "Dự án cá nhân"}
              </span>
            </div>
            {/* Project Title */}
            <h1 className="text-2xl font-bold tracking-tight text-[#292a2e]">
              {project.name}
            </h1>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-2">

            {isLeaderOrOwner && (
              <>
                <button
                  onClick={() => setIsEditOpen(true)}
                  className="p-1.5 rounded-[4px] border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors flex items-center justify-center cursor-pointer"
                  title="Sửa dự án"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>

                <button
                  onClick={handleDeleteProject}
                  className="p-1.5 rounded-[4px] border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors flex items-center justify-center cursor-pointer"
                  title="Xóa dự án"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Project Description */}
        {project.description && (
          <p className="text-xs text-[#505258] max-w-4xl leading-relaxed mb-4">
            {project.description}
          </p>
        )}

        {/* Project Dates */}
        {(project.startDate || project.dueDate) && (
          <div className="flex flex-wrap items-center gap-4 text-xs text-[#505258] mb-4">
            {project.startDate && (
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/60 px-2 py-0.5 rounded-[4px]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span>Bắt đầu:</span>
                <span className="font-semibold text-slate-700">
                  {new Date(project.startDate).toLocaleDateString("vi-VN")}
                </span>
              </div>
            )}
            {project.dueDate && (
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/60 px-2 py-0.5 rounded-[4px]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>Hạn chót:</span>
                <span className="font-semibold text-slate-700">
                  {new Date(project.dueDate).toLocaleDateString("vi-VN")}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Project Tabs Bar */}
        <div className="flex items-center gap-6 mt-2 -mb-[9px] overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const isTabActive = tab.exact 
              ? pathname === tab.href 
              : pathname.startsWith(tab.href);
            
            if (tab.disabled) {
              return (
                <button
                  key={tab.name}
                  disabled
                  className="pb-2 text-xs font-semibold text-slate-400 border-b-2 border-transparent cursor-not-allowed opacity-60"
                  title="Tính năng đang được phát triển"
                >
                  {tab.name}
                </button>
              );
            }

            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`pb-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  isTabActive
                    ? "border-[#1868db] text-[#1868db]"
                    : "border-transparent text-[#505258] hover:text-[#1868db] hover:border-slate-300"
                }`}
              >
                {tab.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Project Content Area */}
      <div className="flex-1 min-h-0 w-full flex overflow-hidden bg-[#f4f5f7] relative">
        <div className="flex-1 min-h-0 overflow-auto bg-white">
          {children}
        </div>

        {/* Beaver AI Assistant Collapsible Right Sidebar Panel */}
        <div 
          className={`shrink-0 transition-all duration-300 ease-in-out bg-white flex flex-col h-full overflow-hidden ${
            isAssistantOpen ? "w-[360px] border-l border-slate-200 shadow-md" : "w-0 border-l-transparent shadow-none"
          }`}
        >
          <div className="w-[360px] h-full flex flex-col">
            <FloatingAssistant 
              projectId={projectId} 
              isOpen={isAssistantOpen} 
              setIsOpen={setIsAssistantOpen} 
            />
          </div>
        </div>
      </div>

      <EditProjectModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        project={project}
        onProjectUpdated={fetchProjectDetails}
      />
    </div>
  );
}
