"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { api } from "@/lib/api";
import { getActionDetails } from "@/lib/timelineHelper";
import { ActivityHistoryModal } from "./ActivityHistoryModal";

interface ProjectOverviewTimelineProps {
  projectId?: string;
  shareToken?: string;
}

/**
 * ProjectOverviewTimeline — Trình diễn dòng thời gian (activity timeline) hoạt động gần đây của dự án.
 */
export function ProjectOverviewTimeline({ projectId, shareToken }: ProjectOverviewTimelineProps) {
  const [activities, setActivities] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = React.useState(false);

  React.useEffect(() => {
    const fetchActivities = async () => {
      try {
        const url = shareToken
          ? `/shared/projects/${shareToken}/activities`
          : `/projects/${projectId}/activities`;
        const data = await api.get(url);
        setActivities(data ? data.slice(0, 5) : []); // Only take top 5 for overview
      } catch (err) {
        console.error("Failed to load project activities for timeline:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, [projectId, shareToken]);

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
            ) : activities.length > 0 ? (
              <div className="relative pl-6 border-l border-slate-150 space-y-5">
                {activities.map((event) => {
                  const { actionText, targetText, iconBg, icon } = getActionDetails(
                    event.actionType,
                    event.entityType,
                    event.newValue,
                    event.oldValue
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

          {/* View All Button */}
          {activities.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsHistoryOpen(true)}
                className="text-xs font-semibold text-[#1868db] hover:text-[#1455b8] hover:underline cursor-pointer flex items-center gap-1"
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

      <ActivityHistoryModal
        projectId={projectId}
        shareToken={shareToken}
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />
    </>
  );
}
