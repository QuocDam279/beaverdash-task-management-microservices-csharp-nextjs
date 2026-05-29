import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind classes dynamically
 * without style conflicts, combining clsx and tailwind-merge.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculates relative time from a date string.
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "Vừa xong";
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays === 1) return "Hôm qua";
  return `${diffDays} ngày trước`;
}

/**
 * Maps English task priority names to Vietnamese.
 * Valid values: "Required" (Bắt buộc), "Important" (Quan trọng), "Extended" (Mở rộng).
 */
export function getTaskPriorityLabel(priority: string | null | undefined): string {
  if (!priority) return "Không xác định";
  const p = priority.toLowerCase();
  if (p === "required") return "Bắt buộc";
  if (p === "important") return "Quan trọng";
  if (p === "extended") return "Mở rộng";
  return priority;
}

/**
 * Maps English subtask priority names to Vietnamese.
 * Valid values: "High" (Cao), "Medium" (Trung bình), "Low" (Thấp).
 */
export function getSubtaskPriorityLabel(priority: string | null | undefined): string {
  if (!priority) return "Không có";
  const p = priority.toLowerCase();
  if (p === "high") return "Cao";
  if (p === "medium") return "Trung bình";
  if (p === "low") return "Thấp";
  return priority;
}


