"use client";

/**
 * @component DocumentFileIcon
 * @description Renders a stylized SVG file icon based on the file extension name.
 */

import * as React from "react";

interface DocumentFileIconProps {
  fileName: string;
}

export function DocumentFileIcon({ fileName }: DocumentFileIconProps) {
  const ext = fileName.split(".").pop()?.toLowerCase();

  switch (ext) {
    case "pdf":
      return (
        <div className="p-2 rounded bg-rose-50 text-rose-500 border border-rose-100 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
      );
    case "doc":
    case "docx":
      return (
        <div className="p-2 rounded bg-blue-50 text-blue-500 border border-blue-100 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
      );
    case "xls":
    case "xlsx":
    case "csv":
      return (
        <div className="p-2 rounded bg-emerald-50 text-emerald-500 border border-emerald-100 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      );
    case "ppt":
    case "pptx":
      return (
        <div className="p-2 rounded bg-amber-50 text-amber-500 border border-amber-100 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21h8M12 17v4" />
          </svg>
        </div>
      );
    case "zip":
    case "rar":
    case "7z":
    case "tar":
    case "gz":
      return (
        <div className="p-2 rounded bg-purple-50 text-purple-500 border border-purple-100 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
        </div>
      );
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
    case "svg":
    case "webp":
      return (
        <div className="p-2 rounded bg-violet-50 text-violet-500 border border-violet-100 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      );
    case "txt":
    case "json":
    case "js":
    case "ts":
    case "tsx":
    case "css":
    case "html":
      return (
        <div className="p-2 rounded bg-slate-50 text-slate-500 border border-slate-100 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        </div>
      );
    default:
      return (
        <div className="p-2 rounded bg-gray-50 text-gray-400 border border-gray-100 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
      );
  }
}
