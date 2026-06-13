"use client";

import * as React from "react";

/**
 * @page ErrorPage
 * @description Error Boundary toàn cục. Bắt mọi lỗi runtime bất ngờ xảy ra
 * bên trong các route con (ngoại trừ root layout).
 * Hiển thị giao diện lỗi thân thiện với nút thử lại và quay về trang chủ.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Uncaught Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-red-50/20 relative overflow-hidden select-none">
      {/* Ambient decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] left-[12%] w-64 h-64 rounded-full bg-red-100/25 blur-3xl animate-drift-one" />
        <div className="absolute bottom-[15%] right-[10%] w-80 h-80 rounded-full bg-orange-100/20 blur-3xl animate-drift-two" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg">
        {/* Error Icon */}
        <div className="mb-6 relative">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 border border-red-100 flex items-center justify-center shadow-lg">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" className="text-red-500">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
              <path d="M12 8v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <circle cx="12" cy="16" r="1" fill="currentColor" />
            </svg>
          </div>
          {/* Pulse ring */}
          <div className="absolute inset-0 w-24 h-24 rounded-2xl border-2 border-red-200/50 animate-ping opacity-30" />
        </div>

        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#292a2e] tracking-tight mb-3">
          Đã xảy ra lỗi
        </h1>

        {/* Description */}
        <p className="text-sm text-[#505258] leading-relaxed max-w-md mb-3">
          Rất tiếc, hệ thống gặp phải sự cố không mong muốn. Vui lòng thử tải lại trang hoặc quay về trang chủ.
        </p>

        {/* Error details (collapsible) */}
        {error?.message && (
          <details className="w-full max-w-md mb-6 group">
            <summary className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider cursor-pointer hover:text-slate-600 transition-colors flex items-center justify-center gap-1.5">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transition-transform group-open:rotate-90">
                <polyline points="9 18 15 12 9 6" />
              </svg>
              Chi tiết lỗi
            </summary>
            <div className="mt-2 p-3 rounded-lg bg-slate-50 border border-slate-200 text-left">
              <code className="text-[11px] text-red-600 font-mono break-all leading-relaxed">
                {error.message}
              </code>
              {error.digest && (
                <p className="text-[10px] text-slate-400 mt-2 font-mono">
                  Digest: {error.digest}
                </p>
              )}
            </div>
          </details>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1868db] hover:bg-[#0052cc] text-white text-sm font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            Thử lại
          </button>
          <a
            href="/tasks"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-white hover:bg-slate-50 text-[#292a2e] text-sm font-bold rounded-lg border border-slate-200 hover:border-slate-300 shadow-sm transition-all duration-200"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Về trang chủ
          </a>
        </div>

        {/* Footer hint */}
        <p className="text-[10px] text-slate-400 mt-10 uppercase tracking-widest font-semibold">
          BeaverDash · Quản lý dự án
        </p>
      </div>
    </div>
  );
}
