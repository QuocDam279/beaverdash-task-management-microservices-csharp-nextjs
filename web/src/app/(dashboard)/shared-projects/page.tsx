"use client";

import * as React from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { toUtcLocalDate } from "@/lib/utils";

interface SharedProject {
  id: string;
  name: string;
  description: string | null;
  progress: number;
  startDate: string | null;
  dueDate: string | null;
  shareToken: string;
  ownerName: string;
  ownerAvatar: string | null;
  sharedAt: string;
}

export default function SharedProjectsPage() {
  const [projects, setProjects] = React.useState<SharedProject[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchSharedProjects = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await api.get("/projects/shared-with-me");
        setProjects(data || []);
      } catch (err: any) {
        console.error("Failed to fetch shared projects:", err);
        setError(err.message || "Không thể tải danh sách dự án được chia sẻ.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSharedProjects();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center p-8 bg-white select-none">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-[#1868db]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-xs font-semibold text-slate-500 font-sans">Đang tải danh sách dự án...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-white select-none p-6 md:p-8 font-sans">
      {/* Page Header */}
      <div className="mb-6 pb-4 border-b border-slate-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-500 rounded-lg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#292a2e]">Dự án được chia sẻ</h1>
            <p className="text-xs text-[#505258] mt-0.5">
              Danh sách các dự án bên ngoài được chia sẻ trực tiếp với email của bạn.
            </p>
          </div>
        </div>
      </div>

      {error ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center text-red-500 font-bold max-w-md bg-red-50 border border-red-200 px-6 py-4 rounded-lg text-xs">
            {error}
          </div>
        </div>
      ) : projects.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-slate-200/60 rounded-xl m-4 bg-slate-50/50">
          <div className="text-slate-300 mb-3.5">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Chưa có dự án nào được chia sẻ</h3>
          <p className="text-[11px] text-slate-400 mt-1 max-w-xs leading-relaxed">
            Khi trưởng nhóm của một dự án khác thêm email của bạn vào danh sách chia sẻ, dự án đó sẽ xuất hiện ở đây.
          </p>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto pr-2 custom-chat-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-2">
            {projects.map((project) => {
              const formattedStartDate = project.startDate 
                ? toUtcLocalDate(project.startDate)?.toLocaleDateString("vi-VN") 
                : null;
              const formattedDueDate = project.dueDate 
                ? toUtcLocalDate(project.dueDate)?.toLocaleDateString("vi-VN") 
                : null;

              return (
                <Link 
                  key={project.id} 
                  href={`/shared/projects/${project.shareToken}/board`}
                  className="bg-white border border-slate-200 hover:border-[#1868db] rounded-lg shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden group cursor-pointer block"
                >
                  <div className="p-5 space-y-4">
                    {/* Header: Title and badge */}
                    <div className="flex justify-between items-start gap-3">
                      <h3 className="font-bold text-sm text-[#292a2e] group-hover:text-[#1868db] transition-colors line-clamp-1 leading-snug flex-1 min-w-0">
                        {project.name}
                      </h3>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0 uppercase tracking-wide">
                        Đang chia sẻ
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed min-h-[38px] max-h-[38px] overflow-hidden">
                      {project.description || "Không có mô tả dự án."}
                    </p>

                    {/* Progress */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold">
                        <span>Tiến độ</span>
                        <span className="text-slate-700 font-bold">{project.progress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-[#1868db] rounded-full transition-all duration-500" 
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Dates */}
                    {(formattedStartDate || formattedDueDate) && (
                      <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400 pt-1 font-semibold">
                        {formattedStartDate && (
                          <div className="flex items-center gap-1">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-400">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                              <line x1="16" y1="2" x2="16" y2="6" />
                              <line x1="8" y1="2" x2="8" y2="6" />
                              <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                            <span>Bắt đầu: {formattedStartDate}</span>
                          </div>
                        )}
                        {formattedDueDate && (
                          <div className="flex items-center gap-1">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-400">
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                            <span className="text-slate-500">Hạn chót: {formattedDueDate}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4">
                    {/* Owner Info */}
                    <div className="flex items-center gap-2 min-w-0">
                      {project.ownerAvatar ? (
                        <img 
                          src={project.ownerAvatar} 
                          alt={project.ownerName} 
                          className="h-6 w-6 rounded-full object-cover border border-slate-200 shrink-0" 
                        />
                      ) : (
                        <div className="h-6 w-6 rounded-full bg-[#1868db]/10 text-[#1868db] border border-[#1868db]/20 flex items-center justify-center font-bold text-[10px] shrink-0">
                          {project.ownerName.substring(0, 1).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-[10px] text-slate-400 font-medium leading-none">Chủ dự án</p>
                        <p className="text-[11px] font-bold text-[#292a2e] truncate mt-0.5 leading-none">{project.ownerName}</p>
                      </div>
                    </div>

                    {/* Action button */}
                    <div 
                      className="px-3.5 py-1.5 text-[11px] font-bold text-white bg-[#1868db] group-hover:bg-[#0052cc] rounded-[4px] transition-colors shrink-0 shadow-xs group-hover:shadow-md flex items-center gap-1"
                    >
                      Xem bảng
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="translate-y-[0.5px]">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
