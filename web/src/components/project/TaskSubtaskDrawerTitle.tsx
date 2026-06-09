"use client";

import * as React from "react";

/**
 * @component TaskSubtaskDrawerTitle
 * @description Trình chỉnh sửa tiêu đề công việc con trực tiếp (inline editor), xử lý chế độ chỉnh sửa, phím tắt và blur.
 */

interface TaskSubtaskDrawerTitleProps {
  title: string;
  isCompleted: boolean;
  onUpdateTitle: (title: string) => void;
  readOnly?: boolean;
}

export function TaskSubtaskDrawerTitle({
  title,
  isCompleted,
  onUpdateTitle,
  readOnly = false,
}: TaskSubtaskDrawerTitleProps) {
  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [titleInput, setTitleInput] = React.useState(title);

  React.useEffect(() => {
    setTitleInput(title);
    setIsEditingTitle(false);
  }, [title]);

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (titleInput.trim() && titleInput.trim() !== title) {
      onUpdateTitle(titleInput.trim());
    } else {
      setTitleInput(title);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleTitleBlur();
    } else if (e.key === "Escape") {
      setTitleInput(title);
      setIsEditingTitle(false);
    }
  };

  if (isEditingTitle) {
    return (
      <input
        type="text"
        value={titleInput}
        onChange={(e) => setTitleInput(e.target.value)}
        onBlur={handleTitleBlur}
        onKeyDown={handleTitleKeyDown}
        autoFocus
        className="w-full text-sm font-bold text-[#292a2e] dark:text-[#deebff] px-1.5 py-0.5 border border-[#1868db] dark:border-[#579dff] rounded bg-white dark:bg-[#22272b] focus:outline-none"
      />
    );
  }

  return (
    <h3
      onClick={() => !readOnly && setIsEditingTitle(true)}
      className={`text-sm font-bold text-[#292a2e] dark:text-[#deebff] leading-snug break-words whitespace-normal px-1 py-0.5 -ml-1 rounded border border-transparent transition-colors ${
        readOnly ? "cursor-default" : "hover:bg-slate-50 dark:hover:bg-[#2c3338] hover:border-slate-200 dark:hover:border-[#353e47] cursor-pointer"
      } ${isCompleted ? "line-through text-slate-400 dark:text-slate-500 font-medium" : ""}`}
    >
      {title}
    </h3>
  );
}
