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
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4 shrink-0 select-none">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-bold text-[#292a2e] tracking-tight min-w-[200px]">
          {monthLabel}
        </h2>
        <div className="flex items-center border border-slate-200 rounded-[4px] bg-white overflow-hidden shadow-xs">
          <button
            onClick={onPrev}
            className="px-2.5 py-1.5 hover:bg-slate-100 active:bg-slate-200 text-slate-600 border-r border-slate-200 cursor-pointer flex items-center justify-center outline-none"
          >
            &lt;
          </button>
          <button
            onClick={onToday}
            className="px-3 py-1.5 hover:bg-slate-100 active:bg-slate-200 text-xs font-bold text-[#292a2e] border-r border-slate-200 cursor-pointer outline-none"
          >
            Hôm nay
          </button>
          <button
            onClick={onNext}
            className="px-2.5 py-1.5 hover:bg-slate-100 active:bg-slate-200 text-slate-600 cursor-pointer flex items-center justify-center outline-none"
          >
            &gt;
          </button>
        </div>
      </div>
      <div className="flex border border-slate-200 rounded-[4px] bg-white p-0.5 shadow-xs">
        <button
          onClick={() => setViewMode("month")}
          className={`px-3 py-1 text-xs font-bold rounded-[3px] cursor-pointer transition-colors outline-none ${
            viewMode === "month" ? "bg-[#1868db] text-white" : "text-[#505258] hover:bg-slate-100"
          }`}
        >
          Tháng
        </button>
        <button
          onClick={() => setViewMode("week")}
          className={`px-3 py-1 text-xs font-bold rounded-[3px] cursor-pointer transition-colors outline-none ${
            viewMode === "week" ? "bg-[#1868db] text-white" : "text-[#505258] hover:bg-slate-100"
          }`}
        >
          Tuần
        </button>
      </div>
    </div>
  );
}
