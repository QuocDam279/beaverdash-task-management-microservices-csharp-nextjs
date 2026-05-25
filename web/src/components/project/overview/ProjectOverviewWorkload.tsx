"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";

interface MemberWorkload {
  userId: string;
  displayName: string;
  avatar: string | null;
  role: string;
  assignedTasksCount: number;
  workloadPercentage: number;
}

interface ProjectOverviewWorkloadProps {
  projectId: string;
  memberWorkloads: MemberWorkload[];
}

/**
 * ProjectOverviewWorkload — Hiển thị phân bổ thành viên & khối lượng công việc trong dự án.
 * Cho phép click vào thành viên để chuyển hướng qua Bảng công việc kèm bộ lọc theo người thực hiện.
 */
export function ProjectOverviewWorkload({ projectId, memberWorkloads }: ProjectOverviewWorkloadProps) {
  return (
    <Card className="bg-white border border-slate-200/80 rounded-[6px] shadow-[0_1px_3px_rgba(9,30,66,0.12)] flex flex-col w-full">
      <CardHeader className="p-5 pb-3 border-b border-slate-100">
        <h3 className="text-sm font-bold text-[#292a2e]">Phân bổ thành viên & Khối lượng</h3>
      </CardHeader>
      <CardBody className="p-5 flex-1 flex flex-col justify-center space-y-4">
        {memberWorkloads.length > 0 ? (
          memberWorkloads.map((member) => (
            <Link
              key={member.userId}
              href={`/projects/${projectId}/board?assigneeId=${member.userId}`}
              className="block group hover:bg-slate-50 p-2 -mx-2 rounded-lg transition-colors space-y-1.5 cursor-pointer"
            >
              {/* Member info row */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Avatar
                    src={member.avatar}
                    alt={member.displayName}
                    className="h-6 w-6 rounded-full border border-slate-200 object-cover"
                  />
                  <div>
                    <span className="font-bold text-[#292a2e] block group-hover:text-[#1868db] transition-colors">
                      {member.displayName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">{member.role}</span>
                  </div>
                </div>
                <span className="text-[#505258] font-bold shrink-0">
                  {member.assignedTasksCount} việc ({member.workloadPercentage}%)
                </span>
              </div>

              {/* Workload Progress Bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/30">
                <div 
                  style={{ width: `${member.workloadPercentage}%` }} 
                  className="bg-[#1868db] h-full rounded-full transition-all duration-500"
                />
              </div>
            </Link>
          ))
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-slate-400 font-semibold py-8 text-center">
            Dự án chưa có thành viên phân công
          </div>
        )}
      </CardBody>
    </Card>
  );
}
