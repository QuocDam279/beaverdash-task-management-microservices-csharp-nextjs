"use client";

import * as React from "react";
import { downloadProjectTemplate } from "@/lib/templateGenerator";

interface SuggestionItem {
  label: string;
  prompt?: string;
  href?: string;
  download?: string;
  icon: React.ReactNode;
}

interface QuickSuggestionsProps {
  projectId: string;
  isLeader: boolean;
  isSending: boolean;
  onSuggestionClick: (promptText: string) => void;
}

export function AIAssistantQuickSuggestions({
  projectId,
  isLeader,
  isSending,
  onSuggestionClick,
}: QuickSuggestionsProps) {
  if (isSending) return null;

  const leaderSuggestions: SuggestionItem[] = [
    {
      label: "Tiến độ dự án",
      prompt: "Tiến độ tổng quan của dự án hiện tại như thế nào?",
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
    },
    {
      label: "Sắp đến hạn",
      prompt: "Các công việc và nhiệm vụ sắp đến hạn trong 7 ngày tới là gì?",
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    {
      label: "Khối lượng thành viên",
      prompt: "Phân tích khối lượng công việc của từng thành viên trong dự án",
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      label: "Lịch sử hoạt động",
      prompt: "Lịch sử hoạt động của dự án hôm nay là gì?",
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
    },
    {
      label: "Tải file mẫu kế hoạch",
      href: "/templates/project_plan_template.docx",
      download: "Mau_Ke_Hoach_Du_An_Nhom_BeaverDash.docx",
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      ),
    },
  ];

  const memberSuggestions: SuggestionItem[] = [
    {
      label: "Công việc được giao",
      prompt: "Danh sách công việc được giao cho tôi là gì?",
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
          <line x1="9" y1="9" x2="15" y2="9" />
          <line x1="9" y1="13" x2="15" y2="13" />
          <line x1="9" y1="17" x2="14" y2="17" />
        </svg>
      ),
    },
    {
      label: "Nhiệm vụ sắp đến hạn của tôi",
      prompt: "Các nhiệm vụ sắp đến hạn của tôi trong 7 ngày tới là gì?",
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    {
      label: "Tiến độ dự án",
      prompt: "Tiến độ tổng quan của dự án hiện tại như thế nào?",
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
    },
    {
      label: "Hoạt động gần đây",
      prompt: "Lịch sử hoạt động của dự án hôm nay là gì?",
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
    },
  ];

  const items = isLeader ? leaderSuggestions : memberSuggestions;

  return (
    <div className="w-full bg-white dark:bg-[#1d2125] border-t border-slate-100/80 dark:border-[#2c3338]/80 shrink-0">
      <div className="max-w-3xl mx-auto w-full px-4 py-2 flex items-center gap-1.5 select-none overflow-x-auto scrollbar-none">
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0 mr-1">
          Gợi ý:
        </span>
        {items.map((item, idx) => {
          const key = `suggest-${idx}`;
          const baseStyle =
            "inline-flex items-center gap-1.5 px-2.5 py-1.25 rounded-lg border text-[11px] font-bold transition-all shrink-0 cursor-pointer no-underline select-none";

          if (item.href) {
            // It's a template download button
            return (
              <a
                key={key}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  downloadProjectTemplate(projectId);
                }}
                className={`${baseStyle} border-emerald-200/80 dark:border-emerald-950 bg-emerald-50/40 dark:bg-emerald-950/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:border-emerald-300 dark:hover:border-emerald-700/50`}
              >
                {item.icon}
                <span>{item.label}</span>
              </a>
            );
          }

          // It's a standard quick message prompt
          return (
            <button
              key={key}
              onClick={() => item.prompt && onSuggestionClick(item.prompt)}
              className={`${baseStyle} border-slate-200 dark:border-[#353e47] bg-white dark:bg-[#22272b] text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-[#2c3338] hover:border-slate-300 dark:hover:border-slate-500`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
