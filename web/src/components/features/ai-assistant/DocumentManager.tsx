"use client";

/**
 * @component DocumentManager
 * @description Quản lý danh sách tài liệu phục vụ tìm kiếm RAG của dự án, hỗ trợ tải lên tệp mới và xóa tài liệu.
 */

import * as React from "react";
import { Document } from "@/types/chat";

interface DocumentManagerProps {
  documents: Document[];
  onUploadDocument: (file: File) => Promise<void>;
  onDeleteDocument: (id: string) => Promise<void>;
  onDownloadDocument: (id: string, fileName: string) => void;
}

function formatBytes(bytes: number | null): string {
  if (bytes === null || bytes === undefined) return "Unknown size";
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function DocumentManager({
  documents,
  onUploadDocument,
  onDeleteDocument,
  onDownloadDocument,
}: DocumentManagerProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = React.useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setIsUploading(true);
    try {
      await onUploadDocument(file);
    } catch (err) {
      console.error("Upload error in component:", err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f4f5f7] select-none">
      {/* Header */}
      <div className="p-4 border-b border-[#dfe1e6] bg-[#f4f5f7]">
        <span className="text-[10px] font-bold text-[#505258] uppercase tracking-wider block">
          Kho tri thức dự án (RAG)
        </span>
        <p className="text-[9px] text-[#6b6e76] mt-0.5 font-medium">
          Tài liệu được phân tích và trích xuất vector tự động.
        </p>
      </div>

      {/* Upload area */}
      <div className="p-4 border-b border-[#dfe1e6]">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,.docx,.xlsx,.txt"
          className="hidden"
          disabled={isUploading}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className={`w-full py-4 border border-dashed border-[#dfe1e6] hover:border-[#1868db] rounded-[4px] bg-white flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs ${
            isUploading ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >
          {isUploading ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-[#1868db] border-t-transparent rounded-full" />
              <span className="text-[9px] font-bold text-[#1868db]">Đang xử lý tệp...</span>
            </>
          ) : (
            <>
              <span className="text-lg">📤</span>
              <div className="text-center">
                <p className="text-[10px] font-bold text-[#292a2e]">Tải tài liệu mới lên</p>
                <p className="text-[8px] text-[#6b6e76] font-semibold mt-0.5">PDF, DOCX, XLSX, TXT (tối đa 10MB)</p>
              </div>
            </>
          )}
        </button>
      </div>

      {/* Documents List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
        <span className="text-[9px] font-bold text-[#505258] uppercase tracking-wider block">
          Tài liệu đã nạp ({documents.length})
        </span>

        {documents.length > 0 ? (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-white border border-[#dfe1e6] hover:border-slate-350 rounded-[4px] p-2.5 space-y-1.5 relative group/doc transition-all shadow-xs"
              >
                <div 
                  className={`flex items-start gap-2 pr-6 ${
                    doc.status === "completed" ? "cursor-pointer group/item" : "opacity-60 cursor-not-allowed"
                  }`}
                  onClick={() => doc.status === "completed" && onDownloadDocument(doc.id, doc.fileName)}
                >
                  <span className="text-base shrink-0 transition-transform group-hover/item:scale-110">📄</span>
                  <div className="min-w-0 flex-1">
                    <p 
                      className={`text-[10px] font-semibold text-[#292a2e] truncate ${
                        doc.status === "completed" ? "group-hover/item:text-[#1868db] group-hover/item:underline" : ""
                      }`}
                      title={doc.fileName}
                    >
                      {doc.fileName}
                    </p>
                    <p className="text-[8px] text-[#6b6e76] font-semibold mt-0.5">
                      {formatBytes(doc.fileSize)} {doc.pageCount ? `• ${doc.pageCount} trang` : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  {/* Status Badge */}
                  <span
                    className={`text-[8px] font-bold px-2 py-0.5 rounded-[3px] border ${
                      doc.status === "completed"
                        ? "bg-[#e3fcef] text-[#006644] border-[#abf5d1]"
                        : doc.status === "processing"
                        ? "bg-[#deebff] text-[#0747a6] border-[#b3d4ff] animate-pulse"
                        : "bg-[#ffebe6] text-[#bf2600] border-[#ffbdad]"
                    }`}
                  >
                    {doc.status === "completed"
                      ? "Đã trích xuất"
                      : doc.status === "processing"
                      ? "Đang phân tích"
                      : "Thất bại"}
                  </span>

                  <span className="text-[8px] text-[#6b6e76] font-semibold">
                    {formatDate(doc.createdAt)}
                  </span>
                </div>

                {/* Delete button */}
                <button
                  onClick={() => onDeleteDocument(doc.id)}
                  className="absolute right-2 top-2 opacity-0 group-hover/doc:opacity-100 text-[#6b6e76] hover:text-[#bf2600] p-1 rounded-[3px] hover:bg-black/5 transition-all cursor-pointer"
                  title="Xóa tài liệu"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 border border-dashed border-[#dfe1e6] rounded-[4px] bg-white text-[#6b6e76] text-xs font-semibold italic">
            Không có tài liệu nào trong kiến thức của dự án này.
          </div>
        )}
      </div>
    </div>
  );
}
