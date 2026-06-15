"use client";

import * as React from "react";

export function ShowcaseGantt() {
  return (
    <div className="space-y-3 animate-fade-slide-up duration-300 text-left w-full text-slate-800">
      <div className="flex justify-between items-center px-1 text-xs">
        <span className="font-bold text-slate-700">Sơ đồ Tiến độ</span>
        <span className="text-[9px] bg-blue-50 text-blue-600 border border-blue-100 font-bold px-2 py-0.5 rounded">Sprint 1</span>
      </div>

      {/* Gantt Grid Container */}
      <div className="border border-slate-200/60 rounded-xl overflow-hidden bg-white/40 flex flex-col text-[10px]">
        {/* Timeline Header Row */}
        <div className="grid grid-cols-10 border-b border-slate-200/50 bg-slate-200/20 font-semibold text-slate-400 py-1.5 text-center">
          <div className="col-span-3 text-left pl-3 text-slate-500 font-bold">Nhiệm vụ</div>
          {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((dName, idx) => (
            <div key={idx} className="col-span-1 border-l border-slate-200/40 text-[9px] font-bold font-mono">{dName}</div>
          ))}
        </div>

        {/* Timeline Tasks Rows */}
        {[
          { name: "Xây dựng UI login", color: "from-blue-50 to-blue-100 text-blue-700 border-blue-200", start: 0, span: 3 },
          { name: "Thêm hoạt họa login", color: "from-amber-50 to-amber-100 text-amber-800 border-amber-200", start: 2, span: 3 },
          { name: "Tối ưu hóa Auth API", color: "from-purple-50 to-purple-100 text-purple-700 border-purple-200", start: 4, span: 4 },
        ].map((taskRow, idx) => (
          <div key={idx} className="grid grid-cols-10 border-b border-slate-200/40 last:border-b-0 py-3 relative items-center text-center min-h-[40px]">
            <div className="col-span-3 text-left pl-3 text-slate-700 font-bold truncate pr-1">{taskRow.name}</div>
            
            {/* Grid background markers */}
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="col-span-1 h-full border-l border-slate-200/30 absolute top-0 bottom-0 pointer-events-none" style={{ left: `${(3 + i) * 10}%` }} />
            ))}

            {/* Task Duration Bar */}
            <div
              className={`h-5 rounded-md border bg-gradient-to-r ${taskRow.color} flex items-center justify-center text-[7.5px] font-bold z-10 shadow-sm`}
              style={{
                gridColumnStart: 4 + taskRow.start,
                gridColumnEnd: 4 + taskRow.start + taskRow.span,
              }}
            >
              {taskRow.span} ngày
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
