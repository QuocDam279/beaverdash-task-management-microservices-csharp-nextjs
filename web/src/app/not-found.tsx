import Link from "next/link";
import { GoBackButton } from "@/components/ui/GoBackButton";

/**
 * @page NotFoundPage
 * @description Trang 404 toàn cục. Hiển thị giao diện thân thiện khi người dùng
 * truy cập một URL không tồn tại.
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30 relative overflow-hidden select-none">
      {/* Ambient decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[15%] left-[10%] w-72 h-72 rounded-full bg-blue-100/30 blur-3xl animate-drift-one" />
        <div className="absolute bottom-[10%] right-[8%] w-96 h-96 rounded-full bg-indigo-100/20 blur-3xl animate-drift-two" />
        <div className="absolute top-[60%] left-[55%] w-48 h-48 rounded-full bg-amber-100/20 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg">
        {/* 404 Large Number */}
        <div className="relative mb-6">
          <span className="text-[160px] sm:text-[200px] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-slate-200 via-slate-300 to-slate-200 select-none">
            404
          </span>
          {/* Floating icon overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-float-fast">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" className="text-[#1868db] drop-shadow-lg">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <path d="M9 9h.01M15 9h.01" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              </svg>
            </div>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#292a2e] tracking-tight mb-3">
          Trang không tồn tại
        </h1>

        {/* Description */}
        <p className="text-sm text-[#505258] leading-relaxed max-w-md mb-8">
          Rất tiếc, trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển sang địa chỉ khác.
          Hãy kiểm tra lại đường dẫn hoặc quay về trang chủ.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/tasks"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1868db] hover:bg-[#0052cc] text-white text-sm font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Về trang chủ
          </Link>
          <GoBackButton />
        </div>

        {/* Footer hint */}
        <p className="text-[10px] text-slate-400 mt-10 uppercase tracking-widest font-semibold">
          BeaverDash · Quản lý dự án
        </p>
      </div>
    </div>
  );
}
