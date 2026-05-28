"use client";

/**
 * @component MyTasksStats
 * @description Hiển thị các thẻ thống kê tổng quan về công việc (Tổng số, Quá hạn, Đã hoàn thành).
 */

import * as React from "react";

interface MyTasksStatsProps {
  stats: {
    total: number;
    overdue: number;
    done: number;
  };
}

export function MyTasksStats({ stats }: MyTasksStatsProps) {
  const cards = [
    {
      label: "Tổng công việc",
      value: stats.total,
      bg: "bg-blue-500/10 text-[#1868db]",
      icon: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="8" y1="6" x2="21" y2="6"></line>
          <line x1="8" y1="12" x2="21" y2="12"></line>
          <line x1="8" y1="18" x2="21" y2="18"></line>
          <line x1="3" y1="6" x2="3.01" y2="6"></line>
          <line x1="3" y1="12" x2="3.01" y2="12"></line>
          <line x1="3" y1="18" x2="3.01" y2="18"></line>
        </svg>
      ),
    },
    {
      label: "Quá hạn",
      value: stats.overdue,
      bg: "bg-rose-500/10 text-rose-600",
      warn: stats.overdue > 0,
      icon: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      ),
    },
    {
      label: "Đã hoàn thành",
      value: stats.done,
      bg: "bg-emerald-500/10 text-emerald-600",
      icon: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {cards.map((c, i) => (
        <div
          key={i}
          className="bg-white border border-slate-200/60 rounded-lg p-3 shadow-2xs flex items-center justify-between hover:shadow-xs transition-shadow duration-200"
        >
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              {c.label}
            </p>
            <h2
              className={`text-lg font-black mt-0.5 ${
                c.warn ? "text-red-600 animate-pulse" : "text-[#292a2e]"
              }`}
            >
              {c.value}
            </h2>
          </div>
          <div
            className={`h-8 w-8 rounded-[4px] flex items-center justify-center ${c.bg}`}
          >
            {c.icon}
          </div>
        </div>
      ))}
    </div>
  );
}
