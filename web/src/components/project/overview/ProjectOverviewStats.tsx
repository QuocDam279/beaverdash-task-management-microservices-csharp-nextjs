"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardBody } from "@/components/ui/Card";

interface ProjectOverviewStatsProps {
  projectId: string;
  shareToken?: string;
  completedCount: number;
  createdCount: number;
  upcomingDueCount: number;

  completedSubTasksTotal: number;
  completedSubTasksDone: number;
  newSubTasksTotal: number;
  newSubTasksDone: number;
  upcomingDueSubTasksTotal: number;
  upcomingDueSubTasksDone: number;
}

/**
 * ProjectOverviewStats — Thẻ chỉ số hiển thị nhanh trạng thái công việc của dự án.
 * Cho phép click vào để chuyển hướng trực tiếp qua Bảng công việc kèm bộ lọc.
 */
export function ProjectOverviewStats({
  projectId,
  shareToken,
  completedCount,
  createdCount,
  upcomingDueCount,
  completedSubTasksTotal,
  completedSubTasksDone,
  newSubTasksTotal,
  newSubTasksDone,
  upcomingDueSubTasksTotal,
  upcomingDueSubTasksDone,
}: ProjectOverviewStatsProps) {
  const getBoardUrl = (query: string = "") => {
    return shareToken
      ? `/shared/projects/${shareToken}/board${query}`
      : `/projects/${projectId}/board${query}`;
  };

  const renderProgressBar = (done: number, total: number, colorClass: string) => {
    if (total === 0) {
      return (
        <span className="text-[10px] text-slate-400 dark:text-[#8c9bab] block mt-2.5 pt-0.5 border-t border-slate-100 dark:border-[#2c3338]">
          Không có nhiệm vụ
        </span>
      );
    }
    const percent = Math.round((done / total) * 100);
    return (
      <div className="space-y-1.5 mt-2.5 pt-2 border-t border-slate-100 dark:border-[#2c3338]">
        <div className="flex justify-between items-center text-[10px] text-[#505258] dark:text-[#a5adba] font-medium">
          <span>{done}/{total} nhiệm vụ</span>
          <span className="font-bold">{percent}%</span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-[#2c3338] h-1.5 rounded-full overflow-hidden">
          <div 
            className={`h-full ${colorClass} transition-all duration-500`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 select-none">
      {/* Card 1: Completed Tasks */}
      <Link href={getBoardUrl()} className="block group">
        <Card className="bg-white border border-slate-200/80 rounded-[6px] shadow-[0_1px_3px_rgba(9,30,66,0.12)] hover:border-slate-300 hover:shadow-[0_2px_8px_rgba(9,30,66,0.08)] transition-all duration-300">
          <CardBody className="p-5 flex flex-col justify-between h-full min-h-[130px]">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-[#6b6e76] dark:text-[#8c9bab] uppercase tracking-wider block">
                  Hoàn thành (7 ngày)
                </span>
                <span className="text-3xl font-extrabold text-[#10b981] dark:text-[#4ade80] leading-none block">
                  {completedCount} <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">công việc</span>
                </span>
              </div>
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center group-hover:scale-105 transition-all shrink-0
                ${completedCount === 0 
                  ? "bg-slate-50 dark:bg-[#161a1d] border border-slate-200/60 dark:border-[#2c3338] text-slate-400 dark:text-slate-500 opacity-40" 
                  : "bg-green-50 dark:bg-emerald-950/30 border border-green-100 dark:border-emerald-900/50 text-[#10b981] dark:text-[#4ade80]"}`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>
            {renderProgressBar(completedSubTasksDone, completedSubTasksTotal, "bg-[#10b981]")}
          </CardBody>
        </Card>
      </Link>

      {/* Card 2: Created Tasks */}
      <Link href={getBoardUrl()} className="block group">
        <Card className="bg-white border border-slate-200/80 rounded-[6px] shadow-[0_1px_3px_rgba(9,30,66,0.12)] hover:border-slate-300 hover:shadow-[0_2px_8px_rgba(9,30,66,0.08)] transition-all duration-300">
          <CardBody className="p-5 flex flex-col justify-between h-full min-h-[130px]">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-[#6b6e76] dark:text-[#8c9bab] uppercase tracking-wider block">
                  Công việc mới (7 ngày)
                </span>
                <span className="text-3xl font-extrabold text-[#1868db] dark:text-[#579dff] leading-none block">
                  {createdCount} <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">công việc</span>
                </span>
              </div>
              <div className="h-9 w-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-[#1868db] group-hover:scale-105 transition-transform shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </div>
            </div>
            {renderProgressBar(newSubTasksDone, newSubTasksTotal, "bg-[#1868db]")}
          </CardBody>
        </Card>
      </Link>

      {/* Card 3: Upcoming Due Tasks */}
      <Link href={getBoardUrl("?dueDate=upcoming7")} className="block group">
        <Card className="bg-white border border-slate-200/80 rounded-[6px] shadow-[0_1px_3px_rgba(9,30,66,0.12)] hover:border-slate-300 hover:shadow-[0_2px_8px_rgba(9,30,66,0.08)] transition-all duration-300">
          <CardBody className="p-5 flex flex-col justify-between h-full min-h-[130px]">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-[#6b6e76] dark:text-[#8c9bab] uppercase tracking-wider block">
                  Sắp đến hạn (7 ngày)
                </span>
                <span className="text-3xl font-extrabold text-orange-600 dark:text-orange-400 leading-none block">
                  {upcomingDueCount} <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">công việc</span>
                </span>
              </div>
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center group-hover:scale-105 transition-all shrink-0
                ${upcomingDueCount === 0 
                  ? "bg-slate-50 dark:bg-[#161a1d] border border-slate-200/60 dark:border-[#2c3338] text-slate-400 dark:text-slate-500 opacity-40" 
                  : "bg-orange-50 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-900/50 text-orange-600 dark:text-orange-400"}`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
            </div>
            {renderProgressBar(upcomingDueSubTasksDone, upcomingDueSubTasksTotal, "bg-orange-500")}
          </CardBody>
        </Card>
      </Link>
    </div>
  );
}
