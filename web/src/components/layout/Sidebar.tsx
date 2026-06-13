"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import type { MyProjectDto } from "@/types/api";
import { api } from "@/lib/api";
import { SidebarHeader } from "./SidebarHeader";
import { SidebarCollapsedNav } from "./SidebarCollapsedNav";
import { SidebarExpandedNav } from "./SidebarExpandedNav";
import dynamic from "next/dynamic";

const CreateProjectModal = dynamic(() =>
  import("@/components/project/CreateProjectModal").then((m) => m.CreateProjectModal),
  { ssr: false }
);

/**
 * Sidebar chính của Dashboard.
 * Quản lý trạng thái đóng/mở, kéo giãn chiều rộng,
 * và danh sách dự án của các nhóm làm việc.
 */
export function Sidebar() {
  const pathname = usePathname();
  const { user: currentUser } = useAuth();

  const [projects, setProjects] = React.useState<MyProjectDto[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [unreadProjects, setUnreadProjects] = React.useState<Set<string>>(new Set());

  // Active project ID matching /projects/[projectId]
  const projectMatch = pathname.match(/\/projects\/([^\/]+)/);
  const activeProjectId = projectMatch ? projectMatch[1] : null;

  // Fetch projects on mount/user change/project navigation
  React.useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        const data = await api.get("/projects");
        setProjects(data || []);
      } catch (err) {
        console.error("Failed to load projects for sidebar:", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (currentUser) {
      fetchProjects();
    }

    const handleProjectsUpdated = () => {
      if (currentUser) {
        fetchProjects();
      }
    };

    window.addEventListener("projects-updated", handleProjectsUpdated);
    return () => {
      window.removeEventListener("projects-updated", handleProjectsUpdated);
    };
  }, [currentUser, activeProjectId]);

  // Recalculate unread projects whenever projects list is loaded
  React.useEffect(() => {
    if (typeof window === "undefined" || projects.length === 0) return;
    const unread = new Set<string>();
    projects.forEach((p) => {
      if (p.lastChatMessageCreatedAt) {
        const lastViewedStr = localStorage.getItem(`beaverdash_chat_last_viewed_project_${p.id}`);
        const lastViewed = lastViewedStr ? new Date(lastViewedStr).getTime() : 0;
        const latestTime = new Date(p.lastChatMessageCreatedAt).getTime();
        if (latestTime > lastViewed) {
          unread.add(p.id);
        }
      }
    });
    setUnreadProjects(unread);
  }, [projects]);

  // Listen to real-time read/new message events
  React.useEffect(() => {
    const handleChatRead = (e: Event) => {
      const customEvent = e as CustomEvent;
      const readProjectId = customEvent.detail?.projectId;
      if (readProjectId) {
        setUnreadProjects((prev) => {
          const next = new Set(prev);
          next.delete(readProjectId);
          return next;
        });
      }
    };

    const handleNewChatMessage = (e: Event) => {
      const customEvent = e as CustomEvent;
      const msgProjectId = customEvent.detail?.projectId;
      if (msgProjectId && (msgProjectId !== activeProjectId || pathname !== `/projects/${msgProjectId}/chat`)) {
        setUnreadProjects((prev) => {
          const next = new Set(prev);
          next.add(msgProjectId);
          return next;
        });
      }
    };

    window.addEventListener("beaverdash-chat-read", handleChatRead);
    window.addEventListener("beaverdash-new-chat-message", handleNewChatMessage);
    return () => {
      window.removeEventListener("beaverdash-chat-read", handleChatRead);
      window.removeEventListener("beaverdash-new-chat-message", handleNewChatMessage);
    };
  }, [activeProjectId, pathname]);

  // Lọc chỉ giữ lại dự án có nhóm làm việc (Team Projects)
  const teamProjects = React.useMemo(() => {
    return projects.filter((p) => p.teamId !== null);
  }, [projects]);

  // Sidebar collapse state
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [sidebarWidth, setSidebarWidth] = React.useState(260);
  const [isResizing, setIsResizing] = React.useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(240, Math.min(400, startWidth + deltaX));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Modal state
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = React.useState(false);

  return (
    <aside
      style={{ width: `${isCollapsed ? 64 : sidebarWidth}px` }}
      className={`relative flex flex-col border-r border-slate-200 bg-[#f4f5f7] select-none shrink-0 ${
        isResizing ? "" : "transition-all duration-200 ease-in-out"
      }`}
    >
      {/* Resize handle */}
      {!isCollapsed && (
        <div
          onMouseDown={handleMouseDown}
          className="absolute top-0 -right-[2px] w-[5px] h-full cursor-col-resize hover:bg-[#1868db]/30 active:bg-[#1868db] z-40 select-none transition-colors"
        />
      )}

      {/* Floating toggle button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-[16px] h-6 w-6 rounded-full border border-slate-200 bg-white text-[#505258] hover:bg-slate-100 hover:text-[#1868db] flex items-center justify-center shadow-md cursor-pointer z-50 transition-all"
        title={isCollapsed ? "Mở rộng Sidebar" : "Thu gọn Sidebar"}
      >
        {isCollapsed ? (
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        ) : (
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        )}
      </button>

      <SidebarHeader isCollapsed={isCollapsed} />

      {isCollapsed ? (
        <SidebarCollapsedNav
          pathname={pathname}
          activeProjectId={activeProjectId}
          hasUnreadProjects={unreadProjects.size > 0}
          onExpand={() => setIsCollapsed(false)}
        />
      ) : (
        <SidebarExpandedNav
          pathname={pathname}
          activeProjectId={activeProjectId}
          projects={teamProjects}
          unreadProjects={unreadProjects}
          onOpenCreateProject={() => setIsCreateProjectModalOpen(true)}
        />
      )}

      <CreateProjectModal 
        isOpen={isCreateProjectModalOpen} 
        onClose={() => setIsCreateProjectModalOpen(false)}
        onProjectCreated={(project) => {
          setProjects((prev) => [project, ...prev]);
        }}
      />
    </aside>
  );
}
