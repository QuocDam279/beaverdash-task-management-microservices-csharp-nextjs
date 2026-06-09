"use client";

import * as React from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { api } from "@/lib/api";
import { 
  getActionDetails, 
  groupActivities, 
  getActionColorClass, 
  getSubtaskChangeDetail 
} from "@/lib/timelineHelper";

interface ActivityHistoryModalProps {
  projectId?: string;
  shareToken?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ActivityHistoryModal({ projectId, shareToken, isOpen, onClose }: ActivityHistoryModalProps) {
  const [activities, setActivities] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const [selectedUser, setSelectedUser] = React.useState<string>("all");
  const [selectedDate, setSelectedDate] = React.useState<string>("");
  const [teamMembers, setTeamMembers] = React.useState<any[]>([]);
  const [expandedGroups, setExpandedGroups] = React.useState<Record<string, boolean>>({});

  const toggleGroup = (groupId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  React.useEffect(() => {
    if (!isOpen) {
      setSelectedUser("all");
      setSelectedDate("");
      setPage(1);
      return;
    }

    const fetchTeamMembers = async () => {
      try {
        const overview = shareToken
          ? await api.get(`/shared/projects/${shareToken}/overview`)
          : await api.get(`/projects/${projectId}/overview`);

        if (overview?.memberWorkloads) {
          setTeamMembers(overview.memberWorkloads.map((m: any) => ({
            id: m.userId,
            displayName: m.displayName,
            avatar: m.avatar,
          })));
        } else if (overview?.teamId) {
          const team = await api.get(`/teams/${overview.teamId}`);
          if (team?.members) {
            setTeamMembers(team.members.map((m: any) => ({
              id: m.userId,
              displayName: m.displayName,
              avatar: m.avatar,
            })));
          }
        }
      } catch (err) {
        console.error("Failed to fetch team members for activity history:", err);
      }
    };
    fetchTeamMembers();
  }, [projectId, shareToken, isOpen]);

  React.useEffect(() => {
    if (!isOpen) return;

    const fetchActivities = async () => {
      try {
        setIsLoading(true);
        let url = shareToken
          ? `/shared/projects/${shareToken}/activities?page=${page}&pageSize=50`
          : `/projects/${projectId}/activities?page=${page}&pageSize=50`;
        if (selectedUser !== "all") {
          url += `&userId=${selectedUser}`;
        }
        if (selectedDate) {
          url += `&date=${selectedDate}`;
        }
        const data = await api.get(url);
        setActivities(data || []);
        setHasMore(!!(data && data.length === 50));
      } catch (err) {
        console.error("Failed to load project activities:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, [projectId, isOpen, page, selectedUser, selectedDate]);

  const formatEventTime = (isoString: string) => {
    const date = new Date(isoString);
    const options: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };
    const timeStr = date.toLocaleTimeString("vi-VN", options);
    return `${date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}, ${timeStr}`;
  };

  const displayActivities = React.useMemo(() => {
    return groupActivities(activities);
  }, [activities]);

  const renderActivityContent = (event: any) => {
    let taskId: string | null = null;
    if (event.isGroup) {
      try {
        taskId = JSON.parse(event.items[0].newValue)?.task_id || null;
      } catch {}
    } else {
      if (event.entityType?.toLowerCase() === "task") {
        taskId = event.entityId;
      } else if (event.newValue) {
        try {
          const data = JSON.parse(event.newValue);
          taskId = data.task_id || null;
        } catch {}
      }
    }

    const href = taskId 
      ? (shareToken 
          ? `/shared/projects/${shareToken}/board?taskId=${taskId}` 
          : `/projects/${projectId}/board?taskId=${taskId}`)
      : null;

    if (event.isGroup) {
      const actionColor = getActionColorClass(event.actionType, "subtask");
      const count = event.items.length;
      const isExpanded = !!expandedGroups[event.id];

      const act = event.actionType?.toLowerCase() || "";
      let actionStr = "đã cập nhật";
      if (act === "create" || act === "created") actionStr = "đã tạo";
      else if (act === "delete" || act === "deleted") actionStr = "đã xóa";
      else if (act === "complete" || act === "completed" || act === "done") actionStr = "đã hoàn thành";
      else if (act === "incomplete") actionStr = "đã mở lại";
      else if (act === "assign" || act === "assigned") actionStr = "đã giao";
      else if (act === "updated_deadline") actionStr = "đã cập nhật hạn hoàn thành cho";
      else if (act === "updated_title") actionStr = "đã đổi tên";

      const { iconBg, icon } = getActionDetails(event.actionType, "subtask", event.items[0].newValue, event.items[0].oldValue);

      return (
        <div key={event.id} className="relative text-xs block group pl-2">
          {/* Avatar with Overlay Action Badge */}
          <div className="absolute -left-[33px] top-0.5 h-6 w-6 rounded-full bg-slate-100 dark:bg-[#161a1d] ring-4 ring-white dark:ring-[#22272b] flex items-center justify-center z-10 select-none">
            <Avatar src={event.avatar} alt={event.displayName} className="h-full w-full rounded-full object-cover" />
            <span className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full flex items-center justify-center ${iconBg} ring-2 ring-white dark:ring-[#22272b] shadow-xs`}>
              {React.cloneElement(icon as any, { className: "h-2 w-2 text-white" })}
            </span>
          </div>

          <div className="flex flex-col gap-0.5 pl-2">
            <div className="flex items-center justify-between gap-2">
              <div className="text-slate-500 dark:text-[#8c9bab] font-semibold leading-relaxed">
                <span className="text-[#292a2e] dark:text-[#deebff] font-bold">{event.displayName}</span>{" "}
                <span className={actionColor}>{actionStr}</span>{" "}
                <span className="text-[#1868db] dark:text-[#579dff] font-bold">{count} công việc con</span>{" "}
                của đầu việc{" "}
                {href ? (
                  <Link href={href} onClick={onClose} className="text-[#1868db] dark:text-[#579dff] font-bold hover:underline">
                    '{event.parentTaskTitle}'
                  </Link>
                ) : (
                  <span className="text-slate-700 dark:text-[#deebff] font-semibold">'{event.parentTaskTitle}'</span>
                )}
              </div>
              <button
                onClick={(e) => toggleGroup(event.id, e)}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#2c3338] text-slate-400 dark:text-[#8c9bab] hover:text-slate-700 dark:hover:text-[#deebff] transition-colors cursor-pointer shrink-0 border-0 bg-transparent"
                title={isExpanded ? "Thu gọn" : "Xem chi tiết"}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={`transform transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            </div>
            
            <span className="text-[10px] text-slate-400 dark:text-[#8c9bab] font-semibold w-fit mt-0.5 select-none">
              {formatEventTime(event.createdAt)}
            </span>

            {isExpanded && (
              <div className="mt-2.5 ml-1 pl-3 border-l-2 border-slate-200 dark:border-[#353e47] space-y-1.5 py-1 text-[11px] text-slate-500 dark:text-[#8c9bab] font-medium animate-in slide-in-from-top-1 duration-200">
                {event.items.map((item: any) => {
                  const detail = getSubtaskChangeDetail(event.actionType, item.newValue);
                  return (
                    <div key={item.id} className="flex items-center justify-between gap-4 py-0.5 pr-2">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-[#8c9bab] shrink-0" />
                        <span className="text-slate-700 dark:text-[#deebff] font-semibold truncate">{item.subtaskTitle}</span>
                        {detail && <span className="text-slate-400 dark:text-slate-500 italic font-normal">({detail})</span>}
                      </div>
                      <span className="text-[9px] text-slate-450 dark:text-[#8c9bab] shrink-0 font-semibold bg-slate-50 dark:bg-[#161a1d] border border-slate-100 dark:border-[#2c3338] px-1.5 py-0.5 rounded-sm select-none">
                        {new Date(item.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false })}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      );
    } else {
      const { actionText, targetText, iconBg, icon } = getActionDetails(event.actionType, event.entityType, event.newValue, event.oldValue);
      const actionColor = getActionColorClass(event.actionType, event.entityType);

      return (
        <div key={event.id} className="relative text-xs block group pl-2">
          {/* Avatar with Overlay Action Badge */}
          <div className="absolute -left-[33px] top-0.5 h-6 w-6 rounded-full bg-slate-100 dark:bg-[#161a1d] ring-4 ring-white dark:ring-[#22272b] flex items-center justify-center z-10">
            <Avatar
              src={event.avatar}
              alt={event.displayName}
              className="h-full w-full rounded-full object-cover"
            />
            <span className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full flex items-center justify-center ${iconBg} ring-2 ring-white dark:ring-[#22272b] shadow-xs`}>
              {React.cloneElement(icon as any, { className: "h-2 w-2 text-white" })}
            </span>
          </div>

          {/* Event Content */}
          <div className="flex flex-col gap-0.5 pl-2">
            <div className="text-slate-500 dark:text-[#8c9bab] font-semibold leading-relaxed">
              <span className="text-[#292a2e] dark:text-[#deebff] font-bold">{event.displayName}</span>{" "}
              <span className={actionColor}>{actionText}</span>{" "}
              {href ? (
                <Link href={href} onClick={onClose} className="text-[#1868db] dark:text-[#579dff] font-bold hover:underline">
                  {targetText}
                </Link>
              ) : (
                <span className="text-slate-700 dark:text-[#deebff] font-semibold">{targetText}</span>
              )}
            </div>
            <span className="text-[10px] text-slate-400 dark:text-[#8c9bab] font-semibold">
              {formatEventTime(event.createdAt)}
            </span>
          </div>
        </div>
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#091e42]/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none">
      <div className="bg-white dark:bg-[#22272b] rounded-lg border border-slate-200 dark:border-[#353e47] shadow-2xl w-full max-w-2xl h-[70vh] flex flex-col animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-[#2c3338] flex items-center justify-between shrink-0">
          <h3 className="text-sm font-bold text-[#292a2e] dark:text-[#deebff]">Lịch sử hoạt động dự án</h3>
          <button
            onClick={onClose}
            className="text-slate-400 dark:text-[#8c9bab] hover:text-slate-600 dark:hover:text-[#deebff] p-1 rounded-full hover:bg-slate-50 dark:hover:bg-[#2c3338] transition-colors cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Filters Toolbar */}
        <div className="px-5 py-3 border-b border-slate-100 dark:border-[#2c3338] bg-slate-50/20 dark:bg-[#161a1d]/40 flex flex-wrap items-center gap-4 shrink-0">
          {/* User selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 dark:text-[#8c9bab] font-semibold">Người thực hiện:</span>
            <select
              value={selectedUser}
              onChange={(e) => { setSelectedUser(e.target.value); setPage(1); }}
              className="px-2.5 py-1 text-xs border border-slate-200 dark:border-[#353e47] rounded-[4px] bg-white dark:bg-[#1d2125] text-slate-700 dark:text-[#deebff] font-medium focus:outline-none focus:ring-1 focus:ring-[#1868db]"
            >
              <option value="all">Tất cả thành viên</option>
              {teamMembers.map((m) => (
                <option key={m.id} value={m.id}>{m.displayName}</option>
              ))}
            </select>
          </div>

          {/* Date Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 dark:text-[#8c9bab] font-semibold">Ngày hoạt động:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => { setSelectedDate(e.target.value); setPage(1); }}
              className="px-2.5 py-1 text-xs border border-slate-200 dark:border-[#353e47] rounded-[4px] bg-white dark:bg-[#1d2125] text-slate-700 dark:text-[#deebff] font-medium focus:outline-none focus:ring-1 focus:ring-[#1868db] cursor-pointer"
            />
          </div>

          {/* Clear Button */}
          {(selectedUser !== "all" || selectedDate) && (
            <button
              onClick={() => {
                setSelectedUser("all");
                setSelectedDate("");
                setPage(1);
              }}
              className="text-xs font-bold text-[#1868db] dark:text-[#579dff] hover:text-[#0052cc] dark:hover:text-blue-400 px-2 py-1 cursor-pointer transition-colors"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {isLoading ? (
            <div className="h-full flex items-center justify-center py-20">
              <svg className="animate-spin h-6 w-6 text-[#1868db] dark:text-[#579dff]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          ) : displayActivities.length > 0 ? (
            <div className="relative pl-6 border-l border-slate-150 dark:border-[#2c3338] space-y-6">
              {displayActivities.map(renderActivityContent)}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400 dark:text-[#8c9bab] font-semibold py-8 text-center">
              Chưa có hoạt động nào được ghi nhận
            </div>
          )}
        </div>

        {/* Footer Pagination Controls */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-[#2c3338] flex items-center justify-between bg-slate-50/50 dark:bg-[#161a1d]/50 text-xs font-semibold text-[#505258] dark:text-[#a5adba] shrink-0">
          <button
            type="button"
            disabled={page === 1 || isLoading}
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            className="px-3 py-1.5 rounded border border-slate-200 dark:border-[#353e47] bg-white dark:bg-[#22272b] hover:bg-slate-50 dark:hover:bg-[#2c3338] disabled:opacity-50 disabled:hover:bg-white dark:disabled:hover:bg-[#22272b] text-slate-600 dark:text-[#deebff] transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            Trang trước
          </button>
          <span className="text-slate-500 dark:text-[#deebff] font-bold">Trang {page}</span>
          <button
            type="button"
            disabled={!hasMore || isLoading}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 rounded border border-slate-200 dark:border-[#353e47] bg-white dark:bg-[#22272b] hover:bg-slate-50 dark:hover:bg-[#2c3338] disabled:opacity-50 disabled:hover:bg-white dark:disabled:hover:bg-[#22272b] text-slate-600 dark:text-[#deebff] transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            Trang sau
          </button>
        </div>
      </div>
    </div>
  );
}
