"use client";

import * as React from "react";
import Link from "next/link";

import { Card, CardHeader, CardBody, CardFooter } from "@/components/ui/Card";
import { Project } from "@/types/project";

/** Props for TeamProjectsGrid */
interface TeamProjectsGridProps {
  projects: Project[];
}

/**
 * Lưới hiển thị danh sách dự án thuộc nhóm.
 * Mỗi dự án hiển thị tên, mô tả, trạng thái, tiến độ, hạn chót.
 */
export default function TeamProjectsGrid({ projects }: TeamProjectsGridProps) {
  const calculateProjectProgress = (project: Project) => {
    return project.progress || 0;
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <h2 className="text-sm font-bold text-[#292a2e] uppercase tracking-wide pb-2 border-b border-slate-100">
        Dự án trực thuộc nhóm
      </h2>

      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project) => {
            const progress = calculateProjectProgress(project);
            return (
              <Card
                key={project.id}
                className="border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition-all duration-150 rounded-[6px] flex flex-col justify-between"
              >
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xs font-bold text-[#292a2e] line-clamp-1 hover:text-[#1868db] transition-colors" title={project.name}>
                      <Link href={`/projects/${project.id}`}>{project.name}</Link>
                    </h3>
                  </div>
                  <p className="text-[11px] text-[#505258] mt-2 line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>
                </CardHeader>

                <CardBody className="p-4 py-3 flex flex-col gap-2">
                  <div className="flex justify-between items-center text-[10px] font-bold text-[#505258] uppercase">
                    <span>Tiến độ hoàn thành</span>
                    <span className="text-[#1868db]">{progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                    <div
                      className="h-full bg-[#1868db] rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </CardBody>

                <CardFooter className="p-4 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex flex-col gap-0.5 text-[9px] text-[#6b6e76] uppercase tracking-wider font-semibold">
                    <div>
                      Bắt đầu:{" "}
                      <span className="text-slate-600 font-bold">
                        {project.startDate
                          ? new Date(project.startDate).toLocaleDateString("vi-VN")
                          : "-"}
                      </span>
                    </div>
                    <div>
                      Hạn chót:{" "}
                      <span className="text-slate-600 font-bold">
                        {project.dueDate
                          ? new Date(project.dueDate).toLocaleDateString("vi-VN")
                          : "-"}
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/projects/${project.id}/board`}
                    className="bg-slate-100 hover:bg-slate-200 text-[#292a2e] text-[10px] font-bold px-2.5 py-1.5 rounded border border-slate-200 transition-colors cursor-pointer"
                  >
                    Bảng công việc
                  </Link>
                </CardFooter>

              </Card>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-slate-200 rounded-lg text-slate-400 text-xs bg-slate-50/20">
          <span className="text-3xl mb-1">📂</span>
          <p className="font-semibold text-slate-500">Chưa có dự án nào thuộc nhóm này</p>
        </div>
      )}
    </div>
  );
}
