"use client";

/**
 * @component ProjectDocumentsTable
 * @description Renders a table list of project documents with uploader details and actions.
 */

import * as React from "react";

import { Avatar } from "@/components/ui/Avatar";
import { DocumentFileIcon } from "./DocumentFileIcon";

import { formatRelativeTime } from "@/lib/utils";

import { ProjectDocument } from "./ProjectDocumentsView";

interface ProjectDocumentsTableProps {
  documents: ProjectDocument[];
  readOnly: boolean;
  currentUser: any;
  isLeaderOrOwner: boolean;
  onDeleteAttempt: (doc: ProjectDocument) => Promise<void>;
}

function formatBytes(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined) return "N/A";
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export function ProjectDocumentsTable({
  documents,
  readOnly,
  currentUser,
  isLeaderOrOwner,
  onDeleteAttempt,
}: ProjectDocumentsTableProps) {
  const getAbsoluteFileUrl = (relativeUrl: string) => {
    if (relativeUrl.startsWith("http")) return relativeUrl;
    return `http://localhost:5000${relativeUrl}`;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/75 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            <th className="px-4 py-3 min-w-[280px]">Tên tệp tin</th>
            <th className="px-4 py-3 w-28">Kích thước</th>
            <th className="px-4 py-3 min-w-[150px]">Người tải lên</th>
            <th className="px-4 py-3 w-32">Ngày tải</th>
            <th className="px-4 py-3 w-24 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-150">
          {documents.map((doc) => {
            const absoluteUrl = getAbsoluteFileUrl(doc.fileUrl);
            const isDeletable =
              !readOnly &&
              currentUser &&
              (doc.uploadedByUserId === currentUser.id || isLeaderOrOwner);

            return (
              <tr
                key={doc.id}
                className="hover:bg-slate-50/50 transition-colors text-xs text-slate-600 font-medium"
              >
                {/* Name / Icon */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <DocumentFileIcon fileName={doc.fileName} />
                    <div className="min-w-0 flex-1">
                      <a
                        href={absoluteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-slate-700 hover:text-[#1868db] hover:underline truncate block"
                        title={doc.fileName}
                      >
                        {doc.fileName}
                      </a>
                      <span className="text-[9px] text-slate-400 font-semibold block mt-0.5 uppercase tracking-wide">
                        {doc.fileName.split(".").pop() || "unknown"}
                      </span>
                    </div>
                  </div>
                </td>

                {/* File size */}
                <td className="px-4 py-3 text-[11px] font-semibold text-slate-500 whitespace-nowrap">
                  {formatBytes(doc.fileSizeBytes)}
                </td>

                {/* Uploader */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Avatar
                      src={doc.uploadedByUserAvatar}
                      alt={doc.uploadedByUserName}
                      className="w-5 h-5 rounded-full border border-slate-200"
                    />
                    <span className="font-bold text-slate-700 truncate max-w-[130px]" title={doc.uploadedByUserName}>
                      {doc.uploadedByUserName}
                    </span>
                  </div>
                </td>

                {/* Date */}
                <td className="px-4 py-3 text-[11px] text-slate-400 font-semibold whitespace-nowrap">
                  <span title={new Date(doc.createdAt).toLocaleString("vi-VN")}>
                    {formatRelativeTime(doc.createdAt)}
                  </span>
                </td>

                {/* Action buttons */}
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <a
                      href={absoluteUrl}
                      download={doc.fileName}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded text-slate-400 hover:text-[#1868db] hover:bg-slate-100 transition-colors flex items-center justify-center"
                      title="Tải xuống tài liệu"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </a>

                    {isDeletable && (
                      <button
                        onClick={() => onDeleteAttempt(doc)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors flex items-center justify-center cursor-pointer"
                        title="Xóa tài liệu"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
