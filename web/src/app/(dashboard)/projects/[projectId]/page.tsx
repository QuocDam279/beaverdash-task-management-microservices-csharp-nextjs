"use client";

import * as React from "react";

import {
  ProjectOverviewStats,
  ProjectOverviewStatusChart,
  ProjectOverviewPriorityChart,
  ProjectOverviewWorkload,
  ProjectOverviewTimeline,
} from "@/components/project/overview";
import { api } from "@/lib/api";

interface PageProps {
  params: Promise<{ projectId: string }>;
}

/**
 * ProjectOverviewPage — Trang tổng quan dự án tích hợp API thật, thay thế mock data.
 * Tuân thủ CODING_CONVENTIONS.md (trách nhiệm đơn lẻ, độ dài dưới 200 dòng, barrel export).
 */
export default function ProjectOverviewPage({ params }: PageProps) {
  const { projectId } = React.use(params);
  const [data, setData] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchOverview = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const overview = await api.get(`/projects/${projectId}/overview`);
        if (overview) {
          setData(overview);
        } else {
          setError("Không tìm thấy thông tin dự án.");
        }
      } catch (err: any) {
        console.error("Failed to load project overview:", err);
        setError(err.message || "Đã xảy ra lỗi khi tải thông tin dự án.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOverview();
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center p-8 bg-[#fafbfc]">
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

  if (error || !data) {
    return (
      <div className="min-h-full flex items-center justify-center p-8 bg-[#fafbfc]">
        <div className="text-center space-y-3">
          <div className="text-red-500 font-bold text-lg">Lỗi tải dữ liệu</div>
          <div className="text-sm text-slate-500 font-semibold">{error || "Không tìm thấy dữ liệu"}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#fafbfc] min-h-full space-y-6">
      {/* 1. STATS METRICS SECTION */}
      <ProjectOverviewStats
        projectId={projectId}
        completedCount={data.completedTasksCount}
        createdCount={data.newTasksCount}
        upcomingDueCount={data.upcomingDueTasksCount}
      />

      {/* 2. GRID 2X2 CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Box 1: Donut Chart - Trạng thái công việc */}
        <ProjectOverviewStatusChart
          projectId={projectId}
          columnStatusCounts={data.columnStatusCounts || []}
        />

        {/* Box 2: Timeline - Lịch sử hoạt động */}
        <ProjectOverviewTimeline projectId={projectId} />

        {/* Box 3: Bar Chart - Mức độ ưu tiên */}
        <ProjectOverviewPriorityChart
          projectId={projectId}
          lowCount={data.lowPriorityCount}
          mediumCount={data.mediumPriorityCount}
          highCount={data.highPriorityCount}
          criticalCount={data.criticalPriorityCount}
        />

        {/* Box 4: Teamwork Workload Progress */}
        <ProjectOverviewWorkload 
          projectId={projectId}
          memberWorkloads={data.memberWorkloads} 
        />
      </div>
    </div>
  );
}
