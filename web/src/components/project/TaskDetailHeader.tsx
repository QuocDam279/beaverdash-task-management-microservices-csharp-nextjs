"use client";

/**
 * @component TaskDetailHeader
 * @description Header of the Task Detail Modal, displaying project path, task code, and close button.
 */

import * as React from "react";

interface TaskDetailHeaderProps {
  onClose: () => void;
  onDelete?: () => void;
}

export function TaskDetailHeader({ onClose, onDelete }: TaskDetailHeaderProps) {
  return (
    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-[#fafbfc]">
      <div className="flex items-center gap-2 text-xs font-semibold text-[#505258]">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className="text-[#1868db]"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M9 3v18M15 3v18" />
        </svg>
        <span>DỰ ÁN</span>
        <span>/</span>
        <span className="text-[#1868db]">CÔNG VIỆC</span>
      </div>
      
      <div className="flex items-center gap-3">
        {onDelete && (
          <button
            onClick={onDelete}
            className="text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer px-2 py-1 rounded transition-colors flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider border border-red-100"
            title="Xóa công việc"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
            <span>Xóa</span>
          </button>
        )}
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 cursor-pointer p-1.5 rounded-full hover:bg-slate-100 transition-colors"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
