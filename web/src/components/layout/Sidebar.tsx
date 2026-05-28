"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { api } from "@/lib/api";
import { SidebarHeader } from "./SidebarHeader";
import { SidebarCollapsedNav } from "./SidebarCollapsedNav";
import { SidebarExpandedNav } from "./SidebarExpandedNav";
import { SidebarFooter } from "./SidebarFooter";
import { CreateProjectModal } from "@/components/project";

/**
 * Sidebar chính của Dashboard.
 * Quản lý trạng thái đóng/mở, kéo giãn chiều rộng,
 * và accordion nhóm dự án lấy từ API thật.
 */
export function Sidebar() {
  const pathname = usePathname();
  const { user: currentUser } = useAuth();

  const [projects, setProjects] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Fetch projects on mount/user change
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
  }, [currentUser]);

  // Active project ID matching /projects/[projectId]
  const projectMatch = pathname.match(/\/projects\/([^\/]+)/);
  const activeProjectId = projectMatch ? projectMatch[1] : null;

  // Project categorization
  const personalProjects = projects.filter((p) => p.teamId === null);
  const managedProjects = projects.filter(
    (p) => p.teamId !== null && currentUser && p.createdByUserId === currentUser.id
  );
  const joinedProjects = projects.filter(
    (p) => p.teamId !== null && currentUser && p.createdByUserId !== currentUser.id
  );

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

  // Accordion states for project groups (mặc định mở rộng hết khi đăng nhập)
  const [openCategories, setOpenCategories] = React.useState({
    personal: true,
    managed: true,
    joined: true,
  });

  // Modal state
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = React.useState(false);

  // Auto-expand the matching group when current active project changes (giữ các group khác mở)
  React.useEffect(() => {
    if (activeProjectId && projects.length > 0) {
      const isPersonal = personalProjects.some((p) => p.id === activeProjectId);
      const isManaged = managedProjects.some((p) => p.id === activeProjectId);
      const isJoined = joinedProjects.some((p) => p.id === activeProjectId);

      setOpenCategories((prev) => ({
        ...prev,
        personal: isPersonal || prev.personal,
        managed: isManaged || prev.managed,
        joined: isJoined || prev.joined,
      }));
    }
  }, [activeProjectId, projects]);

  const toggleCategory = (category: "personal" | "managed" | "joined") => {
    setOpenCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

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
          onExpand={() => setIsCollapsed(false)}
        />
      ) : (
        <SidebarExpandedNav
          pathname={pathname}
          activeProjectId={activeProjectId}
          personalProjects={personalProjects}
          managedProjects={managedProjects}
          joinedProjects={joinedProjects}
          openCategories={openCategories}
          toggleCategory={toggleCategory}
          onOpenCreateProject={() => setIsCreateProjectModalOpen(true)}
        />
      )}

      <SidebarFooter isCollapsed={isCollapsed} />

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
