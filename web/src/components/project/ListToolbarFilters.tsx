"use client";

import * as React from "react";
import { BoardColumn } from "@/types/task";

interface ListToolbarFiltersProps {
  columns: BoardColumn[];
  selectedStatus: string;
  setSelectedStatus: (s: string) => void;
  selectedPriority: string;
  setSelectedPriority: (p: string) => void;
  selectedDueDateFilter: string;
  setSelectedDueDateFilter: (d: string) => void;
  hasAnyFilterActive: boolean;
  closePopovers: () => void;
}

export function ListToolbarFilters({
  columns,
  selectedStatus,
  setSelectedStatus,
  selectedPriority,
  setSelectedPriority,
  selectedDueDateFilter,
  setSelectedDueDateFilter,
  hasAnyFilterActive,
  closePopovers,
}: ListToolbarFiltersProps) {
  return (
    <div className="absolute right-0 mt-1.5 w-60 rounded-md border border-slate-200 dark:border-[#353e47] bg-white dark:bg-[#22272b] shadow-lg z-20 py-2.5 animate-in fade-in slide-in-from-top-1 duration-150 text-xs text-[#292a2e] dark:text-[#deebff] max-h-[400px] overflow-y-auto custom-scrollbar">
      
      {/* STATUS FILTER */}
      <div className="px-3 pb-2 border-b border-slate-100 dark:border-[#2c3338] mb-2">
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase block mb-1.5">Trạng thái</span>
        <div className="space-y-1 max-h-36 overflow-y-auto custom-scrollbar pr-1">
          <div
            onClick={() => {
              setSelectedStatus("all");
              closePopovers();
            }}
            className={`px-2 py-1 rounded hover:bg-slate-50 dark:hover:bg-[#2c3338] cursor-pointer flex items-center justify-between transition-colors ${
              selectedStatus === "all" ? "text-[#1868db] dark:text-[#579dff] bg-blue-50/20 dark:bg-blue-950/10 font-bold" : "text-slate-600 dark:text-slate-450 font-medium"
            }`}
          >
            <span>Tất cả trạng thái</span>
            {selectedStatus === "all" && <span className="text-[#1868db] dark:text-[#579dff]">✓</span>}
          </div>
          {columns.map((col) => (
            <div
              key={col.id}
              onClick={() => {
                setSelectedStatus(col.id);
                closePopovers();
              }}
              className={`px-2 py-1 rounded hover:bg-slate-50 dark:hover:bg-[#2c3338] cursor-pointer flex items-center justify-between transition-colors ${
                selectedStatus === col.id ? "text-[#1868db] dark:text-[#579dff] bg-blue-50/20 dark:bg-blue-950/10 font-bold" : "text-slate-600 dark:text-slate-450 font-medium"
              }`}
            >
              <span className="truncate max-w-[150px]">{col.name}</span>
              {selectedStatus === col.id && <span className="text-[#1868db] dark:text-[#579dff]">✓</span>}
            </div>
          ))}
        </div>
      </div>

      {/* PRIORITY FILTER */}
      <div className="px-3 pb-2 border-b border-slate-100 dark:border-[#2c3338] mb-2">
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase block mb-1.5">Độ ưu tiên</span>
        <div className="space-y-1">
          {[
            { value: "all", label: "Tất cả độ ưu tiên" },
            { value: "Required", label: "Bắt buộc" },
            { value: "Important", label: "Quan trọng" },
            { value: "Extended", label: "Mở rộng" },
          ].map((item) => (
            <div
              key={item.value}
              onClick={() => {
                setSelectedPriority(item.value);
                closePopovers();
              }}
              className={`px-2 py-1 rounded hover:bg-slate-50 dark:hover:bg-[#2c3338] cursor-pointer flex items-center justify-between transition-colors ${
                selectedPriority === item.value ? "text-[#1868db] dark:text-[#579dff] bg-blue-50/20 dark:bg-blue-950/10 font-bold" : "text-slate-600 dark:text-slate-450 font-medium"
              }`}
            >
              <span>{item.label}</span>
              {selectedPriority === item.value && <span className="text-[#1868db] dark:text-[#579dff]">✓</span>}
            </div>
          ))}
        </div>
      </div>

      {/* DUE DATE FILTER */}
      <div className="px-3 pb-1">
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase block mb-1.5">Hạn chót</span>
        <div className="space-y-1">
          {[
            { value: "all", label: "Tất cả hạn chót" },
            { value: "overdue", label: "Quá hạn" },
            { value: "upcoming7", label: "Sắp đến hạn (7 ngày)" },
          ].map((item) => (
            <div
              key={item.value}
              onClick={() => {
                setSelectedDueDateFilter(item.value);
                closePopovers();
              }}
              className={`px-2 py-1 rounded hover:bg-slate-50 dark:hover:bg-[#2c3338] cursor-pointer flex items-center justify-between transition-colors ${
                selectedDueDateFilter === item.value ? "text-[#1868db] dark:text-[#579dff] bg-blue-50/20 dark:bg-blue-950/10 font-bold" : "text-slate-600 dark:text-slate-450 font-medium"
              }`}
            >
              <span>{item.label}</span>
              {selectedDueDateFilter === item.value && <span className="text-[#1868db] dark:text-[#579dff]">✓</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Clear quickly inside popover */}
      {hasAnyFilterActive && (
        <div className="px-3 pt-2 mt-2 border-t border-slate-100 dark:border-[#2c3338]">
          <button
            onClick={() => {
              setSelectedPriority("all");
              setSelectedStatus("all");
              setSelectedDueDateFilter("all");
              closePopovers();
            }}
            className="w-full text-center py-1 bg-red-50 dark:bg-red-950/20 text-red-655 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/45 rounded font-bold transition-all cursor-pointer"
          >
            Xóa bộ lọc
          </button>
        </div>
      )}
    </div>
  );
}
