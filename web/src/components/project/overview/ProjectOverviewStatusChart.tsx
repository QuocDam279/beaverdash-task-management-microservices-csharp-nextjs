"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import type { ColumnStatusDto } from "@/types/api";

interface ProjectOverviewStatusChartProps {
  projectId: string;
  shareToken?: string;
  todoSubTasksCount?: number;
  inProgressSubTasksCount?: number;
  doneSubTasksCount?: number;
  columnStatusStats?: ColumnStatusDto[];
}

function useIsDark() {
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkTheme();
    window.addEventListener("theme-change", checkTheme);
    
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      window.removeEventListener("theme-change", checkTheme);
      observer.disconnect();
    };
  }, []);

  return isDark;
}

export function ProjectOverviewStatusChart({
  projectId,
  shareToken,
  todoSubTasksCount = 0,
  inProgressSubTasksCount = 0,
  doneSubTasksCount = 0,
  columnStatusStats
}: ProjectOverviewStatusChartProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  const isDark = useIsDark();

  const middleColors = ["#3b82f6", "#6366f1", "#a855f7", "#f59e0b", "#06b6d4", "#ec4899"];

  const statusItems = columnStatusStats && columnStatusStats.length > 0
    ? columnStatusStats.map((col, idx) => {
        let color = "#3b82f6";
        if (col.isDone) {
          color = "#10b981"; // Done is always green
        } else if (idx === 0) {
          color = "#94a3b8"; // Todo is always slate/gray
        } else {
          const colorIdx = (idx - 1) % middleColors.length;
          color = middleColors[colorIdx];
        }
        return {
          name: col.columnName,
          count: col.tasksCount,
          color: color
        };
      })
    : [
        { name: "Chưa thực hiện", count: todoSubTasksCount, color: "#94a3b8" },
        { name: "Đang thực hiện", count: inProgressSubTasksCount, color: "#3b82f6" },
        { name: "Đã hoàn thành", count: doneSubTasksCount, color: "#10b981" },
      ];

  const totalCount = statusItems.reduce((sum, item) => sum + item.count, 0);

  const getBoardUrl = (query: string = "") => {
    return shareToken
      ? `/shared/projects/${shareToken}/board${query}`
      : `/projects/${projectId}/board${query}`;
  };

  // Tính toán dải màu cho biểu đồ Donut
  let currentPercentage = 0;
  const gradientSlices: string[] = [];

  statusItems.forEach((item, idx) => {
    let color = item.color;
    if (hoveredIndex !== null && hoveredIndex !== idx) {
      color = `${color}40`; // Làm mờ các phân đoạn không được chọn
    }
    const percentage = totalCount > 0 ? (item.count / totalCount) * 100 : 0;
    const nextPercentage = currentPercentage + percentage;
    gradientSlices.push(`${color} ${currentPercentage.toFixed(2)}% ${nextPercentage.toFixed(2)}%`);
    currentPercentage = nextPercentage;
  });

  const conicGradientStyle = totalCount > 0 && gradientSlices.length > 0 ? {
    background: `conic-gradient(${gradientSlices.join(", ")})`
  } : {
    background: isDark ? "#2c3338" : "#f1f5f9"
  };

  return (
    <Card className="bg-white border border-slate-200/60 rounded-xl shadow-[0_2px_12px_rgba(11,20,38,0.04)] flex flex-col w-full transition-all duration-300 hover:shadow-[0_4px_20px_rgba(11,20,38,0.08)]">
      <CardHeader className="p-5 pb-4 border-b border-slate-100 dark:border-[#2c3338] flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800 dark:text-[#deebff] tracking-tight">Trạng thái công việc</h3>
        <span className="text-[11px] font-medium text-slate-400 dark:text-[#8c9bab] bg-slate-50 dark:bg-[#161a1d] px-2.5 py-1 rounded-md border border-slate-100 dark:border-[#2c3338]">
          Tổng quan
        </span>
      </CardHeader>
      
      <CardBody className="p-6 flex-1 flex flex-col md:flex-row items-center justify-center gap-8 lg:gap-12 min-h-[240px]">
        
        {/* Khung chứa Biểu đồ Tròn */}
        <Link href={getBoardUrl()} className="relative flex items-center justify-center shrink-0 group cursor-pointer block">
          <div className="absolute inset-0 rounded-full bg-slate-100 dark:bg-slate-800 scale-105 blur-[2px] opacity-0 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none" />
          
          <div 
            style={conicGradientStyle}
            className="h-44 w-44 rounded-full flex items-center justify-center relative shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] select-none transition-all duration-500 ease-out transform group-hover:scale-[1.02]"
          >
            <div className="h-[124px] w-[124px] rounded-full bg-white dark:bg-[#22272b] flex flex-col items-center justify-center text-center shadow-[0_4px_12px_rgba(0,0,0,0.04)] select-none gap-0.5">
              <span className="text-3xl font-black text-slate-800 dark:text-[#deebff] tracking-tighter transition-transform duration-300 group-hover:scale-110 leading-none">
                {totalCount}
              </span>
              <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-[#8c9bab] tracking-wider leading-none mt-1">
                nhiệm vụ
              </span>
            </div>
          </div>
        </Link>

        {/* Khung chứa Danh sách Chú thích (Legends) đã cải tiến */}
        <div className="relative flex-1 w-full md:w-auto h-[160px]">
          
          {/* Lớp phủ mờ (Fade Mask) phía trên và phía dưới để triệt tiêu cảm giác bị cắt cụt */}
          <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-white dark:from-[#22272b] to-transparent z-10 pointer-events-none opacity-80" />
          <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-white dark:from-[#22272b] to-transparent z-10 pointer-events-none opacity-80" />

          {/* Danh sách chính: Đã ẩn thanh scrollbar nhưng vẫn cuộn được mượt mà */}
          <div 
            className="w-full h-full overflow-y-auto pt-2 pb-2 pr-1 flex flex-col gap-1
                       [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {statusItems.map((item, idx) => {
              const color = item.color;
              const percentage = totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0;
              const isCurrentHovered = hoveredIndex === idx;
              const isAnyHovered = hoveredIndex !== null;

              return (
                <Link 
                  key={idx} 
                  href={getBoardUrl()}
                  className={`group/item flex flex-col gap-1 p-2 rounded-lg transition-all duration-200 cursor-pointer block
                    ${isCurrentHovered ? "bg-slate-50 dark:bg-[#2c3338] translate-x-1" : ""} 
                    ${isAnyHovered && !isCurrentHovered ? "opacity-45 blur-[0.2px]" : "opacity-100"}`}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div className="flex items-center justify-between text-xs font-semibold gap-4">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span 
                        className="h-2.5 w-2.5 rounded-full block shrink-0 transition-transform duration-300 group-hover/item:scale-125" 
                        style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}40` }}
                      />
                      <span className="text-slate-600 dark:text-[#deebff] font-medium truncate max-w-[140px]" title={item.name}>
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-slate-400 dark:text-[#8c9bab] text-[11px] font-normal">{percentage}%</span>
                      <span className="text-slate-800 dark:text-[#deebff] font-bold min-w-[16px] text-right">{item.count}</span>
                    </div>
                  </div>

                  {/* Thanh mini-progress bar ẩn phía dưới chạy mờ, tăng độ trực quan */}
                  <div className="w-full h-[3px] bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-0.5 opacity-60 group-hover/item:opacity-100 transition-opacity">
                    <div 
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{ 
                        width: `${percentage}%`, 
                        backgroundColor: color 
                      }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

      </CardBody>
    </Card>
  );
}