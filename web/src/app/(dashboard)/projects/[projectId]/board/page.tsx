"use client";

import * as React from "react";
import { BoardColumnView, TaskDetailModal, CreateTaskModal, WipLimitModal, DeleteColumnModal, BoardToolbar } from "@/components/project";
import { useBoard } from "@/hooks/useBoard";

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default function BoardPage({ params }: PageProps) {
  const { projectId } = React.use(params);
  const b = useBoard(projectId);

  if (b.isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center p-8 bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-[#1868db]" />
      </div>
    );
  }

  if (b.error) {
    return (
      <div className="min-h-full flex items-center justify-center p-8 bg-white text-red-500 font-bold">{b.error}</div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full p-6 pt-4 select-none bg-white">
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
      />

      {/* KANBAN BOARD */}
      <div className="flex-1 flex gap-4 overflow-x-auto overflow-y-hidden pb-4 items-stretch min-h-0 scrollbar-thin">
        {b.columns.map((column, index) => (
          <div key={column.id} className="w-80 shrink-0 flex flex-col h-full">
            <BoardColumnView
              column={column}
              tasks={b.filteredTasks.filter((t) => t.boardColumnId === column.id)}
              onTaskClick={b.handleTaskClick}
              onRefresh={b.fetchBoardData}
              isFirst={index === 0}
              isLast={index === b.columns.length - 1}
              onMoveLeft={() => b.handleMoveColumn(column.id, "left")}
              onMoveRight={() => b.handleMoveColumn(column.id, "right")}
              onSetWipLimit={() => b.handleOpenWipLimitModal(column)}
              onDeleteColumn={() => b.handleOpenDeleteModal(column)}
              onMoveTask={b.handleMoveTask}
              onSetColumnDone={b.handleSetColumnDone}
              assignees={b.assignees}
            />
          </div>
        ))}

        {/* Add Column Card */}
        <div className="w-80 shrink-0 flex flex-col select-none">
          {b.isAddingColumn ? (
            <div className="bg-[#f4f5f7] rounded-lg p-4 border border-slate-200 shadow-xs space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Tên cột trạng thái</label>
                <input
                  type="text"
                  placeholder="Nhập tên cột..."
                  value={b.newColName}
                  onChange={(e) => b.setNewColName(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white text-[#292a2e] focus:outline-none focus:ring-1 focus:ring-[#1868db]"
                  autoFocus
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Giới hạn công việc (WIP Limit)</label>
                <input
                  type="number"
                  placeholder="Không giới hạn"
                  value={b.newColWip || ""}
                  onChange={(e) => b.setNewColWip(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white text-[#292a2e] focus:outline-none focus:ring-1 focus:ring-[#1868db]"
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
                  className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-200 rounded transition-all cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={b.handleCreateColumn}
                  disabled={!b.newColName.trim()}
                  className="px-3 py-1.5 text-xs font-bold bg-[#1868db] hover:bg-[#0052cc] disabled:bg-slate-200 disabled:text-slate-400 text-white rounded transition-all cursor-pointer"
                >
                  Thêm cột
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => b.setIsAddingColumn(true)}
              className="w-full py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-[#505258] hover:text-[#1868db] rounded-lg border-2 border-dashed border-slate-200 hover:border-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Thêm cột trạng thái
            </button>
          )}
        </div>
      </div>

      {/* Task Detail Modal */}
      {b.selectedTask && (
        <TaskDetailModal
          isOpen={!!b.selectedTask}
          onClose={() => { b.setSelectedTask(null); b.fetchBoardData(); }}
          task={b.selectedTask}
          columns={b.columns}
          onUpdateTask={(updated) => b.setSelectedTask(updated)}
          assignees={b.assignees}
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
    </div>
  );
}
