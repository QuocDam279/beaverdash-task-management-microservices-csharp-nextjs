"use client";

import * as React from "react";

export function ShowcaseCalendar() {
  return (
    <div className="space-y-3 animate-fade-slide-up duration-300 text-left w-full text-slate-800">
      <div className="flex justify-between items-center px-1 text-xs">
        <span className="font-bold text-slate-700">Tháng 6, 2026</span>
        <div className="flex gap-3 text-slate-400 text-[10px] font-bold select-none">
          <span className="cursor-pointer hover:text-slate-700">◀</span>
          <span className="cursor-pointer hover:text-slate-700">▶</span>
        </div>
      </div>
      
      {/* Compact Calendar Grid (7 columns for week, 3 rows for 21 days) */}
      <div className="grid grid-cols-7 gap-1.5 text-center text-[10px]">
        {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((dayName, idx) => (
          <span key={idx} className="text-slate-400 font-bold uppercase tracking-wider text-[8px]">{dayName}</span>
        ))}
        
        {Array.from({ length: 21 }).map((_, idx) => {
          const dayNum = idx + 1;
          return (
            <div
              key={idx}
              className="h-[52px] rounded-lg bg-white/70 border border-slate-200/50 p-1 flex flex-col justify-between items-start text-left min-w-[70px] hover:bg-white hover:border-slate-300 transition-all duration-200 shadow-[0_1px_3px_rgba(0,0,0,0.01)]"
            >
              <span className="text-slate-400 text-[8px] font-bold">{dayNum}</span>
              {dayNum === 4 && (
                <div className="w-full text-[7.5px] bg-blue-50 text-blue-600 border border-blue-100 font-bold p-0.5 rounded truncate leading-normal text-center animate-fade-slide-up">
                  UI Login
                </div>
              )}
              {dayNum === 9 && (
                <div className="w-full text-[7.5px] bg-amber-50 text-amber-700 border border-amber-100 font-bold p-0.5 rounded truncate leading-normal text-center animate-fade-slide-up">
                  Hoạt họa
                </div>
              )}
              {dayNum === 12 && (
                <div className="w-full text-[7.5px] bg-purple-50 text-purple-700 border border-purple-100 font-bold p-0.5 rounded truncate leading-normal text-center animate-fade-slide-up">
                  Auth API
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
