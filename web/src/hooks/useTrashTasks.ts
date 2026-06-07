"use client";

import * as React from "react";

import { useAlertConfirm } from "@/components/providers/AlertConfirmProvider";

import { api } from "@/lib/api";

export interface TrashTask {
  id: string;
  title: string;
  projectId: string;
  projectName: string;
  columnName: string;
  deletedAt: string;
  isCompleted: boolean;
  canPermanentDelete?: boolean;
}

export interface Project {
  id: string;
  name: string;
}

/**
 * Custom hook quản lý logic dữ liệu và tác vụ của Thùng rác công việc.
 * Tuân thủ Single Responsibility và quy định giới hạn dòng trong component.
 */
export function useTrashTasks() {
  const [trashTasks, setTrashTasks] = React.useState<TrashTask[]>([]);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = React.useState<string>("");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isActionPending, setIsActionPending] = React.useState(false);
  const [actionMessage, setActionMessage] = React.useState("Đang xử lý...");
  
  const { alert, confirm } = useAlertConfirm();

  const fetchTrashTasks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.get("/tasks/trash");
      setTrashTasks(data || []);
    } catch (err: unknown) {
      console.error("Failed to load trash tasks:", err);
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "Không thể tải danh sách thùng rác.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const data = await api.get("/projects");
      setProjects(data || []);
    } catch (err) {
      console.error("Failed to load projects list:", err);
    }
  };

  React.useEffect(() => {
    fetchTrashTasks();
    fetchProjects();
  }, []);

  // Lọc danh sách theo từ khóa tìm kiếm và dự án được chọn
  const filteredTasks = React.useMemo(() => {
    return trashTasks.filter((t) => {
      const matchesSearch =
        !searchQuery.trim() ||
        t.title.toLowerCase().includes(searchQuery.trim().toLowerCase());
      const matchesProject =
        !selectedProjectId || t.projectId === selectedProjectId;
      return matchesSearch && matchesProject;
    });
  }, [trashTasks, searchQuery, selectedProjectId]);

  // Dọn các ID đã chọn không còn nằm trong danh sách đã lọc
  React.useEffect(() => {
    const filteredIds = filteredTasks.map((t) => t.id);
    setSelectedIds((prev) => prev.filter((id) => filteredIds.includes(id)));
  }, [filteredTasks]);

  const handleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredTasks.map((t) => t.id));
    } else {
      setSelectedIds([]);
    }
  };

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
      setIsActionPending(true);
      setActionMessage("Đang khôi phục công việc...");
      await api.post(`/tasks/${id}/restore`, {});
      await fetchTrashTasks();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      alert(message || "Không thể khôi phục công việc.", "Thất bại", "danger");
    } finally {
      setIsActionPending(false);
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
      setIsActionPending(true);
      setActionMessage("Đang xóa vĩnh viễn công việc...");
      await api.delete(`/tasks/${id}/permanent`);
      await fetchTrashTasks();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      alert(message || "Không thể xóa vĩnh viễn công việc.", "Thất bại", "danger");
    } finally {
      setIsActionPending(false);
    }
  };

  const handleBatchRestore = async () => {
    if (selectedIds.length === 0) return;
    const confirmRestore = await confirm(
      `Bạn có chắc chắn muốn khôi phục ${selectedIds.length} công việc đã chọn? Các công việc này sẽ được đưa trở lại các dự án tương ứng.`,
      {
        title: "Khôi phục hàng loạt công việc",
        confirmLabel: "Khôi phục tất cả",
        variant: "info",
      }
    );
    if (!confirmRestore) return;

    try {
      setIsActionPending(true);
      setActionMessage("Đang khôi phục các công việc đã chọn...");
      await api.post("/tasks/batch-restore", { taskIds: selectedIds });
      setSelectedIds([]);
      await fetchTrashTasks();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      alert(message || "Không thể khôi phục các công việc đã chọn.", "Thất bại", "danger");
    } finally {
      setIsActionPending(false);
    }
  };

  const handleBatchPermanentDelete = async () => {
    if (selectedIds.length === 0) return;
    const confirmDelete = await confirm(
      `Bạn có chắc chắn muốn xóa vĩnh viễn ${selectedIds.length} công việc đã chọn? Hành động này sẽ xóa hoàn toàn chúng khỏi cơ sở dữ liệu và không thể hoàn tác.`,
      {
        title: "Xóa vĩnh viễn hàng loạt",
        confirmLabel: "Xóa vĩnh viễn",
        variant: "danger",
      }
    );
    if (!confirmDelete) return;

    try {
      setIsActionPending(true);
      setActionMessage("Đang xóa vĩnh viễn các công việc đã chọn...");
      await api.post("/tasks/batch-permanent-delete", { taskIds: selectedIds });
      setSelectedIds([]);
      await fetchTrashTasks();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      alert(message || "Không thể xóa vĩnh viễn các công việc đã chọn.", "Thất bại", "danger");
    } finally {
      setIsActionPending(false);
    }
  };

  const handleEmptyTrash = async () => {
    const confirmDelete = await confirm(
      "Bạn có chắc chắn muốn dọn trống hoàn toàn thùng rác? Tất cả công việc trong thùng rác sẽ bị xóa vĩnh viễn khỏi hệ thống và không thể hoàn tác.",
      {
        title: "Dọn trống thùng rác",
        confirmLabel: "Xóa toàn bộ",
        variant: "danger",
      }
    );
    if (!confirmDelete) return;

    try {
      setIsActionPending(true);
      setActionMessage("Đang dọn trống thùng rác...");
      await api.post("/tasks/empty-trash", {});
      setSelectedIds([]);
      await fetchTrashTasks();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      alert(message || "Không thể dọn trống thùng rác.", "Thất bại", "danger");
    } finally {
      setIsActionPending(false);
    }
  };

  return {
    trashTasks,
    projects,
    selectedProjectId,
    setSelectedProjectId,
    searchQuery,
    setSearchQuery,
    selectedIds,
    setSelectedIds,
    isLoading,
    error,
    isActionPending,
    actionMessage,
    filteredTasks,
    handleSelectRow,
    handleSelectAll,
    handleRestore,
    handlePermanentDelete,
    handleBatchRestore,
    handleBatchPermanentDelete,
    handleEmptyTrash,
  };
}
