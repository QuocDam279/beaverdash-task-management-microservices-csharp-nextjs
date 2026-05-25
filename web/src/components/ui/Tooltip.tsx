import * as React from "react";

/**
 * Tooltip hiển thị khi hover vào icon trên sidebar thu gọn.
 * Vị trí: bên phải phần tử con, căn giữa theo trục dọc.
 */
export function SidebarTooltip({
  children,
  text,
}: {
  children: React.ReactNode;
  text: string;
}) {
  return (
    <div className="relative group w-full flex justify-center">
      {children}
      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-[11px] font-semibold rounded shadow-md pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
        {text}
        {/* Tooltip arrow */}
        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900" />
      </div>
    </div>
  );
}

/**
 * Tooltip hiển thị khi hover vào tên dự án dài trong sidebar mở rộng.
 * Vị trí: bên phải phần tử con, căn giữa theo trục dọc.
 */
export function ProjectTooltip({
  children,
  text,
}: {
  children: React.ReactNode;
  text: string;
}) {
  return (
    <div className="relative group w-full">
      {children}
      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-[11px] font-semibold rounded shadow-md pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
        {text}
        {/* Tooltip arrow */}
        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900" />
      </div>
    </div>
  );
}
