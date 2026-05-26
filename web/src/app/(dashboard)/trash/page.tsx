"use client";

import * as React from "react";
import { api } from "@/lib/api";
import { useAlertConfirm } from "@/components/providers/AlertConfirmProvider";

interface TrashTask {
  id: string;
  title: string;
  projectName: string;
  columnName: string;
  deletedAt: string;
  canPermanentDelete?: boolean;
}

export default function TrashPage() {
  const [trashTasks, setTrashTasks] = React.useState<TrashTask[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const { alert, confirm } = useAlertConfirm();

  const fetchTrashTasks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.get("/tasks/trash");
      setTrashTasks(data || []);
    } catch (err: any) {
      console.error("Failed to load trash tasks:", err);
      setError(err.message || "Không thể tải danh sách thùng rác.");
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchTrashTasks();
  }, []);

  const handleRestore = async (id: string) => {
    const confirmRestore = await confirm(
      "Bạn có chắc chắn muốn khôi phục công việc này? Công việc sẽ được quay trở lại bảng quản lý dự án.",
      {
        title: "Khôi phục công việc",
        confirmLabel: "Khôi phục",
        variant: "info",
      }
    );
    if (!confirmRestore) return;

    try {
      await api.post(`/tasks/${id}/restore`, {});
      fetchTrashTasks();
    } catch (err: any) {
      alert(err.message || "Không thể khôi phục công việc.", "Thất bại", "danger");
    }
  };

  const handlePermanentDelete = async (id: string) => {
    const confirmDelete = await confirm(
      "Bạn có chắc chắn muốn xóa vĩnh viễn công việc này? Hành động này sẽ xóa hoàn toàn công việc khỏi cơ sở dữ liệu và không thể hoàn tác.",
      {
        title: "Xóa vĩnh viễn công việc",
        confirmLabel: "Xóa vĩnh viễn",
        variant: "danger",
      }
    );
    if (!confirmDelete) return;

    try {
      await api.delete(`/tasks/${id}/permanent`);
      fetchTrashTasks();
    } catch (err: any) {
      alert(err.message || "Không thể xóa vĩnh viễn công việc.", "Thất bại", "danger");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center p-8 bg-white select-none">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-[#1868db]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm font-semibold text-slate-500">Đang tải thùng rác...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-white select-none p-6 md:p-8">
      {/* Page Header */}
      <div className="mb-6 pb-4 border-b border-slate-100 flex items-center gap-3 shrink-0">
        <div className="p-2 bg-red-50 text-red-500 rounded-lg">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#292a2e]">Thùng rác công việc</h1>
          <p className="text-xs text-[#505258] mt-0.5">
            Xem, khôi phục hoặc xóa vĩnh viễn các công việc đã bị xóa mềm của bạn.
          </p>
        </div>
      </div>

      {error ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center text-red-500 font-bold max-w-md bg-red-50 border border-red-200 px-6 py-4 rounded-lg">
            {error}
          </div>
        </div>
      ) : trashTasks.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-slate-200/60 rounded-xl m-4 bg-slate-50/50">
          <div className="text-slate-300 mb-3">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </div>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide">Thùng rác trống</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
            Các công việc bị xóa mềm sẽ xuất hiện ở đây để bạn có thể khôi phục bất cứ lúc nào.
          </p>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto border border-slate-200 rounded-lg shadow-sm">
          <table className="w-full text-left border-collapse bg-white">
            <thead>
              <tr className="bg-slate-50/75 text-[10px] font-bold text-[#6b6e76] uppercase tracking-wider border-b border-slate-200">
                <th className="px-6 py-3.5">Tiêu đề công việc</th>
                <th className="px-6 py-3.5">Dự án</th>
                <th className="px-6 py-3.5">Cột trạng thái</th>
                <th className="px-6 py-3.5">Thời gian xóa</th>
                <th className="px-6 py-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-[#292a2e]">
              {trashTasks.map((task) => {
                const formattedTime = new Date(task.deletedAt).toLocaleString("vi-VN", {
                  year: "numeric",
                  month: "numeric",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });
                return (
                  <tr key={task.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800 max-w-xs truncate" title={task.title}>
                      {task.title}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-[4px] border border-slate-200">
                        {task.projectName}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{task.columnName}</td>
                    <td className="px-6 py-4 text-slate-500">{formattedTime}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        <button
                          onClick={() => handleRestore(task.id)}
                          className="text-[#1868db] hover:text-[#0052cc] hover:bg-[#1868db]/5 px-2.5 py-1.5 rounded transition-colors cursor-pointer text-xs font-bold uppercase tracking-wider flex items-center gap-1"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="23 4 23 10 17 10"></polyline>
                            <polyline points="1 20 1 14 7 14"></polyline>
                            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                          </svg>
                          Khôi phục
                        </button>
                        {task.canPermanentDelete && (
                          <button
                            onClick={() => handlePermanentDelete(task.id)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50 px-2.5 py-1.5 rounded transition-colors cursor-pointer text-xs font-bold uppercase tracking-wider flex items-center gap-1"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                            Xóa vĩnh viễn
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
      )}
    </div>
  );
}
