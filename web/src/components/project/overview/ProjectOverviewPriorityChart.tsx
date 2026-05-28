"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";

interface ProjectOverviewPriorityChartProps {
  projectId: string;
  shareToken?: string;
  requiredCount: number;
  importantCount: number;
  extendedCount: number;
}

/**
 * ProjectOverviewPriorityChart — Biểu đồ cột phân bổ mức độ ưu tiên công việc (Required, Important, Extended).
 * Hỗ trợ nhấp vào từng cột để chuyển hướng trực tiếp qua Bảng công việc kèm bộ lọc mức độ ưu tiên.
 */
export function ProjectOverviewPriorityChart({
  projectId,
  shareToken,
  requiredCount,
  importantCount,
  extendedCount,
}: ProjectOverviewPriorityChartProps) {
  const totalCount = requiredCount + importantCount + extendedCount;
  const maxCount = Math.max(requiredCount, importantCount, extendedCount, 1);

  const getBoardUrl = (query: string = "") => {
    return shareToken
      ? `/shared/projects/${shareToken}/board${query}`
      : `/projects/${projectId}/board${query}`;
  };

  // We scale the bar heights to a maximum of 80% to leave room for the numbers on top.
  const getBarHeight = (count: number) => {
    return `${(count / maxCount) * 80}%`;
  };

  return (
    <Card className="bg-white border border-slate-200/80 rounded-[6px] shadow-[0_1px_3px_rgba(9,30,66,0.12)] flex flex-col w-full">
      <CardHeader className="p-5 pb-3 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#292a2e]">Mức độ ưu tiên công việc</h3>
        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
          {totalCount} công việc có thiết lập
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

          {/* Bar Required */}
          <Link 
            href={getBoardUrl("?priority=Required")}
            className="h-full flex flex-col justify-end items-center w-16 group relative z-10 cursor-pointer block"
          >
            <div 
              style={{ height: getBarHeight(requiredCount) }} 
              className="w-10 bg-gradient-to-t from-[#ef4444] to-[#f87171] rounded-t-[4px] hover:from-[#dc2626] hover:to-[#ef4444] transition-all duration-300 min-h-[4px] relative shadow-[0_2px_8px_rgba(239,68,68,0.15)] hover:shadow-[0_4px_12px_rgba(239,68,68,0.35)] hover:-translate-y-[1px]"
            >
              {/* Count on top */}
              <span className="text-[11px] font-extrabold text-[#ef4444] absolute -top-5.5 left-1/2 -translate-x-1/2 transition-transform group-hover:scale-110">
                {requiredCount}
              </span>
            </div>
          </Link>

          {/* Bar Important */}
          <Link 
            href={getBoardUrl("?priority=Important")}
            className="h-full flex flex-col justify-end items-center w-16 group relative z-10 cursor-pointer block"
          >
            <div 
              style={{ height: getBarHeight(importantCount) }} 
              className="w-10 bg-gradient-to-t from-[#1868db] to-[#60a5fa] rounded-t-[4px] hover:from-[#114fa9] hover:to-[#1868db] transition-all duration-300 min-h-[4px] relative shadow-[0_2px_8px_rgba(24,104,219,0.15)] hover:shadow-[0_4px_12px_rgba(24,104,219,0.35)] hover:-translate-y-[1px]"
            >
              {/* Count on top */}
              <span className="text-[11px] font-extrabold text-[#1868db] absolute -top-5.5 left-1/2 -translate-x-1/2 transition-transform group-hover:scale-110">
                {importantCount}
              </span>
            </div>
          </Link>

          {/* Bar Extended */}
          <Link 
            href={getBoardUrl("?priority=Extended")}
            className="h-full flex flex-col justify-end items-center w-16 group relative z-10 cursor-pointer block"
          >
            <div 
              style={{ height: getBarHeight(extendedCount) }} 
              className="w-10 bg-gradient-to-t from-[#64748b] to-[#94a3b8] rounded-t-[4px] hover:from-[#475569] hover:to-[#64748b] transition-all duration-300 min-h-[4px] relative shadow-[0_2px_8px_rgba(100,116,139,0.15)] hover:shadow-[0_4px_12px_rgba(100,116,139,0.35)] hover:-translate-y-[1px]"
            >
              {/* Count on top */}
              <span className="text-[11px] font-extrabold text-[#64748b] absolute -top-5.5 left-1/2 -translate-x-1/2 transition-transform group-hover:scale-110">
                {extendedCount}
              </span>
            </div>
          </Link>
        </div>

        {/* Labels Underneath */}
        <div className="flex justify-around pt-2.5 text-[10px] font-extrabold text-slate-500 text-center uppercase tracking-wider">
          <span className="w-16 text-[#ef4444]">Bắt buộc</span>
          <span className="w-16 text-[#1868db]">Quan trọng</span>
          <span className="w-16 text-[#64748b]">Mở rộng</span>
        </div>
      </CardBody>
    </Card>
  );
}
