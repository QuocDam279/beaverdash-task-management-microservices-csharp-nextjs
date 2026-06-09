"use client";

import * as React from "react";

interface CalendarToolbarProps {
  monthLabel: string;
  viewMode: "month" | "week";
  setViewMode: (mode: "month" | "week") => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

export function CalendarToolbar({
  monthLabel,
  viewMode,
  setViewMode,
  onPrev,
  onNext,
  onToday,
}: CalendarToolbarProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-[#2c3338] pb-4 shrink-0 select-none">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-bold text-[#292a2e] dark:text-[#deebff] tracking-tight min-w-[200px]">
          {monthLabel}
        </h2>
        <div className="flex items-center border border-slate-200 dark:border-[#353e47] rounded-[4px] bg-white dark:bg-[#22272b] overflow-hidden shadow-xs">
          <button
            onClick={onPrev}
            className="px-2.5 py-1.5 hover:bg-slate-100 dark:hover:bg-[#2c3338] active:bg-slate-200 dark:active:bg-[#353e47] text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-[#353e47] cursor-pointer flex items-center justify-center outline-none"
          >
            &lt;
          </button>
          <button
            onClick={onToday}
            className="px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-[#2c3338] active:bg-slate-200 dark:active:bg-[#353e47] text-xs font-bold text-[#292a2e] dark:text-[#deebff] border-r border-slate-200 dark:border-[#353e47] cursor-pointer outline-none"
          >
            Hôm nay
          </button>
          <button
            onClick={onNext}
            className="px-2.5 py-1.5 hover:bg-slate-100 dark:hover:bg-[#2c3338] active:bg-slate-200 dark:active:bg-[#353e47] text-slate-600 dark:text-slate-400 cursor-pointer flex items-center justify-center outline-none"
          >
            &gt;
          </button>
        </div>
      </div>
      <div className="flex border border-slate-200 dark:border-[#353e47] rounded-[4px] bg-white dark:bg-[#22272b] p-0.5 shadow-xs">
        <button
          onClick={() => setViewMode("month")}
          className={`px-3 py-1 text-xs font-bold rounded-[3px] cursor-pointer transition-colors outline-none ${
            viewMode === "month" ? "bg-[#1868db] dark:bg-[#579dff] text-white dark:text-[#1d2125]" : "text-[#505258] dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#2c3338]"
          }`}
        >
          Tháng
        </button>
        <button
          onClick={() => setViewMode("week")}
          className={`px-3 py-1 text-xs font-bold rounded-[3px] cursor-pointer transition-colors outline-none ${
            viewMode === "week" ? "bg-[#1868db] dark:bg-[#579dff] text-white dark:text-[#1d2125]" : "text-[#505258] dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#2c3338]"
          }`}
        >
          Tuần
        </button>
      </div>
    </div>
  );
}
