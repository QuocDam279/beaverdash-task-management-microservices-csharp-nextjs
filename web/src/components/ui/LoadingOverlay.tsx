"use client";

import * as React from "react";

interface LoadingOverlayProps {
  isOpen: boolean;
  message?: string;
}

export function LoadingOverlay({ isOpen, message = "Đang xử lý..." }: LoadingOverlayProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/15 backdrop-blur-xs flex items-center justify-center z-[9999] p-4 select-none animate-in fade-in duration-200">
      <div className="bg-white/95 border border-slate-200/50 shadow-2xl rounded-xl p-6 max-w-xs w-full flex flex-col items-center gap-4 text-center animate-in zoom-in-95 duration-200">
        <div className="relative flex items-center justify-center">
          {/* Animated Spinner with Gradient effect */}
          <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-[#1868db] border-r-[#1868db]/30 animate-spin" />
          {/* Subtle central dot */}
          <div className="absolute w-2.5 h-2.5 rounded-full bg-[#1868db]" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-bold text-slate-800">{message}</p>
          <p className="text-[11px] font-semibold text-slate-400">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    </div>
  );
}
