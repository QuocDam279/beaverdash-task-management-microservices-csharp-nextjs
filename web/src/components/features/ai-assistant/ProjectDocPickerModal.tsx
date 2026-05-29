"use client";

/**
 * @component ProjectDocPickerModal
 * @description Modal allowing users to select a document from the project's uploaded documents.
 */

import * as React from "react";

import { api } from "@/lib/api";

interface ProjectDocPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onSelect: (doc: any) => void;
}

export function ProjectDocPickerModal({
  isOpen,
  onClose,
  projectId,
  onSelect,
}: ProjectDocPickerModalProps) {
  const [documents, setDocuments] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      const fetchDocs = async () => {
        try {
          setIsLoading(true);
          const data = await api.get(`/projects/${projectId}/documents`);
          setDocuments(data || []);
        } catch (err) {
          console.error("Failed to load project documents for picker:", err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchDocs();
    }
  }, [isOpen, projectId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs select-none">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-4 flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3.5 mb-3.5">
          <h3 className="text-sm font-bold text-slate-800">Chọn tài liệu từ dự án</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg cursor-pointer"
            title="Đóng"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto custom-chat-scrollbar space-y-2 pr-1 mb-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-8 gap-2">
              <svg className="animate-spin h-5 w-5 text-[#1868db]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-[10px] font-semibold text-slate-400">Đang tải danh sách tài liệu...</span>
            </div>
          ) : documents.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-450 italic font-semibold">
              Không tìm thấy tài liệu nào trong dự án này.
            </div>
          ) : (
            documents.map((doc) => {
              const fileExt = doc.fileName.split(".").pop()?.toUpperCase() || "FILE";
              const sizeInKb = doc.fileSizeBytes ? Math.round(doc.fileSizeBytes / 1024) : 0;

              return (
                <button
                  key={doc.id}
                  onClick={() => onSelect(doc)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-lg border border-slate-100 hover:border-[#1868db] hover:bg-slate-50/50 text-left transition-all cursor-pointer group"
                >
                  {/* Small doc icon */}
                  <div className="p-2 rounded bg-slate-50 text-slate-500 border border-slate-100 group-hover:bg-[#1868db]/10 group-hover:text-[#1868db] transition-colors shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  
                  {/* File Info */}
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-700 truncate group-hover:text-[#1868db] transition-colors" title={doc.fileName}>
                      {doc.fileName}
                    </div>
                    <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                      {fileExt} • {sizeInKb > 1024 ? `${(sizeInKb / 1024).toFixed(1)} MB` : `${sizeInKb} KB`}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t">
          <button
            onClick={onClose}
            className="px-4 py-1.5 border border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>
        </div>
      </div>
    </div>
  );
}
