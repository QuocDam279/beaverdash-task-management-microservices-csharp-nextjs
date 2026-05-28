"use client";

import * as React from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { api } from "@/lib/api";
import { getActionDetails } from "@/lib/timelineHelper";

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
        setHasMore(data && data.length === 50);
      } catch (err) {
        console.error("Failed to load project activities:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, [projectId, isOpen, page, selectedUser, selectedDate]);

  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 bg-[#091e42]/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none">
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xl w-full max-w-2xl h-[70vh] flex flex-col animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <h3 className="text-sm font-bold text-[#292a2e]">Lịch sử hoạt động dự án</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Filters Toolbar */}
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/20 flex flex-wrap items-center gap-4 shrink-0">
          {/* User selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-semibold">Người thực hiện:</span>
            <select
              value={selectedUser}
              onChange={(e) => { setSelectedUser(e.target.value); setPage(1); }}
              className="px-2.5 py-1 text-xs border border-slate-200 rounded-[4px] bg-white text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#1868db]"
            >
              <option value="all">Tất cả thành viên</option>
              {teamMembers.map((m) => (
                <option key={m.id} value={m.id}>{m.displayName}</option>
              ))}
            </select>
          </div>

          {/* Date Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-semibold">Ngày hoạt động:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => { setSelectedDate(e.target.value); setPage(1); }}
              className="px-2.5 py-1 text-xs border border-slate-200 rounded-[4px] bg-white text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#1868db] cursor-pointer"
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
              className="text-xs font-bold text-[#1868db] hover:text-[#0052cc] px-2 py-1 cursor-pointer transition-colors"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {isLoading ? (
            <div className="h-full flex items-center justify-center py-20">
              <svg className="animate-spin h-6 w-6 text-[#1868db]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          ) : activities.length > 0 ? (
            <div className="relative pl-6 border-l border-slate-150 space-y-6">
              {activities.map((event) => {
                const { actionText, targetText, iconBg, icon } = getActionDetails(
                  event.actionType,
                  event.entityType,
                  event.newValue
                );

                let taskId: string | null = null;
                if (event.entityType?.toLowerCase() === "task") {
                  taskId = event.entityId;
                } else if (event.newValue) {
                  try {
                    const data = JSON.parse(event.newValue);
                    taskId = data.task_id || null;
                  } catch {}
                }

                const href = taskId 
                  ? (shareToken 
                      ? `/shared/projects/${shareToken}/board?taskId=${taskId}` 
                      : `/projects/${projectId}/board?taskId=${taskId}`)
                  : null;

                const content = (
                  <>
                    {/* Avatar with Overlay Action Badge */}
                    <div className="absolute -left-[33px] top-0.5 h-6 w-6 rounded-full bg-slate-100 ring-4 ring-white flex items-center justify-center z-10">
                      <Avatar
                        src={event.avatar}
                        alt={event.displayName}
                        className="h-full w-full rounded-full object-cover"
                      />
                      <span className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full flex items-center justify-center ${iconBg} ring-2 ring-white shadow-xs`}>
                        {React.cloneElement(icon as any, { className: "h-2 w-2 text-white" })}
                      </span>
                    </div>

                    {/* Event Content */}
                    <div className="flex flex-col gap-0.5 pl-2">
                      <div className="text-slate-500 font-semibold leading-relaxed group-hover:text-slate-700 transition-colors">
                        <span className="text-[#292a2e] font-bold">{event.displayName}</span>{" "}
                        {actionText}{" "}
                        <span className="text-[#1868db] font-bold hover:underline">{targetText}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        {formatEventTime(event.createdAt)}
                      </span>
                    </div>
                  </>
                );

                return href ? (
                  <Link
                    key={event.id}
                    href={href}
                    onClick={onClose} // close modal when redirecting
                    className="relative text-xs block group cursor-pointer hover:bg-slate-50/50 p-1 -m-1 rounded-md transition-all"
                  >
                    {content}
                  </Link>
                ) : (
                  <div key={event.id} className="relative text-xs block group">
                    {content}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400 font-semibold py-8 text-center">
              Chưa có hoạt động nào được ghi nhận
            </div>
          )}
        </div>

        {/* Footer Pagination Controls */}
        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 text-xs font-semibold text-[#505258] shrink-0">
          <button
            type="button"
            disabled={page === 1 || isLoading}
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            className="px-3 py-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white text-slate-600 transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            Trang trước
          </button>
          <span className="text-slate-500 font-bold">Trang {page}</span>
          <button
            type="button"
            disabled={!hasMore || isLoading}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white text-slate-600 transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            Trang sau
          </button>
        </div>
      </div>
    </div>
  );
}
