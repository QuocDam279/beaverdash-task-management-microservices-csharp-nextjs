"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";

interface ProjectOverviewPriorityChartProps {
  projectId: string;
  shareToken?: string;
  requiredSubTasksHighCount?: number;
  requiredSubTasksMediumCount?: number;
  requiredSubTasksLowCount?: number;

  importantSubTasksHighCount?: number;
  importantSubTasksMediumCount?: number;
  importantSubTasksLowCount?: number;

  extendedSubTasksHighCount?: number;
  extendedSubTasksMediumCount?: number;
  extendedSubTasksLowCount?: number;
}

export function ProjectOverviewPriorityChart({
  projectId,
  shareToken,
  requiredSubTasksHighCount = 0,
  requiredSubTasksMediumCount = 0,
  requiredSubTasksLowCount = 0,
  importantSubTasksHighCount = 0,
  importantSubTasksMediumCount = 0,
  importantSubTasksLowCount = 0,
  extendedSubTasksHighCount = 0,
  extendedSubTasksMediumCount = 0,
  extendedSubTasksLowCount = 0,
}: ProjectOverviewPriorityChartProps) {
  const reqTotal = requiredSubTasksHighCount + requiredSubTasksMediumCount + requiredSubTasksLowCount;
  const impTotal = importantSubTasksHighCount + importantSubTasksMediumCount + importantSubTasksLowCount;
  const extTotal = extendedSubTasksHighCount + extendedSubTasksMediumCount + extendedSubTasksLowCount;

  const totalHigh = requiredSubTasksHighCount + importantSubTasksHighCount + extendedSubTasksHighCount;
  const totalMedium = requiredSubTasksMediumCount + importantSubTasksMediumCount + extendedSubTasksMediumCount;
  const totalLow = requiredSubTasksLowCount + importantSubTasksLowCount + extendedSubTasksLowCount;

  const totalCount = reqTotal + impTotal + extTotal;
  const maxTotal = Math.max(reqTotal, impTotal, extTotal, 1);

  const getBoardUrl = (query: string = "") => {
    return shareToken
      ? `/shared/projects/${shareToken}/board${query}`
      : `/projects/${projectId}/board${query}`;
  };

  const getBarHeight = (total: number) => {
    return `${(total / maxTotal) * 80}%`;
  };

  return (
    <Card className="bg-white border border-slate-200/80 rounded-[6px] shadow-[0_1px_3px_rgba(9,30,66,0.12)] flex flex-col w-full">
      <CardHeader className="p-5 pb-3 border-b border-slate-100 dark:border-[#2c3338] flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#292a2e] dark:text-[#deebff]">Mức độ ưu tiên nhiệm vụ</h3>
        <span className="text-[10px] font-bold text-slate-500 dark:text-[#8c9bab] bg-slate-100 dark:bg-[#2c3338] px-2 py-0.5 rounded-full uppercase tracking-wider">
          {totalCount} nhiệm vụ
        </span>
      </CardHeader>
      
      <CardBody className="p-5 flex-1 flex flex-col justify-end min-h-[220px]">
        {/* Chart Area with Grid Lines */}
        <div className="relative h-40 border-b border-slate-200 dark:border-[#353e47] pb-2 px-4 w-full flex items-end justify-around">
          {/* Subtle horizontal grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-2">
            <div className="w-full border-t border-dashed border-slate-100/70 dark:border-[#2c3338]/50" />
            <div className="w-full border-t border-dashed border-slate-100/70 dark:border-[#2c3338]/50" />
            <div className="w-full border-t border-dashed border-slate-100/70 dark:border-[#2c3338]/50" />
            <div className="w-full" /> {/* Bottom axis */}
          </div>

          {/* Bar Required (BẮT BUỘC) */}
          <Link 
            href={getBoardUrl("?priority=Required")}
            className="h-full flex flex-col justify-end items-center w-16 group relative z-10 cursor-pointer block"
          >
            <div 
              style={{ height: getBarHeight(reqTotal) }} 
              className="w-10 flex flex-col min-h-[4px] relative rounded-t-[4px] overflow-hidden shadow-[0_2px_8px_rgba(239,68,68,0.1)] hover:shadow-[0_4px_12px_rgba(239,68,68,0.25)] transition-all duration-300 hover:-translate-y-[1px]"
            >
              {reqTotal > 0 && (
                <div 
                  className="bg-red-500 hover:bg-red-600 transition-colors flex-1"
                  title={`Bắt buộc: ${reqTotal} nhiệm vụ`}
                />
              )}

              {/* Count on top */}
              <span className="text-[11px] font-extrabold text-slate-700 dark:text-[#deebff] absolute -top-5.5 left-1/2 -translate-x-1/2 transition-transform group-hover:scale-110 pointer-events-none select-none">
                {reqTotal}
              </span>
            </div>
          </Link>

          {/* Bar Important (QUAN TRỌNG) */}
          <Link 
            href={getBoardUrl("?priority=Important")}
            className="h-full flex flex-col justify-end items-center w-16 group relative z-10 cursor-pointer block"
          >
            <div 
              style={{ height: getBarHeight(impTotal) }} 
              className="w-10 flex flex-col min-h-[4px] relative rounded-t-[4px] overflow-hidden shadow-[0_2px_8px_rgba(24,104,219,0.1)] hover:shadow-[0_4px_12px_rgba(24,104,219,0.25)] transition-all duration-300 hover:-translate-y-[1px]"
            >
              {impTotal > 0 && (
                <div 
                  className="bg-blue-500 hover:bg-blue-600 transition-colors flex-1"
                  title={`Quan trọng: ${impTotal} nhiệm vụ`}
                />
              )}

              {/* Count on top */}
              <span className="text-[11px] font-extrabold text-slate-700 dark:text-[#deebff] absolute -top-5.5 left-1/2 -translate-x-1/2 transition-transform group-hover:scale-110 pointer-events-none select-none">
                {impTotal}
              </span>
            </div>
          </Link>

          {/* Bar Extended (MỞ RỘNG) */}
          <Link 
            href={getBoardUrl("?priority=Extended")}
            className="h-full flex flex-col justify-end items-center w-16 group relative z-10 cursor-pointer block"
          >
            <div 
              style={{ height: getBarHeight(extTotal) }} 
              className="w-10 flex flex-col min-h-[4px] relative rounded-t-[4px] overflow-hidden shadow-[0_2px_8px_rgba(100,116,139,0.1)] hover:shadow-[0_4px_12px_rgba(100,116,139,0.25)] transition-all duration-300 hover:-translate-y-[1px]"
            >
              {extTotal > 0 && (
                <div 
                  className="bg-slate-500 hover:bg-slate-600 transition-colors flex-1"
                  title={`Mở rộng: ${extTotal} nhiệm vụ`}
                />
              )}

              {/* Count on top */}
              <span className="text-[11px] font-extrabold text-slate-700 dark:text-[#deebff] absolute -top-5.5 left-1/2 -translate-x-1/2 transition-transform group-hover:scale-110 pointer-events-none select-none">
                {extTotal}
              </span>
            </div>
          </Link>
        </div>

        {/* Labels Underneath */}
        <div className="flex justify-around pt-2.5 text-[10px] font-extrabold text-slate-500 dark:text-[#8c9bab] text-center uppercase tracking-wider select-none">
          <span className="w-16 text-[#ef4444] dark:text-red-400">Bắt buộc</span>
          <span className="w-16 text-[#1868db] dark:text-[#579dff]">Quan trọng</span>
          <span className="w-16 text-[#64748b] dark:text-[#8c9bab]">Mở rộng</span>
        </div>
      </CardBody>
    </Card>
  );
}
