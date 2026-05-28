"use client";

import * as React from "react";

export interface MemberAddResult {
  email: string;
  success: boolean;
  message: string;
}

interface AddMemberResultsProps {
  results: MemberAddResult[];
}

/**
 * Hiển thị kết quả thêm thành viên hàng loạt (Thành công / Thất bại).
 */
export default function AddMemberResults({ results }: AddMemberResultsProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
        Kết quả thêm thành viên:
      </h3>
      <div className="max-h-56 overflow-y-auto border border-slate-100 rounded-[4px] divide-y divide-slate-100 custom-chat-scrollbar">
        {results.map((res) => (
          <div key={res.email} className="p-2.5 flex items-center justify-between text-xs gap-3 bg-white">
            <span className="font-semibold text-slate-700 truncate flex-1">{res.email}</span>
            {res.success ? (
              <span className="text-green-600 font-bold flex items-center gap-1 shrink-0 bg-green-50 px-2 py-0.5 rounded-[4px] text-[10px]">
                ✓ Thành công
              </span>
            ) : (
              <span
                className="text-red-600 font-semibold flex items-center gap-1 shrink-0 bg-red-50 px-2 py-0.5 rounded-[4px] text-[10px]"
                title={res.message}
              >
                ✗ Lỗi: {res.message}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
