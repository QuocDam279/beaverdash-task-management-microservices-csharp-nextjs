import * as React from "react";
import {
  ProjectOverviewStats,
  ProjectOverviewStatusChart,
  ProjectOverviewPriorityChart,
  ProjectOverviewWorkload,
  ProjectOverviewTimeline,
} from "@/components/project/overview";

interface PageProps {
  params: Promise<{ shareToken: string }>;
}

export default async function SharedProjectOverviewPage({ params }: PageProps) {
  const { shareToken } = await params;
  let data: any = null;
  let error: string | null = null;

  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const res = await fetch(`${apiBaseUrl}/api/shared/projects/${shareToken}/overview`, {
      next: { revalidate: 15 },
    });
    if (res.ok) {
      data = await res.json();
    } else {
      error = "Không tìm thấy thông tin dự án.";
    }
  } catch (err: any) {
    console.error("Failed to load project overview:", err);
    error = err.message || "Đã xảy ra lỗi khi tải thông tin dự án.";
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
        projectId={data.id}
        shareToken={shareToken}
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
          projectId={data.id}
          shareToken={shareToken}
          todoSubTasksCount={data.todoSubTasksCount}
          inProgressSubTasksCount={data.inProgressSubTasksCount}
          doneSubTasksCount={data.doneSubTasksCount}
        />

        {/* Box 2: Timeline - Lịch sử hoạt động */}
        <ProjectOverviewTimeline shareToken={shareToken} />

        {/* Box 3: Bar Chart - Mức độ ưu tiên */}
        <ProjectOverviewPriorityChart
          projectId={data.id}
          shareToken={shareToken}
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
          projectId={data.id}
          shareToken={shareToken}
          memberWorkloads={data.memberWorkloads} 
        />
      </div>
    </div>
  );
}
