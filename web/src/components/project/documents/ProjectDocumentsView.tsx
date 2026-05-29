"use client";

/**
 * @component ProjectDocumentsView
 * @description Main view for uploading, searching, and managing project documents.
 */

import * as React from "react";

import { ProjectDocumentsTable } from "./ProjectDocumentsTable";

import { useAlertConfirm } from "@/components/providers/AlertConfirmProvider";

export interface ProjectDocument {
  id: string;
  projectId: string;
  fileName: string;
  fileUrl: string;
  fileType?: string;
  fileSizeBytes?: number;
  uploadedByUserId: string;
  uploadedByUserName: string;
  uploadedByUserAvatar?: string;
  createdAt: string;
}

interface ProjectDocumentsViewProps {
  documents: ProjectDocument[];
  isLoading: boolean;
  isUploading: boolean;
  isLeaderOrOwner: boolean;
  currentUser: any;
  readOnly?: boolean;
  onUpload: (file: File) => Promise<void>;
  onDelete: (documentId: string) => Promise<void>;
}

export function ProjectDocumentsView({
  documents,
  isLoading,
  isUploading,
  isLeaderOrOwner,
  currentUser,
  readOnly = false,
  onUpload,
  onDelete,
}: ProjectDocumentsViewProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isDragActive, setIsDragActive] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { confirm, alert } = useAlertConfirm();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      await handleUploadAttempt(file);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await handleUploadAttempt(file);
    }
  };

  const handleUploadAttempt = async (file: File) => {
    try {
      await onUpload(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err: any) {
      alert(err.message || "Tải tài liệu lên thất bại.", "Lỗi tải lên", "danger");
    }
  };

  const handleDeleteAttempt = async (doc: ProjectDocument) => {
    const consent = await confirm(
      `Bạn có chắc chắn muốn xóa tài liệu "${doc.fileName}"? Hành động này sẽ xóa vĩnh viễn tệp tin khỏi dự án.`,
      {
        title: "Xóa tài liệu",
        confirmLabel: "Xóa tài liệu",
        variant: "danger",
      }
    );

    if (!consent) return;

    try {
      await onDelete(doc.id);
    } catch (err: any) {
      alert(err.message || "Xóa tài liệu thất bại.", "Lỗi xóa tài liệu", "danger");
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const filteredDocs = documents.filter((doc) =>
    doc.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-12">
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Tài liệu dự án</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý và chia sẻ các tệp tin đính kèm cho toàn bộ thành viên trong dự án.
          </p>
        </div>
        
        {/* Search tool */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Tìm kiếm tài liệu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 focus:border-[#1868db] focus:ring-1 focus:ring-[#1868db]/30 rounded-[4px] bg-white text-slate-700 outline-none transition-all placeholder:text-slate-400"
          />
          <svg
            className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Upload area */}
      {!readOnly && (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          className={`relative border-2 border-dashed rounded-[6px] p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[140px] group ${
            isDragActive
              ? "border-[#1868db] bg-blue-50/50 shadow-inner"
              : "border-slate-200 hover:border-[#1868db]/60 hover:bg-slate-50/30"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
          />

          {isUploading ? (
            <div className="flex flex-col items-center gap-3">
              <svg className="animate-spin h-7 w-7 text-[#1868db]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-xs font-semibold text-slate-500">Đang tải tệp lên máy chủ...</span>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mb-3 group-hover:bg-[#1868db]/10 group-hover:text-[#1868db] transition-colors">
                <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-8m0 8l-3-3m3 3l3-3m-9 8h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-xs font-bold text-slate-700">
                Kéo thả tệp tin vào đây hoặc <span className="text-[#1868db] group-hover:underline">Nhấn để duyệt</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-1 font-medium">
                Hỗ trợ tệp đính kèm văn bản, bảng tính, hình ảnh, tài liệu nén PDF, ZIP... lên đến 50MB.
              </p>
            </>
          )}
        </div>
      )}

      {/* Content table */}
      <div className="bg-white border border-slate-200 rounded-[6px] overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-16 gap-3">
            <svg className="animate-spin h-6 w-6 text-[#1868db]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-xs font-semibold text-slate-400">Đang tải danh sách tài liệu...</span>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mb-3">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xs font-bold text-slate-700">Chưa có tài liệu nào</h3>
            <p className="text-[10px] text-slate-400 mt-1 max-w-sm">
              {searchQuery
                ? "Không tìm thấy tài liệu phù hợp với từ khóa của bạn."
                : "Dự án này chưa có tài liệu đính kèm nào được tải lên."}
            </p>
          </div>
        ) : (
          <ProjectDocumentsTable
            documents={filteredDocs}
            readOnly={readOnly}
            currentUser={currentUser}
            isLeaderOrOwner={isLeaderOrOwner}
            onDeleteAttempt={handleDeleteAttempt}
          />
        )}
      </div>
    </div>
  );
}
