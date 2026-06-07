"use client";

/**
 * @component GoBackButton
 * @description Nút "Quay lại" sử dụng window.history.back().
 * Tách thành Client Component riêng biệt để có thể dùng trong Server Components
 * (ví dụ: not-found.tsx).
 */
export function GoBackButton() {
  return (
    <button
      onClick={() => window.history.back()}
      className="inline-flex items-center gap-2 px-6 py-2.5 bg-white hover:bg-slate-50 text-[#292a2e] text-sm font-bold rounded-lg border border-slate-200 hover:border-slate-300 shadow-sm transition-all duration-200 cursor-pointer"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points="15 18 9 12 15 6" />
      </svg>
      Quay lại
    </button>
  );
}
