"use client";

/**
 * @component TaskDetailTitle
 * @description Inline editor for the task title. Handles edit mode, key triggers, and blurs.
 */

import * as React from "react";

interface TaskDetailTitleProps {
  title: string;
  onUpdateTitle: (title: string) => void;
  readOnly?: boolean;
}

export function TaskDetailTitle({ title, onUpdateTitle, readOnly }: TaskDetailTitleProps) {
  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [titleInput, setTitleInput] = React.useState(title);

  React.useEffect(() => {
    setTitleInput(title);
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
        className="w-full text-xl font-bold text-[#292a2e] px-2 py-1 border-2 border-[#1868db] rounded-[4px] bg-white focus:outline-none"
      />
    );
  }

  return (
    <h2
      onClick={() => !readOnly && setIsEditingTitle(true)}
      className={`text-xl font-bold text-[#292a2e] px-2 py-1 -ml-2 rounded-[4px] transition-colors border border-transparent ${
        readOnly ? "cursor-default" : "hover:bg-slate-50 cursor-pointer hover:border-slate-200"
      }`}
    >
      {title}
    </h2>
  );
}
