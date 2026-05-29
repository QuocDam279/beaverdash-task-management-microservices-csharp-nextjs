import * as React from "react";
import { getTaskPriorityLabel } from "./utils";

export interface ActionDetails {
  actionText: string;
  targetText: string;
  iconBg: string;
  icon: React.ReactNode;
}

export const getActionDetails = (
  actionType: string | null,
  entityType: string | null,
  newValue: string | null,
  oldValue?: string | null
): ActionDetails => {
  const act = actionType?.toLowerCase();
  const ent = entityType?.toLowerCase();

  let actionText = "đã tác động lên";
  let targetText = newValue || "hệ thống";
  let iconBg = "bg-slate-400";
  let icon = (
    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );

  let data: any = null;
  if (newValue) {
    try {
      data = JSON.parse(newValue);
    } catch {
      data = null;
    }
  }

  if (ent === "task") {
    if (act === "create" || act === "created") {
      actionText = "đã tạo mới đầu việc";
      targetText = data?.title ? `"${data.title}"` : "đầu việc";
      iconBg = "bg-[#1868db]";
    } else if (act === "assign" || act === "assigned") {
      actionText = "đã giao đầu việc";
      targetText = data ? `"${data.task_title}" cho ${data.assignee_name}` : "thành viên";
      iconBg = "bg-[#4f46e5]";
      icon = (
        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="8.5" cy="7" r="4" />
        </svg>
      );
    } else if (act === "moved") {
      actionText = "đã chuyển đầu việc";
      targetText = data ? `"${data.task_title}" từ cột "${data.old_column_name}" sang "${data.new_column_name}"` : "cột";
      iconBg = "bg-[#ffab00]";
      icon = (
        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      );
    } else if (act === "updated_title") {
      actionText = "đã đổi tên đầu việc";
      targetText = data ? `từ "${data.old_title}" thành "${data.title}"` : "tiêu đề";
      iconBg = "bg-blue-400";
      icon = (
        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      );
    } else if (act === "updated_description") {
      actionText = "đã cập nhật mô tả của đầu việc";
      targetText = data ? `"${data.title}"` : "";
      iconBg = "bg-blue-400";
      icon = (
        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" />
        </svg>
      );
    } else if (act === "updated_due_date") {
      actionText = "đã cập nhật hạn hoàn thành của đầu việc";
      const dateStr = data?.due_date ? new Date(data.due_date).toLocaleDateString("vi-VN") : "Chưa đặt";
      targetText = data ? `"${data.title}" thành ngày ${dateStr}` : "ngày";
      iconBg = "bg-blue-400";
      icon = (
        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      );
    } else if (act === "updated_start_date") {
      actionText = "đã cập nhật ngày bắt đầu của đầu việc";
      const dateStr = data?.start_date ? new Date(data.start_date).toLocaleDateString("vi-VN") : "Chưa đặt";
      targetText = data ? `"${data.title}" thành ngày ${dateStr}` : "ngày";
      iconBg = "bg-blue-400";
      icon = (
        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      );
    } else if (act === "updated_priority") {
      actionText = "đã cập nhật độ ưu tiên của đầu việc";
      if (data) {
        const oldP = data.old_priority ? getTaskPriorityLabel(data.old_priority) : null;
        const newP = data.priority ? getTaskPriorityLabel(data.priority) : "Không xác định";
        targetText = oldP ? `"${data.title}" từ "${oldP}" sang "${newP}"` : `"${data.title}" thành "${newP}"`;
      } else {
        targetText = "độ ưu tiên";
      }
      iconBg = "bg-blue-400";
      icon = (
        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 2L2 22h20L12 2z" />
        </svg>
      );
    } else if (act === "delete" || act === "deleted") {
      actionText = "đã đưa đầu việc vào thùng rác";
      targetText = data?.title ? `"${data.title}"` : "đầu việc";
      iconBg = "bg-red-500";
      icon = (
        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      );
    } else if (act === "restored") {
      actionText = "đã khôi phục đầu việc";
      targetText = data?.title ? `"${data.title}"` : "đầu việc";
      iconBg = "bg-[#10b981]";
      icon = (
        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <polyline points="23 4 23 10 17 10" />
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
        </svg>
      );
    } else if (act === "permanently_deleted") {
      actionText = "đã xóa vĩnh viễn đầu việc";
      targetText = data?.title ? `"${data.title}"` : "đầu việc";
      iconBg = "bg-red-600";
      icon = (
        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      );
    }
  } else if (ent === "subtask") {
    if (act === "create" || act === "created") {
      actionText = "đã tạo công việc con";
      targetText = data ? `"${data.title}" cho đầu việc "${data.parent_task_title}"` : "công việc con";
      iconBg = "bg-[#1868db]";
    } else if (act === "delete" || act === "deleted") {
      actionText = "đã xóa công việc con";
      targetText = data ? `"${data.title}" khỏi đầu việc "${data.parent_task_title}"` : "công việc con";
      iconBg = "bg-red-500";
      icon = (
        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      );
    } else if (act === "complete" || act === "completed" || act === "done") {
      actionText = "đã hoàn thành công việc con";
      targetText = data ? `"${data.title}" của đầu việc "${data.parent_task_title}"` : "công việc con";
      iconBg = "bg-[#10b981]";
      icon = (
        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      );
    } else if (act === "incomplete") {
      actionText = "đã mở lại công việc con";
      targetText = data ? `"${data.title}" của đầu việc "${data.parent_task_title}"` : "công việc con";
      iconBg = "bg-slate-400";
      icon = (
        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path d="M20 9.5A9 9 0 1 0 20.36 12H17" />
        </svg>
      );
    } else if (act === "assign" || act === "assigned") {
      actionText = "đã giao công việc con";
      targetText = data ? `"${data.title}" (của đầu việc "${data.parent_task_title}") cho ${data.assignee_name}` : "thành viên";
      iconBg = "bg-[#4f46e5]";
      icon = (
        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="8.5" cy="7" r="4" />
        </svg>
      );
    } else if (act === "updated_deadline") {
      actionText = "đã cập nhật hạn hoàn thành công việc con";
      const dateStr = data?.due_date ? new Date(data.due_date).toLocaleDateString("vi-VN") : "Chưa đặt";
      targetText = data ? `"${data.title}" (của đầu việc "${data.parent_task_title}") thành ngày ${dateStr}` : "ngày";
      iconBg = "bg-blue-400";
      icon = (
        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      );
    } else if (act === "updated_title") {
      actionText = "đã đổi tên công việc con";
      targetText = data ? `từ "${data.old_title}" thành "${data.title}" (của đầu việc "${data.parent_task_title}")` : "tên";
      iconBg = "bg-blue-400";
      icon = (
        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      );
    }
  } else if (ent === "comment") {
    if (act === "create" || act === "created") {
      actionText = "đã bình luận";
      targetText = data ? `"${data.content}" trong công việc con "${data.subtask_title}" (thuộc "${data.task_title}")` : "bình luận";
      iconBg = "bg-[#ffab00]";
      icon = (
        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      );
    }
  } else if (ent === "project") {
    if (act === "updated_name") {
      actionText = "đã cập nhật tên dự án";
      targetText = data ? `từ "${data.old_name}" thành "${data.name}"` : "tên dự án";
      iconBg = "bg-blue-500";
      icon = (
        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        </svg>
      );
    } else if (act === "updated_description") {
      actionText = "đã cập nhật mô tả của dự án";
      targetText = data ? `"${data.name}"` : "";
      iconBg = "bg-blue-500";
      icon = (
        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" />
        </svg>
      );
    } else if (act === "public_shared") {
      actionText = "đã chuyển dự án sang chế độ";
      targetText = "Công khai";
      iconBg = "bg-emerald-500";
      icon = (
        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 9.9-1" />
        </svg>
      );
    } else if (act === "private_restricted") {
      actionText = "đã chuyển dự án sang chế độ";
      targetText = "Riêng tư";
      iconBg = "bg-slate-500";
      icon = (
        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      );
    }
  } else if (ent === "projectdocument") {
    if (act === "upload") {
      actionText = "đã tải lên tài liệu";
      targetText = newValue ? `"${newValue}"` : "tài liệu";
      iconBg = "bg-emerald-500";
      icon = (
        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      );
    } else if (act === "delete") {
      actionText = "đã xóa tài liệu";
      targetText = oldValue ? `"${oldValue}"` : (newValue ? `"${newValue}"` : "tài liệu");
      iconBg = "bg-red-500";
      icon = (
        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      );
    }
  }

  return { actionText, targetText, iconBg, icon };
};
