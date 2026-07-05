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
      <div className="p-6 bg-[#fafbfc] dark:bg-[#1d2125] min-h-full space-y-6 animate-pulse select-none">
        {/* 1. STATS METRICS SECTION SKELETON */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-[#22272b] border border-slate-200/60 dark:border-[#353e47] rounded-[6px] p-5 shadow-[0_1px_3px_rgba(9,30,66,0.12)] flex items-center justify-between h-20">
              <div className="space-y-2 flex-1">
                <div className="h-3 bg-slate-200 dark:bg-[#2c3338] rounded-sm w-24" />
                <div className="h-5 bg-slate-200 dark:bg-[#2c3338] rounded-sm w-12" />
              </div>
              <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-[#2c3338] shrink-0" />
            </div>
          ))}
        </div>

        {/* 2. GRID 2X2 CHARTS SECTION SKELETON */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Box 1: Status Chart Skeleton */}
          <div className="bg-white dark:bg-[#22272b] border border-slate-200/80 dark:border-[#353e47] rounded-[6px] shadow-[0_1px_3px_rgba(9,30,66,0.12)] p-5 flex flex-col h-[320px]">
            <div className="h-4 bg-slate-200 dark:bg-[#2c3338] rounded-sm w-36 mb-6" />
            <div className="flex-1 flex items-center justify-center gap-8">
              <div className="h-32 w-32 rounded-full border-[14px] border-slate-200 dark:border-[#2c3338] flex items-center justify-center" />
              <div className="space-y-3 flex-1 max-w-[140px]">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-slate-200 dark:bg-[#2c3338] shrink-0" />
                    <div className="h-3 bg-slate-200 dark:bg-[#2c3338] rounded-sm w-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Box 2: Timeline Skeleton */}
          <div className="bg-white dark:bg-[#22272b] border border-slate-200/80 dark:border-[#353e47] rounded-[6px] shadow-[0_1px_3px_rgba(9,30,66,0.12)] p-5 flex flex-col h-[320px]">
            <div className="h-4 bg-slate-200 dark:bg-[#2c3338] rounded-sm w-36 mb-6" />
            <div className="flex-1 space-y-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <div className="h-6 w-6 rounded-full bg-slate-200 dark:bg-[#2c3338] shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3 bg-slate-200 dark:bg-[#2c3338] rounded-sm w-3/4" />
                    <div className="h-2 bg-slate-200 dark:bg-[#2c3338] rounded-sm w-16" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Box 3: Priority Chart Skeleton */}
          <div className="bg-white dark:bg-[#22272b] border border-slate-200/80 dark:border-[#353e47] rounded-[6px] shadow-[0_1px_3px_rgba(9,30,66,0.12)] p-5 flex flex-col h-[320px]">
            <div className="h-4 bg-slate-200 dark:bg-[#2c3338] rounded-sm w-36 mb-6" />
            <div className="flex-1 flex flex-col justify-end space-y-4">
              <div className="flex items-end gap-6 h-40 px-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex-1 flex items-end gap-1.5 h-full">
                    <div className="w-full bg-slate-200 dark:bg-[#2c3338] rounded-t-sm h-[30%]" />
                    <div className="w-full bg-slate-200 dark:bg-[#2c3338] rounded-t-sm h-[60%]" />
                    <div className="w-full bg-slate-200 dark:bg-[#2c3338] rounded-t-sm h-[20%]" />
                  </div>
                ))}
              </div>
              <div className="flex justify-between px-4">
                <div className="h-2 bg-slate-200 dark:bg-[#2c3338] rounded-sm w-12" />
                <div className="h-2 bg-slate-200 dark:bg-[#2c3338] rounded-sm w-12" />
                <div className="h-2 bg-slate-200 dark:bg-[#2c3338] rounded-sm w-12" />
              </div>
            </div>
          </div>

          {/* Box 4: Workload Skeleton */}
          <div className="bg-white dark:bg-[#22272b] border border-slate-200/80 dark:border-[#353e47] rounded-[6px] shadow-[0_1px_3px_rgba(9,30,66,0.12)] p-5 flex flex-col h-[320px]">
            <div className="h-4 bg-slate-200 dark:bg-[#2c3338] rounded-sm w-36 mb-6" />
            <div className="flex-1 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between">
                    <div className="h-3 bg-slate-200 dark:bg-[#2c3338] rounded-sm w-20" />
                    <div className="h-3 bg-slate-200 dark:bg-[#2c3338] rounded-sm w-8" />
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-slate-200 dark:bg-[#2c3338] h-full w-[45%]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-full flex items-center justify-center p-8 bg-[#fafbfc] dark:bg-[#1d2125]">
        <div className="text-center space-y-3">
          <div className="text-red-500 dark:text-red-400 font-bold text-lg">Lỗi tải dữ liệu</div>
          <div className="text-sm text-slate-500 dark:text-[#a5adba] font-semibold">{error || "Không tìm thấy dữ liệu"}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#fafbfc] dark:bg-[#1d2125] min-h-full space-y-6">
      {/* 1. STATS METRICS SECTION */}
      <ProjectOverviewStats
        projectId={projectId}
        completedCount={data.completedTasksCount}
        createdCount={data.newTasksCount}
        upcomingDueCount={data.upcomingDueTasksCount}
        completedSubTasksTotal={data.completedTasksSubTasksTotal}
        completedSubTasksDone={data.completedTasksSubTasksDone}
        newSubTasksTotal={data.newTasksSubTasksTotal}
        newSubTasksDone={data.newTasksSubTasksDone}
        upcomingDueSubTasksTotal={data.upcomingDueTasksSubTasksTotal}
        upcomingDueSubTasksDone={data.upcomingDueTasksSubTasksDone}
      />

      {/* 2. GRID 2X2 CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Box 1: Donut Chart - Trạng thái công việc */}
        <ProjectOverviewStatusChart
          projectId={projectId}
          todoSubTasksCount={data.todoSubTasksCount}
          inProgressSubTasksCount={data.inProgressSubTasksCount}
          doneSubTasksCount={data.doneSubTasksCount}
          columnStatusStats={data.columnStatusStats}
        />

        {/* Box 2: Timeline - Lịch sử hoạt động */}
        <ProjectOverviewTimeline projectId={projectId} />

        {/* Box 3: Bar Chart - Mức độ ưu tiên */}
        <ProjectOverviewPriorityChart
          projectId={projectId}
          requiredSubTasksHighCount={data.requiredSubTasksHighCount}
          requiredSubTasksMediumCount={data.requiredSubTasksMediumCount}
          requiredSubTasksLowCount={data.requiredSubTasksLowCount}
          importantSubTasksHighCount={data.importantSubTasksHighCount}
          importantSubTasksMediumCount={data.importantSubTasksMediumCount}
          importantSubTasksLowCount={data.importantSubTasksLowCount}
          extendedSubTasksHighCount={data.extendedSubTasksHighCount}
          extendedSubTasksMediumCount={data.extendedSubTasksMediumCount}
          extendedSubTasksLowCount={data.extendedSubTasksLowCount}
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
