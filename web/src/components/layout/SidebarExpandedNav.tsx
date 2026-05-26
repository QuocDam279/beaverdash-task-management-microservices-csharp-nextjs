"use client";

import * as React from "react";
import Link from "next/link";
import { ProjectTooltip } from "@/components/ui/Tooltip";

interface Project {
  id: string;
  name: string;
  teamId: string | null;
  createdByUserId: string;
}

interface ExpandedNavProps {
  pathname: string;
  activeProjectId: string | null;
  personalProjects: Project[];
  managedProjects: Project[];
  joinedProjects: Project[];
  openCategories: { personal: boolean; managed: boolean; joined: boolean };
  toggleCategory: (category: "personal" | "managed" | "joined") => void;
  onOpenCreateProject: () => void;
}

/**
 * Thanh điều hướng Sidebar ở chế độ mở rộng (expanded).
 * Bao gồm menu chính (Nhóm, Công việc, Trợ lý) và
 * Accordion nhóm dự án (Cá nhân, Quản lý, Tham gia).
 */
export function SidebarExpandedNav({
  pathname,
  activeProjectId,
  personalProjects,
  managedProjects,
  joinedProjects,
  openCategories,
  toggleCategory,
  onOpenCreateProject,
}: ExpandedNavProps) {
  return (
    <nav className="flex-1 p-3 space-y-4 overflow-y-auto overflow-x-hidden">
      {/* Main Navigation Group */}
      <div className="space-y-1">
        {/* Nhóm Menu */}
        <Link
          href="/teams"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-[4px] text-sm font-semibold transition-all duration-150 cursor-pointer ${
            pathname.startsWith("/teams")
              ? "bg-[#1868db]/10 text-[#1868db]"
              : "text-[#505258] hover:bg-slate-200/60 hover:text-[#1868db]"
          }`}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span>Nhóm</span>
        </Link>

        {/* Công việc Menu */}
        <Link
          href="/tasks"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-[4px] text-sm font-semibold transition-all cursor-pointer ${
            pathname.startsWith("/tasks")
              ? "bg-[#1868db]/10 text-[#1868db]"
              : "text-[#505258] hover:bg-slate-200/60 hover:text-[#1868db]"
          }`}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          <span>Công việc</span>
        </Link>

        {/* Trợ lý Beaver Menu */}
        <Link
          href="/ai-assistant"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-[4px] text-sm font-semibold transition-all duration-150 cursor-pointer ${
            pathname === "/ai-assistant"
              ? "bg-[#1868db]/10 text-[#1868db]"
              : "text-[#505258] hover:bg-slate-200/60 hover:text-[#1868db]"
          }`}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <path d="M12 7v6M9 10h6" />
          </svg>
          <span>Trợ lý Beaver</span>
        </Link>

        {/* Thùng rác Menu */}
        <Link
          href="/trash"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-[4px] text-sm font-semibold transition-all duration-150 cursor-pointer ${
            pathname.startsWith("/trash")
              ? "bg-[#1868db]/10 text-[#1868db]"
              : "text-[#505258] hover:bg-slate-200/60 hover:text-[#1868db]"
          }`}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
          <span>Thùng rác</span>
        </Link>
      </div>

      {/* Dự án Category Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-3 text-[11px] font-bold text-[#6b6e76] uppercase tracking-wider">
          <span>Dự án</span>
          <button
            onClick={onOpenCreateProject}
            title="Tạo dự án mới"
            className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>

        {/* Categorized Project Accordion submenus */}
        <div className="space-y-1.5 pl-1">
          {/* 1. Dự án cá nhân Accordion */}
          <ProjectCategoryAccordion
            label="Dự án cá nhân"
            icon={
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="text-slate-400"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            }
            isOpen={openCategories.personal}
            onToggle={() => toggleCategory("personal")}
            projects={personalProjects}
            activeProjectId={activeProjectId}
          />

          {/* 2. Dự án quản lý Accordion */}
          <ProjectCategoryAccordion
            label="Dự án quản lý"
            icon={
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-slate-400"
              >
                <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" />
                <path d="M3 20h18" />
              </svg>
            }
            isOpen={openCategories.managed}
            onToggle={() => toggleCategory("managed")}
            projects={managedProjects}
            activeProjectId={activeProjectId}
          />

          {/* 3. Dự án tham gia Accordion */}
          <ProjectCategoryAccordion
            label="Dự án tham gia"
            icon={
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-slate-400"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            }
            isOpen={openCategories.joined}
            onToggle={() => toggleCategory("joined")}
            projects={joinedProjects}
            activeProjectId={activeProjectId}
          />
        </div>
      </div>
    </nav>
  );
}

/* ─── Sub-component: Accordion cho từng nhóm dự án ─── */

interface ProjectCategoryAccordionProps {
  label: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  projects: Project[];
  activeProjectId: string | null;
}

function ProjectCategoryAccordion({
  label,
  icon,
  isOpen,
  onToggle,
  projects,
  activeProjectId,
}: ProjectCategoryAccordionProps) {
  return (
    <div className="space-y-0.5">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-2 py-1.5 rounded-[4px] text-[10px] font-bold text-slate-400 hover:bg-slate-200/50 hover:text-[#1868db] tracking-wide cursor-pointer transition-colors"
      >
        <div className="flex items-center gap-1.5 shrink-0">
          {icon}
          <span>{label}</span>
        </div>
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className={`transition-transform duration-150 text-slate-400 shrink-0 ${
            isOpen ? "rotate-0" : "-rotate-90"
          }`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div className="pl-6 space-y-0.5 transition-all">
          {projects.length > 0 ? (
            projects.map((p) => {
              const isActiveProject = activeProjectId === p.id;
              return (
                <ProjectTooltip key={p.id} text={p.name}>
                  <Link
                    href={`/projects/${p.id}`}
                    className={`flex items-center justify-between px-2 py-1 rounded-[4px] text-xs font-semibold transition-all ${
                      isActiveProject
                        ? "bg-white border border-slate-300 text-[#1868db] font-bold shadow-sm"
                        : "text-[#505258] hover:bg-slate-200/50 hover:text-[#1868db]"
                    }`}
                  >
                    <span className="truncate flex-1 text-left">{p.name}</span>
                  </Link>
                </ProjectTooltip>
              );
            })
          ) : (
            <span className="px-2 py-1 text-[11px] text-slate-400 italic block">
              Không có dự án
            </span>
          )}
        </div>
      )}
    </div>
  );
}
