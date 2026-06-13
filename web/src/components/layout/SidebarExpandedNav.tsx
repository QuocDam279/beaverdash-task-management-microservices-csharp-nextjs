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
  projects: Project[];
  unreadProjects?: Set<string>;
  onOpenCreateProject: () => void;
}

const renderProjectIcon = (id: string) => {
  const colors = [
    { bg: "bg-rose-50 text-rose-600 border-rose-200/80", color: "#e11d48" },
    { bg: "bg-indigo-50 text-indigo-600 border-indigo-200/80", color: "#4f46e5" },
    { bg: "bg-amber-50 text-amber-600 border-amber-200/80", color: "#d97706" },
    { bg: "bg-emerald-50 text-emerald-600 border-emerald-200/80", color: "#059669" },
    { bg: "bg-sky-50 text-sky-600 border-sky-200/80", color: "#0284c7" },
    { bg: "bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200/80", color: "#c026d3" },
    { bg: "bg-orange-50 text-orange-600 border-orange-200/80", color: "#ea580c" },
    { bg: "bg-teal-50 text-teal-600 border-teal-200/80", color: "#0d9488" },
  ];

  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorIndex = Math.abs(hash) % colors.length;
  const shapeIndex = Math.abs(hash >> 2) % 6;

  const activeColor = colors[colorIndex];
  const strokeColor = activeColor.color;

  switch (shapeIndex) {
    case 0: // Circle
      return (
        <span className={`h-5 w-5 rounded-[4px] border flex items-center justify-center shrink-0 select-none ${activeColor.bg}`}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style={{ color: strokeColor }}>
            <circle cx="12" cy="12" r="10" />
          </svg>
        </span>
      );
    case 1: // Square
      return (
        <span className={`h-5 w-5 rounded-[4px] border flex items-center justify-center shrink-0 select-none ${activeColor.bg}`}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style={{ color: strokeColor }}>
            <rect x="3" y="3" width="18" height="18" rx="3" />
          </svg>
        </span>
      );
    case 2: // Triangle
      return (
        <span className={`h-5 w-5 rounded-[4px] border flex items-center justify-center shrink-0 select-none ${activeColor.bg}`}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style={{ color: strokeColor }}>
            <path d="M12 3L2 21h20L12 3z" />
          </svg>
        </span>
      );
    case 3: // Diamond
      return (
        <span className={`h-5 w-5 rounded-[4px] border flex items-center justify-center shrink-0 select-none ${activeColor.bg}`}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style={{ color: strokeColor }}>
            <path d="M12 2L2 12l10 10 10-10L12 2z" />
          </svg>
        </span>
      );
    case 4: // Hexagon
      return (
        <span className={`h-5 w-5 rounded-[4px] border flex items-center justify-center shrink-0 select-none ${activeColor.bg}`}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style={{ color: strokeColor }}>
            <path d="M6 2h12l5 10-5 10H6l-5-10L6 2z" />
          </svg>
        </span>
      );
    case 5: // Star
      return (
        <span className={`h-5 w-5 rounded-[4px] border flex items-center justify-center shrink-0 select-none ${activeColor.bg}`}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" style={{ color: strokeColor }}>
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        </span>
      );
    default:
      return (
        <span className={`h-5 w-5 rounded-[4px] border flex items-center justify-center shrink-0 select-none ${activeColor.bg}`}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style={{ color: strokeColor }}>
            <circle cx="12" cy="12" r="10" />
          </svg>
        </span>
      );
  }
};

/**
 * Thanh điều hướng Sidebar ở chế độ mở rộng (expanded).
 * Hiển thị các menu chính và danh sách phẳng các dự án có nhóm.
 */
export function SidebarExpandedNav({
  pathname,
  activeProjectId,
  projects,
  unreadProjects = new Set(),
  onOpenCreateProject,
}: ExpandedNavProps) {
  return (
    <nav className="flex-1 p-3 space-y-4 overflow-y-auto overflow-x-hidden">
      {/* Main Navigation Group */}
      <div className="space-y-1">
        {/* Công việc của tôi Menu */}
        <Link
          href="/tasks"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-[4px] text-sm font-semibold transition-all duration-150 cursor-pointer ${
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
            strokeWidth="2.5"
          >
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          <span>Công việc của tôi</span>
        </Link>

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

        {/* Dự án được chia sẻ Menu */}
        <Link
          href="/shared-projects"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-[4px] text-sm font-semibold transition-all duration-150 cursor-pointer ${
            pathname.startsWith("/shared-projects")
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
            strokeWidth="2.5"
            className="shrink-0"
          >
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          <span>Dự án được chia sẻ</span>
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

        {/* Danh sách dự án dạng phẳng */}
        <div className="space-y-0.5 pl-1 max-h-[350px] overflow-y-auto overflow-x-hidden custom-chat-scrollbar">
          {projects.length > 0 ? (
            projects.map((p) => {
              const isActiveProject = activeProjectId === p.id;
              const hasUnread = unreadProjects.has(p.id);
              return (
                <ProjectTooltip key={p.id} text={p.name}>
                  <Link
                    href={`/projects/${p.id}`}
                    className={`flex items-center gap-2.5 px-3 py-1.5 rounded-[4px] text-xs font-semibold min-w-0 ${
                      isActiveProject
                        ? "bg-white border border-slate-300 text-[#1868db] font-bold shadow-sm"
                        : hasUnread
                        ? "text-red-600 hover:bg-slate-200/50 hover:text-red-700 font-bold"
                        : "text-[#505258] hover:bg-slate-200/50 hover:text-[#1868db]"
                    }`}
                  >
                    {renderProjectIcon(p.id)}
                    <span className="truncate flex-1 text-left">{p.name}</span>
                    {hasUnread && (
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0 animate-pulse" />
                    )}
                  </Link>
                </ProjectTooltip>
              );
            })
          ) : (
            <span className="px-3 py-2 text-[11px] text-slate-400 italic block">
              Không có dự án nào
            </span>
          )}
        </div>
      </div>
    </nav>
  );
}
