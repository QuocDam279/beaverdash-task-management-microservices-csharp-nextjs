"use client";

/**
 * @component TaskDetailDescription
 * @description Inline description editor for a task. Saves on blur.
 */

import * as React from "react";

interface TaskDetailDescriptionProps {
  description: string | null;
  onUpdateDescription: (description: string) => void;
  readOnly?: boolean;
}

export function TaskDetailDescription({
  description,
  onUpdateDescription,
  readOnly,
}: TaskDetailDescriptionProps) {
  const [descriptionInput, setDescriptionInput] = React.useState(description || "");

  React.useEffect(() => {
    setDescriptionInput(description || "");
  }, [description]);

  const handleDescriptionBlur = () => {
    if (descriptionInput.trim() !== (description || "")) {
      onUpdateDescription(descriptionInput.trim());
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-[11px] font-bold text-[#6b6e76] dark:text-slate-400 uppercase tracking-wider block">
        Mô tả công việc
      </label>
      <textarea
        value={descriptionInput}
        onChange={(e) => setDescriptionInput(e.target.value)}
        onBlur={handleDescriptionBlur}
        readOnly={readOnly}
        placeholder={readOnly ? "Không có mô tả cho công việc này." : "Thêm mô tả chi tiết cho công việc này..."}
        className={`w-full h-32 px-3 py-2 text-xs border border-slate-200 dark:border-[#353e47] rounded-[4px] text-[#292a2e] dark:text-[#deebff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1868db] dark:focus-visible:ring-[#579dff] focus-visible:border-transparent transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 leading-relaxed resize-none ${
          readOnly ? "bg-slate-50 dark:bg-[#22272b]/50 text-slate-500 dark:text-slate-500 cursor-not-allowed focus-visible:ring-0 focus-visible:border-slate-200 dark:focus-visible:border-[#353e47]" : "bg-white dark:bg-[#22272b]"
        }`}
      />
    </div>
  );
}
