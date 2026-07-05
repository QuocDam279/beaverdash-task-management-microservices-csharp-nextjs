"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useBacklog } from "@/hooks/useBacklog";
import { SprintSection, BacklogTaskRow } from "@/components/project";
import type { SprintDto } from "@/types/api";
import { api } from "@/lib/api";

const TaskDetailModal = dynamic(() =>
  import("@/components/project/TaskDetailModal").then((m) => m.TaskDetailModal),
  { ssr: false }
);
const CreateTaskModal = dynamic(() =>
  import("@/components/project/CreateTaskModal").then((m) => m.CreateTaskModal),
  { ssr: false }
);
const CreateSprintModal = dynamic(() =>
  import("@/components/project/CreateSprintModal").then((m) => m.CreateSprintModal),
  { ssr: false }
);
const CloseSprintModal = dynamic(() =>
  import("@/components/project/CloseSprintModal").then((m) => m.CloseSprintModal),
  { ssr: false }
);

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default function BacklogPage({ params }: PageProps) {
  const { projectId } = React.use(params);
  const b = useBacklog(projectId);

  // Modal open states
  const [isCreateSprintOpen, setIsCreateSprintOpen] = React.useState(false);
  const [editingSprint, setEditingSprint] = React.useState<SprintDto | null>(null);
  const [activeCloseSprint, setActiveCloseSprint] = React.useState<SprintDto | null>(null);
  const [createTaskSprintId, setCreateTaskSprintId] = React.useState<string | null | undefined>(undefined); // undefined means closed
  
  // Selected task detail state
  const [selectedTask, setSelectedTask] = React.useState<any | null>(null);
  
  // Drag over backlog state
  const [isDragOverBacklog, setIsDragOverBacklog] = React.useState(false);

  // Edit Sprint states
  const [editName, setEditName] = React.useState("");
  const [editGoal, setEditGoal] = React.useState("");
  const [editStartDate, setEditStartDate] = React.useState("");
  const [editEndDate, setEditEndDate] = React.useState("");
  const [editDuration, setEditDuration] = React.useState("custom");
  const [isSavingEdit, setIsSavingEdit] = React.useState(false);

  React.useEffect(() => {
    if (editingSprint) {
      setEditName(editingSprint.name);
      setEditGoal(editingSprint.goal || "");
      setEditStartDate(editingSprint.startDate ? editingSprint.startDate.substring(0, 10) : "");
      setEditEndDate(editingSprint.endDate ? editingSprint.endDate.substring(0, 10) : "");
      setEditDuration("custom");
    }
  }, [editingSprint]);

  React.useEffect(() => {
    if (editStartDate && editDuration !== "custom") {
      const start = new Date(editStartDate);
      const end = new Date(start.getTime() + parseInt(editDuration) * 7 * 24 * 60 * 60 * 1000);
      const yyyy = end.getFullYear();
      const mm = String(end.getMonth() + 1).padStart(2, "0");
      const dd = String(end.getDate()).padStart(2, "0");
      setEditEndDate(`${yyyy}-${mm}-${dd}`);
    }
  }, [editStartDate, editDuration]);

  // Auto-scroll window when dragging tasks near screen boundaries
  React.useEffect(() => {
    let scrollInterval: NodeJS.Timeout | null = null;
    let scrollSpeed = 0; // positive for down, negative for up

    const handleDragOver = (e: DragEvent) => {
      const scrollContainer = document.querySelector('.custom-chat-scrollbar') as HTMLElement;
      if (!scrollContainer) return;

      const rect = scrollContainer.getBoundingClientRect();
      const threshold = 80; // pixels from top/bottom boundaries to start scrolling
      const relativeY = e.clientY - rect.top;

      if (relativeY < threshold && relativeY > 0) {
        // Scroll Up: Speed increases as drag gets closer to the top border
        const pct = (threshold - relativeY) / threshold;
        scrollSpeed = -Math.max(2, pct * 15);
        
        if (!scrollInterval) {
          scrollInterval = setInterval(() => {
            scrollContainer.scrollTop += scrollSpeed;
          }, 15);
        }
      } else if (relativeY > rect.height - threshold && relativeY < rect.height) {
        // Scroll Down: Speed increases as drag gets closer to the bottom border
        const pct = (relativeY - (rect.height - threshold)) / threshold;
        scrollSpeed = Math.max(2, pct * 15);
        
        if (!scrollInterval) {
          scrollInterval = setInterval(() => {
            scrollContainer.scrollTop += scrollSpeed;
          }, 15);
        }
      } else {
        // Outside the scroll zones
        if (scrollInterval) {
          clearInterval(scrollInterval);
          scrollInterval = null;
        }
      }
    };

    const handleDragEnd = () => {
      if (scrollInterval) {
        clearInterval(scrollInterval);
        scrollInterval = null;
      }
    };

    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("dragend", handleDragEnd);
    window.addEventListener("drop", handleDragEnd);

    return () => {
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("dragend", handleDragEnd);
      window.removeEventListener("drop", handleDragEnd);
      if (scrollInterval) clearInterval(scrollInterval);
    };
  }, []);

  if (b.isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center p-8 bg-white dark:bg-[#1d2125]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 dark:border-[#353e47] border-t-[#1868db] dark:border-t-[#579dff]" />
      </div>
    );
  }

  if (b.error) {
    return (
      <div className="min-h-full flex items-center justify-center p-8 bg-white dark:bg-[#1d2125] text-red-500 dark:text-red-400 font-bold">
        {b.error}
      </div>
    );
  }

  const handleTaskClick = async (task: any) => {
    try {
      const fullTask = await api.get(`/tasks/${task.id}`);
      if (fullTask) {
        setSelectedTask({
          ...fullTask,
          id: fullTask.id || fullTask.Id || task.id,
          createdByUser: fullTask.createdByName ? {
            displayName: fullTask.createdByName,
            avatar: fullTask.createdByAvatar
          } : null
        });
      }
    } catch (err) {
      console.error("Failed to load task details:", err);
    }
  };

  const handleSaveEditSprint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSprint || !editName.trim()) return;

    try {
      setIsSavingEdit(true);
      await b.handleUpdateSprint(
        editingSprint.id,
        editName,
        editGoal,
        editStartDate,
        editEndDate
      );
      setEditingSprint(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const nextSprintNumber = b.backlogData ? b.backlogData.sprints.length + 1 : 1;
  const activeSprint = b.backlogData?.sprints.find((s) => s.status === "Active");
  const futureSprints = b.backlogData?.sprints.filter((s) => s.status === "Future") || [];

  return (
    <div className="flex flex-col min-h-full w-full p-6 pt-4 bg-white dark:bg-[#1d2125] space-y-6">
      {/* TOOLBAR */}
      <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-[#2c3338]">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-250">Backlog</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Lên kế hoạch cho các Sprint và quản lý danh sách công việc tồn đọng.
          </p>
        </div>
        {b.isLeaderOrOwner && (
          <button
            onClick={() => setIsCreateSprintOpen(true)}
            className="bg-[#1868db] dark:bg-[#579dff] hover:bg-[#0052cc] dark:hover:bg-blue-400 text-white dark:text-[#1d2125] text-xs font-bold px-3 py-2 rounded transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Tạo Sprint
          </button>
        )}
      </div>

      {/* SPRINT LIST SECTIONS */}
      <div className="space-y-4">
        {b.backlogData?.sprints && b.backlogData.sprints.length > 0 ? (
          b.backlogData.sprints.map((sprint) => (
            <SprintSection
              key={sprint.id}
              sprint={sprint}
              onStartSprint={b.handleStartSprint}
              onCloseSprint={(id) => setActiveCloseSprint(sprint)}
              onEditSprint={(s) => setEditingSprint(s)}
              onDeleteSprint={b.handleDeleteSprint}
              onTaskClick={handleTaskClick}
              onMoveTasks={b.handleMoveTasks}
              onCreateTaskClick={(sId) => setCreateTaskSprintId(sId)}
              isLeaderOrOwner={b.isLeaderOrOwner}
            />
          ))
        ) : (
          <div className="border border-dashed border-slate-300 dark:border-[#353e47] rounded-lg p-8 text-center text-xs text-slate-400 dark:text-slate-500 italic select-none">
            Chưa có Sprint nào. Hãy nhấn nút "Tạo Sprint" ở trên để bắt đầu lập kế hoạch dự án.
          </div>
        )}
      </div>

      {/* PRODUCT BACKLOG CONTAINER */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-350 uppercase tracking-wider">
              Product Backlog
            </h2>
            <span className="rounded-full bg-slate-100 dark:bg-[#22272b] px-2 py-0.5 text-xs font-bold border border-slate-200 dark:border-[#353e47] text-slate-550 dark:text-slate-400">
              {b.backlogData?.backlogTasks.length || 0} công việc
            </span>
          </div>
        </div>

        {/* Backlog Drop Zone Container */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={(e) => { e.preventDefault(); setIsDragOverBacklog(true); }}
          onDragLeave={() => setIsDragOverBacklog(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOverBacklog(false);
            const taskId = e.dataTransfer.getData("taskId");
            if (taskId) {
              b.handleMoveTasks([taskId], null); // sprintId = null moves to backlog
            }
          }}
          className={`rounded-lg border overflow-visible relative z-10 transition-all duration-200 ${
            isDragOverBacklog
              ? "border-blue-500 bg-blue-50/10 dark:bg-blue-950/5 ring-2 ring-blue-500/10"
              : "border-slate-200 dark:border-[#2c3338] bg-white dark:bg-[#1d2125]"
          }`}
        >
          {/* List of Tasks */}
          <div className="divide-y divide-slate-100 dark:divide-[#2c3338] min-h-[100px] flex flex-col rounded-lg">
            {b.backlogData?.backlogTasks && b.backlogData.backlogTasks.length > 0 ? (
              b.backlogData.backlogTasks.map((task) => (
                <BacklogTaskRow
                  key={task.id}
                  task={task}
                  onTaskClick={handleTaskClick}
                  showStatus={false}
                  sprints={b.backlogData?.sprints}
                  onMoveToSprint={(sprintId) => b.handleMoveTasks([task.id], sprintId)}
                />
              ))
            ) : (
              <div className="py-12 text-center text-xs text-slate-400 dark:text-slate-500 italic select-none rounded-t-[7px]">
                Không có công việc nào trong Backlog. Kéo các công việc ở đây vào các Sprint ở trên để chuẩn bị bắt đầu làm việc.
              </div>
            )}

            {/* Create task action bar at bottom of Backlog */}
            <div className="p-3 bg-slate-50/30 dark:bg-[#1d2125]/20 flex justify-start border-t border-slate-100 dark:border-[#2c3338] rounded-b-[7px]">
              <button
                onClick={() => setCreateTaskSprintId(null)} // null means backlog
                className="flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-[#1868db] dark:hover:text-[#579dff] cursor-pointer transition-colors px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-[#22272b] rounded"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>Tạo công việc trong Backlog</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (() => {
        const isTaskSprintClosed = selectedTask.sprintId && b.backlogData?.sprints
          ? b.backlogData.sprints.find((s: any) => s.id === selectedTask.sprintId)?.status === "Closed" 
          : false;
        return (
          <TaskDetailModal
            isOpen={!!selectedTask}
            onClose={() => { setSelectedTask(null); b.fetchBacklogData(true); }}
            task={selectedTask}
            columns={b.columns as any}
            onUpdateTask={(updated) => setSelectedTask(updated)}
            assignees={b.assignees}
            readOnly={isTaskSprintClosed}
          />
        );
      })()}

      {/* Create Task Modal */}
      {createTaskSprintId !== undefined && (
        <CreateTaskModal
          isOpen={createTaskSprintId !== undefined}
          onClose={() => setCreateTaskSprintId(undefined)}
          columns={b.columns}
          assignees={b.assignees}
          onTaskCreated={() => b.fetchBacklogData(true)}
          projectStartDate={b.projectStartDate}
          projectDueDate={b.projectDueDate}
          sprintId={createTaskSprintId} // pass sprintId (could be null for backlog)
        />
      )}

      {/* Create Sprint Modal */}
      <CreateSprintModal
        isOpen={isCreateSprintOpen}
        onClose={() => setIsCreateSprintOpen(false)}
        onSubmit={b.handleCreateSprint}
        defaultSprintNumber={nextSprintNumber}
        projectStartDate={b.projectStartDate}
        projectDueDate={b.projectDueDate}
      />

      {/* Close Sprint Modal */}
      {activeCloseSprint && (
        <CloseSprintModal
          isOpen={!!activeCloseSprint}
          onClose={() => setActiveCloseSprint(null)}
          onConfirm={(action, nextId) => b.handleCloseSprint(activeCloseSprint.id, action, nextId)}
          sprint={activeCloseSprint}
          futureSprints={futureSprints}
        />
      )}

      {/* Edit Sprint Dialog (Simple edit overlay) */}
      {editingSprint && (
        <div className="fixed inset-0 bg-black/45 dark:bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#161a1d] rounded-lg border border-slate-200 dark:border-[#2c3338] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-[#2c3338] flex justify-between items-center bg-slate-50/50 dark:bg-[#1d2125]">
              <h2 className="text-sm font-bold text-[#292a2e] dark:text-[#deebff] uppercase tracking-wide">
                Chỉnh sửa Sprint
              </h2>
              <button
                onClick={() => setEditingSprint(null)}
                className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-350 cursor-pointer p-0.5 rounded"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSaveEditSprint} className="flex-1 flex flex-col min-h-0">
              <div className="p-5 space-y-4 overflow-y-auto scrollbar-thin flex-1">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#6b6e76] dark:text-slate-400 uppercase tracking-wider block">
                    Tên Sprint <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 dark:border-[#353e47] rounded-[4px] bg-white dark:bg-[#22272b] text-[#292a2e] dark:text-[#deebff] focus:outline-none focus:ring-1 focus:ring-[#1868db]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#6b6e76] dark:text-slate-400 uppercase tracking-wider block">
                    Mục tiêu Sprint
                  </label>
                  <textarea
                    value={editGoal}
                    onChange={(e) => setEditGoal(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 dark:border-[#353e47] rounded-[4px] bg-white dark:bg-[#22272b] text-[#292a2e] dark:text-[#deebff] focus:outline-none focus:ring-1 focus:ring-[#1868db] resize-none"
                  />
                </div>

                {/* Sprint Duration */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#6b6e76] dark:text-slate-400 uppercase tracking-wider block">
                    Chu kỳ chạy Sprint
                  </label>
                  <select
                    value={editDuration}
                    onChange={(e) => setEditDuration(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 dark:border-[#353e47] rounded-[4px] bg-white dark:bg-[#22272b] text-[#292a2e] dark:text-[#deebff] focus:outline-none focus:ring-1 focus:ring-[#1868db] cursor-pointer"
                  >
                    <option value="1">1 tuần</option>
                    <option value="2">2 tuần</option>
                    <option value="3">3 tuần</option>
                    <option value="4">4 tuần</option>
                    <option value="custom">Tùy chọn ngày bắt đầu - kết thúc</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#6b6e76] dark:text-slate-400 uppercase tracking-wider block">
                      Ngày bắt đầu
                    </label>
                    <input
                      type="date"
                      value={editStartDate}
                      min={b.projectStartDate ? b.projectStartDate.substring(0, 10) : undefined}
                      max={b.projectDueDate ? b.projectDueDate.substring(0, 10) : undefined}
                      onChange={(e) => setEditStartDate(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-slate-300 dark:border-[#353e47] rounded-[4px] bg-white dark:bg-[#22272b] text-[#292a2e] dark:text-[#deebff] focus:outline-none focus:ring-1 focus:ring-[#1868db] cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#6b6e76] dark:text-slate-400 uppercase tracking-wider block">
                      Ngày kết thúc
                    </label>
                    <input
                      type="date"
                      value={editEndDate}
                      disabled={editDuration !== "custom"}
                      min={editStartDate || (b.projectStartDate ? b.projectStartDate.substring(0, 10) : undefined)}
                      max={b.projectDueDate ? b.projectDueDate.substring(0, 10) : undefined}
                      onChange={(e) => setEditEndDate(e.target.value)}
                      className={`w-full px-2 py-1.5 text-xs border border-slate-300 dark:border-[#353e47] rounded-[4px] bg-white dark:bg-[#22272b] text-[#292a2e] dark:text-[#deebff] focus:outline-none focus:ring-1 focus:ring-[#1868db] cursor-pointer ${
                        editDuration !== "custom" ? "opacity-60 cursor-not-allowed bg-slate-50 dark:bg-[#22272b]" : ""
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className="px-5 py-3 border-t border-slate-200 dark:border-[#2c3338] bg-slate-50/50 dark:bg-[#1d2125] flex justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingSprint(null)}
                  disabled={isSavingEdit}
                  className="bg-transparent hover:bg-slate-100 dark:hover:bg-[#22272b] text-[#505258] dark:text-slate-400 text-xs font-bold px-3 py-2 rounded-[4px] border border-slate-200 dark:border-[#353e47] cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="bg-[#1868db] dark:bg-[#579dff] hover:bg-[#0052cc] dark:hover:bg-blue-400 text-white dark:text-[#1d2125] text-xs font-bold px-3 py-2 rounded-[4px] cursor-pointer"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
