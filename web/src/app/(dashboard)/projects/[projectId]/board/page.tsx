"use client";

import * as React from "react";
import Link from "next/link";
import { BoardColumnView, BoardToolbar, BoardGroupedView } from "@/components/project";
import { useBoard } from "@/hooks/useBoard";
import { useAuth } from "@/components/providers/AuthProvider";
import { api } from "@/lib/api";
import dynamic from "next/dynamic";

const TaskDetailModal = dynamic(() =>
  import("@/components/project/TaskDetailModal").then((m) => m.TaskDetailModal),
  { ssr: false }
);
const CreateTaskModal = dynamic(() =>
  import("@/components/project/CreateTaskModal").then((m) => m.CreateTaskModal),
  { ssr: false }
);
const WipLimitModal = dynamic(() =>
  import("@/components/project/WipLimitModal").then((m) => m.WipLimitModal),
  { ssr: false }
);
const DeleteColumnModal = dynamic(() =>
  import("@/components/project/DeleteColumnModal").then((m) => m.DeleteColumnModal),
  { ssr: false }
);
const CloseSprintModal = dynamic(() =>
  import("@/components/project/CloseSprintModal").then((m) => m.CloseSprintModal),
  { ssr: false }
);

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default function BoardPage({ params }: PageProps) {
  const { projectId } = React.use(params);
  const b = useBoard(projectId);
  const { user: currentUser } = useAuth();

  const [activeCloseSprint, setActiveCloseSprint] = React.useState<any | null>(null);
  const [futureSprints, setFutureSprints] = React.useState<any[]>([]);
  const [isClosingSprintLoading, setIsClosingSprintLoading] = React.useState(false);

  const handleCloseSprintClick = async () => {
    if (!b.activeSprintId) return;
    try {
      setIsClosingSprintLoading(true);
      const backlogData = await api.get(`/projects/${projectId}/backlog`);
      if (backlogData && backlogData.sprints) {
        const activeSprintObj = backlogData.sprints.find((s: any) => s.status === "Active");
        const futures = backlogData.sprints.filter((s: any) => s.status === "Future");
        setFutureSprints(futures);
        if (activeSprintObj) {
          setActiveCloseSprint(activeSprintObj);
        } else {
          setActiveCloseSprint({
            id: b.activeSprintId,
            name: b.activeSprintName || "",
            taskCount: b.tasks.length,
            completedTaskCount: b.tasks.filter(t => b.columns.find(c => c.id === t.boardColumnId)?.isDone).length
          });
        }
      }
    } catch (err) {
      console.error("Failed to load sprint details for closing:", err);
    } finally {
      setIsClosingSprintLoading(false);
    }
  };

  if (b.isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center p-8 bg-white dark:bg-[#1d2125]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 dark:border-[#353e47] border-t-[#1868db] dark:border-t-[#579dff]" />
      </div>
    );
  }

  if (b.error) {
    return (
      <div className="min-h-full flex items-center justify-center p-8 bg-white dark:bg-[#1d2125] text-red-500 dark:text-red-400 font-bold">{b.error}</div>
    );
  }

  const selectedSprint = b.sprints.find((s) => s.id === b.selectedSprintId);
  const isSprintClosed = selectedSprint ? selectedSprint.status === "Closed" : false;

  return (
    <div className="flex flex-col min-h-full w-full p-6 pt-4 select-none bg-white dark:bg-[#1d2125]">
      {/* TOOLBAR */}
      <BoardToolbar
        searchQuery={b.searchQuery}
        setSearchQuery={b.setSearchQuery}
        assignees={b.assignees}
        selectedAssignee={b.selectedAssignee}
        setSelectedAssignee={b.setSelectedAssignee}
        selectedPriority={b.selectedPriority}
        setSelectedPriority={b.setSelectedPriority}
        selectedDueDateFilter={b.selectedDueDateFilter}
        setSelectedDueDateFilter={b.setSelectedDueDateFilter}
        onResetFilters={b.handleResetFilters}
        onCreateTaskClick={() => b.setIsCreateTaskModalOpen(true)}
        isPersonalProject={b.isPersonalProject}
        sortBy={b.sortBy}
        onSortChange={b.setSortBy}
        activeSprintName={b.activeSprintName}
        activeSprintEndDate={b.activeSprintEndDate}
        sprints={b.sprints}
        selectedSprintId={b.selectedSprintId}
        setSelectedSprintId={b.setSelectedSprintId}
        onCloseSprintClick={handleCloseSprintClick}
        groupBy={b.groupBy}
        onGroupByChange={b.setGroupBy}
        readOnly={isSprintClosed}
      />

      {/* KANBAN BOARD */}
      {/* NO ACTIVE SPRINT WARNING BANNER */}
      {b.selectedSprintId === "active" && !b.activeSprintId && (
        <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-250 dark:border-amber-900/40 rounded-lg flex items-center justify-between text-xs text-amber-800 dark:text-amber-300 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <span>🏃‍♂️</span>
            <span>
              <strong>Không có Sprint nào đang hoạt động.</strong> Bảng hiện không hiển thị công việc. Hãy vào trang Backlog để bắt đầu một Sprint mới.
            </span>
          </div>
          <Link
            href={`/projects/${projectId}/backlog`}
            className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-[#1d2125] font-bold px-2.5 py-1 rounded transition-colors text-[11px]"
          >
            Đi đến Backlog
          </Link>
        </div>
      )}

      {/* KANBAN BOARD */}
      {b.groupBy !== "none" ? (
        <div className="flex-1 overflow-y-auto pb-4 pr-1">
          <BoardGroupedView
            columns={b.columns}
            tasks={b.filteredTasks}
            groupBy={b.groupBy}
            onMoveTask={b.handleMoveTask}
            onMoveSubTask={b.handleMoveSubTask}
            onTaskClick={b.handleTaskClick}
            currentUser={currentUser}
            assignees={b.assignees}
            readOnly={isSprintClosed}
            isPersonalProject={b.isPersonalProject}
          />
        </div>
      ) : (
        <div className="flex-1 flex gap-4 overflow-x-auto pb-4 items-stretch scrollbar-thin">
          {b.columns.map((column, index) => (
            <div key={column.id} className="w-80 shrink-0 flex flex-col">
              <BoardColumnView
                column={column}
                tasks={b.filteredTasks.filter((t) => t.boardColumnId === column.id)}
                onTaskClick={b.handleTaskClick}
                onRefresh={b.fetchBoardData}
                isFirst={index === 0}
                isLast={index === b.columns.length - 1}
                onMoveLeft={() => b.handleMoveColumn(column.id, "left")}
                onMoveRight={() => b.handleMoveColumn(column.id, "right")}
                onMoveColumn={b.handleSwapColumns}
                onSetWipLimit={() => b.handleOpenWipLimitModal(column)}
                onDeleteColumn={() => b.handleOpenDeleteModal(column)}
                onMoveTask={b.handleMoveTask}
                onSetColumnDone={b.handleSetColumnDone}
                assignees={b.assignees}
                isPersonalProject={b.isPersonalProject}
                projectStartDate={b.projectStartDate}
                projectDueDate={b.projectDueDate}
                readOnly={isSprintClosed}
              />
            </div>
          ))}

          {/* Add Column Card */}
          {!isSprintClosed && (
            <div className="w-80 shrink-0 flex flex-col select-none">
              {b.isAddingColumn ? (
                <div className="bg-[#f4f5f7] dark:bg-[#22272b] rounded-lg p-4 border border-slate-200 dark:border-[#353e47] shadow-xs space-y-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Tên cột trạng thái</label>
                    <input
                      type="text"
                      placeholder="Nhập tên cột..."
                      value={b.newColName}
                      onChange={(e) => b.setNewColName(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 dark:border-[#353e47] rounded bg-white dark:bg-[#2c3338] text-[#292a2e] dark:text-[#deebff] focus:outline-none focus:ring-1 focus:ring-[#1868db] dark:focus:ring-[#579dff]"
                      autoFocus
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Giới hạn công việc (WIP Limit)</label>
                    <input
                      type="number"
                      placeholder="Không giới hạn"
                      value={b.newColWip || ""}
                      onChange={(e) => b.setNewColWip(e.target.value ? parseInt(e.target.value) : null)}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 dark:border-[#353e47] rounded bg-white dark:bg-[#2c3338] text-[#292a2e] dark:text-[#deebff] focus:outline-none focus:ring-1 focus:ring-[#1868db] dark:focus:ring-[#579dff]"
                      min="1"
                    />
                  </div>

                  <div className="flex gap-2 justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        b.setIsAddingColumn(false);
                        b.setNewColName("");
                        b.setNewColWip(null);
                      }}
                      className="px-3 py-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#2c3338] rounded transition-all cursor-pointer"
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      onClick={b.handleCreateColumn}
                      disabled={!b.newColName.trim()}
                      className="px-3 py-1.5 text-xs font-bold bg-[#1868db] dark:bg-[#579dff] hover:bg-[#0052cc] dark:hover:bg-blue-400 disabled:bg-slate-200 dark:disabled:bg-[#2c3338] disabled:text-slate-400 dark:disabled:text-slate-600 text-white dark:text-[#1d2125] rounded transition-all cursor-pointer"
                    >
                      Thêm cột
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => b.setIsAddingColumn(true)}
                  className="w-full py-3.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-[#22272b] dark:hover:bg-[#2c3338] text-[#505258] dark:text-slate-300 hover:text-[#1868db] dark:hover:text-[#579dff] rounded-lg border-2 border-dashed border-slate-200 dark:border-[#353e47] hover:border-slate-300 dark:hover:border-slate-500 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Thêm cột trạng thái
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Task Detail Modal */}
      {b.selectedTask && (
        <TaskDetailModal
          isOpen={!!b.selectedTask}
          onClose={() => { b.setSelectedTask(null); b.fetchBoardData(); }}
          task={b.selectedTask}
          columns={b.columns}
          onUpdateTask={(updated) => b.setSelectedTask(updated)}
          assignees={b.assignees}
          readOnly={isSprintClosed}
        />
      )}

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={b.isCreateTaskModalOpen}
        onClose={() => b.setIsCreateTaskModalOpen(false)}
        columns={b.columns}
        assignees={b.assignees}
        onTaskCreated={b.fetchBoardData}
        projectStartDate={b.projectStartDate}
        projectDueDate={b.projectDueDate}
      />

      {/* WIP Limit Modal */}
      <WipLimitModal
        isOpen={!!b.wipModalColumn}
        column={b.wipModalColumn}
        onClose={() => b.setWipModalColumn(null)}
        onSave={b.handleSaveWipLimit}
      />

      {/* Delete Column & Task Migration Modal */}
      <DeleteColumnModal
        isOpen={!!b.deleteModalColumn}
        column={b.deleteModalColumn}
        tasks={b.tasks}
        allColumns={b.columns}
        onClose={() => b.setDeleteModalColumn(null)}
        onConfirm={b.handleConfirmDelete}
      />

      {/* Close Sprint Modal */}
      {activeCloseSprint && (
        <CloseSprintModal
          isOpen={!!activeCloseSprint}
          onClose={() => setActiveCloseSprint(null)}
          onConfirm={async (action, nextId) => {
            await b.handleCloseSprint(activeCloseSprint.id, action, nextId);
            setActiveCloseSprint(null);
          }}
          sprint={activeCloseSprint}
          futureSprints={futureSprints}
        />
      )}
    </div>
  );
}
