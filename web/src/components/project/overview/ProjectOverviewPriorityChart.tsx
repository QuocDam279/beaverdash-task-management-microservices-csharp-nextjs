"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";

interface ProjectOverviewPriorityChartProps {
  projectId: string;
  lowCount: number;
  mediumCount: number;
  highCount: number;
  criticalCount: number;
}

/**
 * ProjectOverviewPriorityChart — Biểu đồ cột phân bổ mức độ ưu tiên công việc (Critical, High, Medium, Low).
 * Hỗ trợ nhấp vào từng cột để chuyển hướng trực tiếp qua Bảng công việc kèm bộ lọc mức độ ưu tiên.
 */
export function ProjectOverviewPriorityChart({
  projectId,
  lowCount,
  mediumCount,
  highCount,
  criticalCount,
}: ProjectOverviewPriorityChartProps) {
  const totalCount = lowCount + mediumCount + highCount + criticalCount;
  const maxCount = Math.max(lowCount, mediumCount, highCount, criticalCount, 1);

  // We scale the bar heights to a maximum of 80% to leave room for the numbers on top.
  const getBarHeight = (count: number) => {
    return `${(count / maxCount) * 80}%`;
  };

  return (
    <Card className="bg-white border border-slate-200/80 rounded-[6px] shadow-[0_1px_3px_rgba(9,30,66,0.12)] flex flex-col w-full">
      <CardHeader className="p-5 pb-3 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#292a2e]">Mức độ ưu tiên công việc</h3>
        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
          {totalCount} công việc
        </span>
      </CardHeader>
      
      <CardBody className="p-5 flex-1 flex flex-col justify-end min-h-[220px]">
        {/* Chart Area with Grid Lines */}
        <div className="relative h-40 border-b border-slate-200 pb-2 px-4 w-full flex items-end justify-around">
          {/* Subtle horizontal grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-2">
            <div className="w-full border-t border-dashed border-slate-100/70" />
            <div className="w-full border-t border-dashed border-slate-100/70" />
            <div className="w-full border-t border-dashed border-slate-100/70" />
            <div className="w-full" /> {/* Bottom axis */}
          </div>

          {/* Bar Critical */}
          <Link 
            href={`/projects/${projectId}/board?priority=Critical`}
            className="h-full flex flex-col justify-end items-center w-14 group relative z-10 cursor-pointer block"
          >
            <div 
              style={{ height: getBarHeight(criticalCount) }} 
              className="w-10 bg-gradient-to-t from-[#ef4444] to-[#f87171] rounded-t-[4px] hover:from-[#dc2626] hover:to-[#ef4444] transition-all duration-300 min-h-[4px] relative shadow-[0_2px_8px_rgba(239,68,68,0.15)] hover:shadow-[0_4px_12px_rgba(239,68,68,0.35)] hover:-translate-y-[1px]"
            >
              {/* Count on top */}
              <span className="text-[11px] font-extrabold text-[#ef4444] absolute -top-5.5 left-1/2 -translate-x-1/2 transition-transform group-hover:scale-110">
                {criticalCount}
              </span>
            </div>
          </Link>

          {/* Bar High */}
          <Link 
            href={`/projects/${projectId}/board?priority=High`}
            className="h-full flex flex-col justify-end items-center w-14 group relative z-10 cursor-pointer block"
          >
            <div 
              style={{ height: getBarHeight(highCount) }} 
              className="w-10 bg-gradient-to-t from-[#f97316] to-[#fb923c] rounded-t-[4px] hover:from-[#ea580c] hover:to-[#f97316] transition-all duration-300 min-h-[4px] relative shadow-[0_2px_8px_rgba(249,115,22,0.15)] hover:shadow-[0_4px_12px_rgba(249,115,22,0.35)] hover:-translate-y-[1px]"
            >
              {/* Count on top */}
              <span className="text-[11px] font-extrabold text-[#f97316] absolute -top-5.5 left-1/2 -translate-x-1/2 transition-transform group-hover:scale-110">
                {highCount}
              </span>
            </div>
          </Link>

          {/* Bar Medium */}
          <Link 
            href={`/projects/${projectId}/board?priority=Medium`}
            className="h-full flex flex-col justify-end items-center w-14 group relative z-10 cursor-pointer block"
          >
            <div 
              style={{ height: getBarHeight(mediumCount) }} 
              className="w-10 bg-gradient-to-t from-[#3b82f6] to-[#60a5fa] rounded-t-[4px] hover:from-[#2563eb] hover:to-[#3b82f6] transition-all duration-300 min-h-[4px] relative shadow-[0_2px_8px_rgba(59,130,246,0.15)] hover:shadow-[0_4px_12px_rgba(59,130,246,0.35)] hover:-translate-y-[1px]"
            >
              {/* Count on top */}
              <span className="text-[11px] font-extrabold text-[#3b82f6] absolute -top-5.5 left-1/2 -translate-x-1/2 transition-transform group-hover:scale-110">
                {mediumCount}
              </span>
            </div>
          </Link>

          {/* Bar Low */}
          <Link 
            href={`/projects/${projectId}/board?priority=Low`}
            className="h-full flex flex-col justify-end items-center w-14 group relative z-10 cursor-pointer block"
          >
            <div 
              style={{ height: getBarHeight(lowCount) }} 
              className="w-10 bg-gradient-to-t from-[#64748b] to-[#94a3b8] rounded-t-[4px] hover:from-[#475569] hover:to-[#64748b] transition-all duration-300 min-h-[4px] relative shadow-[0_2px_8px_rgba(100,116,139,0.15)] hover:shadow-[0_4px_12px_rgba(100,116,139,0.35)] hover:-translate-y-[1px]"
            >
              {/* Count on top */}
              <span className="text-[11px] font-extrabold text-[#64748b] absolute -top-5.5 left-1/2 -translate-x-1/2 transition-transform group-hover:scale-110">
                {lowCount}
              </span>
            </div>
          </Link>
        </div>

        {/* Labels Underneath */}
        <div className="flex justify-around pt-2.5 text-[10px] font-extrabold text-slate-500 text-center uppercase tracking-wider">
          <span className="w-14 text-[#ef4444]">Khẩn cấp</span>
          <span className="w-14 text-[#f97316]">Cao</span>
          <span className="w-14 text-[#3b82f6]">Trung bình</span>
          <span className="w-14 text-[#64748b]">Thấp</span>
        </div>
      </CardBody>
    </Card>
  );
}
