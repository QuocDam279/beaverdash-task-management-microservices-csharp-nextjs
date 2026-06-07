"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { api } from "@/lib/api";
import { toUtcLocalDate } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ shareToken: string }>;
}

export default function SharedProjectLayout({ children, params }: LayoutProps) {
  const { shareToken } = React.use(params);
  const pathname = usePathname();

  const [project, setProject] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchProjectDetails = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.get(`/shared/projects/${shareToken}/overview`);
      if (data) {
        setProject(data);
      } else {
        setError("Dự án chia sẻ không tồn tại hoặc đã bị khóa.");
      }
    } catch (err: any) {
      console.error("Failed to load shared project overview:", err);
      setError(err.message || "Không thể tải thông tin dự án chia sẻ.");
    } finally {
      setIsLoading(false);
    }
  }, [shareToken]);

  React.useEffect(() => {
    fetchProjectDetails();
  }, [fetchProjectDetails]);

  const tabs = [
    { name: "Tổng quan", href: `/shared/projects/${shareToken}`, exact: true },
    { name: "Bảng công việc", href: `/shared/projects/${shareToken}/board`, exact: false },
    { name: "Danh sách", href: `/shared/projects/${shareToken}/list`, exact: false },
    { name: "Lịch", href: `/shared/projects/${shareToken}/calendar`, exact: false },
    { name: "Sơ đồ gantt", href: `/shared/projects/${shareToken}/gantt`, exact: false },
    { name: "Tài liệu", href: `/shared/projects/${shareToken}/documents`, exact: false },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50">
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

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50">
        <div className="bg-white p-8 rounded-lg border border-slate-200 shadow-md text-center max-w-md">
          <span className="text-3xl">⚠️</span>
          <h2 className="text-lg font-bold text-red-500 mt-2">Lỗi truy cập</h2>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            {error || "Liên kết này không hợp lệ, dự án đã bị xóa hoặc quyền chia sẻ công khai đã bị tắt."}
          </p>
          <Link
            href="/login"
            className="inline-block mt-5 px-4 py-2 bg-[#1868db] hover:bg-[#0052cc] text-white text-xs font-bold rounded transition-colors"
          >
            Đăng nhập vào Beaverdash
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-white select-none overflow-hidden">
      {/* Project Header Area */}
      <div className="px-6 pt-6 pb-2 border-b border-slate-200 shrink-0 bg-slate-50/50">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div>
            {/* Breadcrumb / Project Type */}
            <div className="flex items-center gap-1.5 text-xs text-[#555] font-semibold mb-1 uppercase tracking-wider">
              <span>Dự án</span>
              <span className="text-slate-300">/</span>
              <span className="text-[#1868db] flex items-center gap-1 font-bold">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                Chia sẻ công khai (Chỉ xem)
              </span>
            </div>
            {/* Project Title */}
            <h1 className="text-2xl font-bold tracking-tight text-[#292a2e]">
              {project.name}
            </h1>
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
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-2 py-0.5 rounded-[4px]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-400">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span>Bắt đầu:</span>
                <span className="font-semibold text-slate-700">
                  {toUtcLocalDate(project.startDate)?.toLocaleDateString("vi-VN")}
                </span>
              </div>
            )}
            {project.dueDate && (
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-2 py-0.5 rounded-[4px]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-400">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>Hạn chót:</span>
                <span className="font-semibold text-slate-700">
                  {toUtcLocalDate(project.dueDate)?.toLocaleDateString("vi-VN")}
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
      <div className="flex-1 min-h-0 w-full overflow-y-auto bg-white custom-chat-scrollbar">
        {children}
      </div>
    </div>
  );
}
