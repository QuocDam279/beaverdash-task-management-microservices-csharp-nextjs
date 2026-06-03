"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { api } from "@/lib/api";
import { 
  getActionDetails, 
  groupActivities, 
  getActionColorClass, 
  getSubtaskChangeDetail 
} from "@/lib/timelineHelper";
import { ActivityHistoryModal } from "./ActivityHistoryModal";

interface ProjectOverviewTimelineProps {
  projectId?: string;
  shareToken?: string;
}

export function ProjectOverviewTimeline({ projectId, shareToken }: ProjectOverviewTimelineProps) {
  const [activities, setActivities] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = React.useState(false);
  const [expandedGroups, setExpandedGroups] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    const fetchActivities = async () => {
      try {
        const url = shareToken
          ? `/shared/projects/${shareToken}/activities`
          : `/projects/${projectId}/activities`;
        const data = await api.get(url);
        setActivities(data ? data : []); 
      } catch (err) {
        console.error("Failed to load project activities for timeline:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, [projectId, shareToken]);

  const toggleGroup = (groupId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const formatEventTime = (isoString: string) => {
    const date = new Date(isoString);
    const options: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };
    const timeStr = date.toLocaleTimeString("vi-VN", options);
    
    const now = new Date();
    const isSameDay = date.getFullYear() === now.getFullYear() &&
                      date.getMonth() === now.getMonth() &&
                      date.getDate() === now.getDate();
                      
    if (isSameDay) {
      return `Hôm nay, ${timeStr}`;
    }
    
    return `${date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}, ${timeStr}`;
  };

  const displayActivities = React.useMemo(() => {
    return groupActivities(activities).slice(0, 5);
  }, [activities]);

  const renderActivityContent = (event: any) => {
    let taskId: string | null = null;
    if (event.isGroup) {
      taskId = JSON.parse(event.items[0].newValue)?.task_id || null;
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

      const act = event.actionType.toLowerCase();
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
          <div className="absolute -left-[33px] top-0.5 h-6 w-6 rounded-full bg-slate-100 ring-4 ring-white flex items-center justify-center z-10 select-none">
            <Avatar src={event.avatar} alt={event.displayName} className="h-full w-full rounded-full object-cover" />
            <span className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full flex items-center justify-center ${iconBg} ring-2 ring-white shadow-xs`}>
              {React.cloneElement(icon as any, { className: "h-2 w-2 text-white" })}
            </span>
          </div>

          <div className="flex flex-col gap-0.5 pl-2">
            <div className="flex items-center justify-between gap-2">
              <div className="text-slate-500 font-semibold leading-relaxed">
                <span className="text-[#292a2e] font-bold">{event.displayName}</span>{" "}
                <span className={actionColor}>{actionStr}</span>{" "}
                <span className="text-[#1868db] font-bold">{count} công việc con</span>{" "}
                của đầu việc{" "}
                <span className="text-[#1868db] font-bold hover:underline">
                  <Link href={href || "#"}>'{event.parentTaskTitle}'</Link>
                </span>
              </div>
              <button
                onClick={(e) => toggleGroup(event.id, e)}
                className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer shrink-0 border-0 bg-transparent"
                title={isExpanded ? "Thu gọn" : "Xem chi tiết"}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={`transform transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            </div>
            
            <span className="text-[10px] text-slate-500 bg-slate-50 border border-slate-200/50 px-2 py-0.5 rounded-[4px] font-semibold w-fit mt-0.5 select-none">
              {formatEventTime(event.createdAt)}
            </span>

            {isExpanded && (
              <div className="mt-2.5 ml-1 pl-3 border-l-2 border-slate-200 space-y-1.5 py-1 text-[11px] text-slate-500 font-medium animate-in slide-in-from-top-1 duration-200">
                {event.items.map((item: any) => {
                  const detail = getSubtaskChangeDetail(event.actionType, item.newValue);
                  return (
                    <div key={item.id} className="flex items-center justify-between gap-4 py-0.5">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
                        <span className="text-slate-750 font-bold truncate">{item.subtaskTitle}</span>
                        {detail && <span className="text-slate-400 italic font-normal">({detail})</span>}
                      </div>
                      <span className="text-[9px] text-slate-450 shrink-0 font-semibold bg-slate-50 border border-slate-100 px-1.5 py-0.2 rounded-sm select-none">
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
          <div className="absolute -left-[33px] top-0.5 h-6 w-6 rounded-full bg-slate-100 ring-4 ring-white flex items-center justify-center z-10 select-none">
            <Avatar src={event.avatar} alt={event.displayName} className="h-full w-full rounded-full object-cover" />
            <span className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full flex items-center justify-center ${iconBg} ring-2 ring-white shadow-xs`}>
              {React.cloneElement(icon as any, { className: "h-2 w-2 text-white" })}
            </span>
          </div>

          <div className="flex flex-col gap-0.5 pl-2">
            <div className="text-slate-500 font-semibold leading-relaxed">
              <span className="text-[#292a2e] font-bold">{event.displayName}</span>{" "}
              <span className={actionColor}>{actionText}</span>{" "}
              {href ? (
                <Link href={href} className="text-[#1868db] font-bold hover:underline">
                  {targetText}
                </Link>
              ) : (
                <span className="text-slate-700 font-semibold">{targetText}</span>
              )}
            </div>
            <span className="text-[10px] text-slate-500 bg-slate-50 border border-slate-200/50 px-2 py-0.5 rounded-[4px] font-semibold w-fit mt-0.5 select-none">
              {formatEventTime(event.createdAt)}
            </span>
          </div>
        </div>
      );
    }
  };

  return (
    <>
      <Card className="bg-white border border-slate-200/80 rounded-[6px] shadow-[0_1px_3px_rgba(9,30,66,0.12)] flex flex-col w-full">
        <CardHeader className="p-5 pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-[#292a2e]">Hoạt động gần đây</h3>
        </CardHeader>
        <CardBody className="p-5 flex-1 overflow-y-auto flex flex-col justify-between">
          <div>
            {isLoading ? (
              <div className="h-full flex items-center justify-center py-10">
                <svg className="animate-spin h-5 w-5 text-[#1868db]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            ) : displayActivities.length > 0 ? (
              <div className="timeline-scroll-area pr-2">
                <div className="relative pl-6 border-l border-slate-150 space-y-5">
                  {displayActivities.map(renderActivityContent)}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 font-semibold py-8 text-center select-none">
                Chưa có hoạt động nào được ghi nhận
              </div>
            )}
          </div>

          {activities.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsHistoryOpen(true)}
                className="text-xs font-semibold text-[#1868db] hover:text-[#1455b8] hover:underline cursor-pointer flex items-center gap-1 border-0 bg-transparent"
              >
                Xem tất cả
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          )}
        </CardBody>
      </Card>

      <style>{`
        .timeline-scroll-area {
          max-height: 250px;
          overflow-y: auto;
          scrollbar-width: thin;
        }
        .timeline-scroll-area::-webkit-scrollbar {
          width: 5px;
          background: transparent;
        }
        .timeline-scroll-area::-webkit-scrollbar-thumb {
          background: transparent;
          border-radius: 4px;
        }
        .timeline-scroll-area:hover::-webkit-scrollbar-thumb {
          background: #cbd5e1;
        }
      `}</style>

      <ActivityHistoryModal
        projectId={projectId}
        shareToken={shareToken}
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />
    </>
  );
}
