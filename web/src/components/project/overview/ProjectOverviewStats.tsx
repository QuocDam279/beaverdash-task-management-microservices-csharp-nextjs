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
}: ProjectOverviewStatsProps) {
  const getBoardUrl = (query: string = "") => {
    return shareToken
      ? `/shared/projects/${shareToken}/board${query}`
      : `/projects/${projectId}/board${query}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 select-none">
      {/* Card 1: Completed Tasks */}
      <Link href={getBoardUrl()} className="block group">
        <Card className="bg-white border border-slate-200/80 rounded-[6px] shadow-[0_1px_3px_rgba(9,30,66,0.12)] hover:border-slate-300 hover:shadow-[0_2px_8px_rgba(9,30,66,0.08)] transition-all duration-300">
          <CardBody className="p-5 flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-[#6b6e76] uppercase tracking-wider block">
                Hoàn thành (7 ngày)
              </span>
              <span className="text-3xl font-extrabold text-[#10b981] leading-none block">
                {completedCount}
              </span>
              <span className="text-xs text-[#505258] block">
                công việc đã kết thúc thành công
              </span>
            </div>
            <div className={`h-12 w-12 rounded-lg flex items-center justify-center group-hover:scale-105 transition-all
              ${completedCount === 0 
                ? "bg-slate-50 border border-slate-200/60 text-slate-400 opacity-40" 
                : "bg-green-50 border border-green-100 text-[#10b981]"}`}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </CardBody>
        </Card>
      </Link>

      {/* Card 2: Created Tasks */}
      <Link href={getBoardUrl()} className="block group">
        <Card className="bg-white border border-slate-200/80 rounded-[6px] shadow-[0_1px_3px_rgba(9,30,66,0.12)] hover:border-slate-300 hover:shadow-[0_2px_8px_rgba(9,30,66,0.08)] transition-all duration-300">
          <CardBody className="p-5 flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-[#6b6e76] uppercase tracking-wider block">
                Công việc mới (7 ngày)
              </span>
              <span className="text-3xl font-extrabold text-[#1868db] leading-none block">
                {createdCount}
              </span>
              <span className="text-xs text-[#505258] block">
                nhiệm vụ được tạo và đưa vào bảng
              </span>
            </div>
            <div className="h-12 w-12 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-[#1868db] group-hover:scale-105 transition-transform">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
          </CardBody>
        </Card>
      </Link>

      {/* Card 3: Upcoming Due Tasks */}
      <Link href={getBoardUrl("?dueDate=upcoming7")} className="block group">
        <Card className="bg-white border border-slate-200/80 rounded-[6px] shadow-[0_1px_3px_rgba(9,30,66,0.12)] hover:border-slate-300 hover:shadow-[0_2px_8px_rgba(9,30,66,0.08)] transition-all duration-300">
          <CardBody className="p-5 flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-[#6b6e76] uppercase tracking-wider block">
                Sắp đến hạn (7 ngày)
              </span>
              <span className="text-3xl font-extrabold text-orange-600 leading-none block">
                {upcomingDueCount}
              </span>
              <span className="text-xs text-[#505258] block">
                nhiệm vụ cần ưu tiên hoàn thành gấp
              </span>
            </div>
            <div className={`h-12 w-12 rounded-lg flex items-center justify-center group-hover:scale-105 transition-all
              ${upcomingDueCount === 0 
                ? "bg-slate-50 border border-slate-200/60 text-slate-400 opacity-40" 
                : "bg-orange-50 border border-orange-100 text-orange-600"}`}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
          </CardBody>
        </Card>
      </Link>
    </div>
  );
}
