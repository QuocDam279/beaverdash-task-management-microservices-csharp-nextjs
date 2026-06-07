"use client";

import * as React from "react";
import Link from "next/link";

/**
 * @page DashboardError
 * @description Error Boundary dành riêng cho khu vực Dashboard.
 * Bắt các lỗi runtime xảy ra bên trong các trang dashboard (tasks, projects, teams, ...),
 * trong khi vẫn giữ nguyên Sidebar và TopHeader ở layout cha.
 * Thiết kế tối giản, phù hợp với bố cục nội dung chính.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Dashboard Error:", error);
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center p-8 bg-white min-h-full select-none">
      <div className="flex flex-col items-center text-center max-w-md">
        {/* Error Icon */}
        <div className="mb-5 relative">
          <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-red-50 to-orange-50 border border-red-100 flex items-center justify-center shadow-md">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" className="text-red-500">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
              <path d="M12 9v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <circle cx="12" cy="17" r="1" fill="currentColor" />
            </svg>
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-xl font-extrabold text-[#292a2e] tracking-tight mb-2">
          Trang gặp sự cố
        </h2>

        {/* Description */}
        <p className="text-xs text-[#505258] leading-relaxed mb-3">
          Nội dung bạn đang truy cập gặp lỗi không mong muốn. Bạn có thể thử tải lại hoặc quay về trang công việc.
        </p>

        {/* Error details */}
        {error?.message && (
          <details className="w-full mb-5 group">
            <summary className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider cursor-pointer hover:text-slate-600 transition-colors flex items-center justify-center gap-1.5">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transition-transform group-open:rotate-90">
                <polyline points="9 18 15 12 9 6" />
              </svg>
              Chi tiết lỗi
            </summary>
            <div className="mt-2 p-3 rounded-lg bg-slate-50 border border-slate-200 text-left">
              <code className="text-[10px] text-red-600 font-mono break-all leading-relaxed">
                {error.message}
              </code>
              {error.digest && (
                <p className="text-[9px] text-slate-400 mt-1.5 font-mono">
                  Digest: {error.digest}
                </p>
              )}
            </div>
          </details>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-5 py-2 bg-[#1868db] hover:bg-[#0052cc] text-white text-xs font-bold rounded-[4px] shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            Thử lại
          </button>
          <Link
            href="/tasks"
            className="inline-flex items-center gap-2 px-5 py-2 bg-white hover:bg-slate-50 text-[#292a2e] text-xs font-bold rounded-[4px] border border-slate-200 hover:border-slate-300 shadow-2xs transition-all duration-200"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
