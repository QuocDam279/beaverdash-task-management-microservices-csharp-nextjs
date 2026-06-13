"use client";

import * as React from "react";

interface ToolCall {
  name: string;
  args: any;
}

interface ToolResult {
  name: string;
  result: string;
}

interface ToolCardProps {
  toolCall: ToolCall;
  toolResults: ToolResult[] | null;
}

export function AIAssistantToolCard({ toolCall, toolResults }: ToolCardProps) {
  const isTask = toolCall.name === "create_task";
  const result = toolResults?.find((r) => r.name === toolCall.name);
  const isCompleted = !!result;

  if (!isCompleted) {
    // Đang xử lý: hiển thị dòng nhỏ gọn với spinner
    return (
      <div className="my-1.5 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
        <svg className="animate-spin h-3 w-3 text-[#1868db] dark:text-[#579dff] shrink-0" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span>
          Đang tạo {isTask ? "công việc" : "nhiệm vụ"}: <strong className="text-slate-700 dark:text-slate-300">{toolCall.args.title}</strong>
        </span>
      </div>
    );
  }

  // Hoàn thành: hiển thị dòng gọn nhẹ với dấu tích xanh
  return (
    <div className="my-1 flex items-center gap-2 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="shrink-0 text-emerald-500 dark:text-emerald-400">
        <path d="M20 6L9 17l-5-5" />
      </svg>
      <span>
        Đã tạo {isTask ? "công việc" : "nhiệm vụ"}: <strong className="dark:text-[#deebff]">{toolCall.args.title}</strong>
      </span>
    </div>
  );
}
