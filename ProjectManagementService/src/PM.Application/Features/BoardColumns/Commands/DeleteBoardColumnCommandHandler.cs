using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.BoardColumns.Commands;

public class DeleteBoardColumnCommandHandler : IRequestHandler<DeleteBoardColumnCommand, bool>
{
    private readonly IPMDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;

    public DeleteBoardColumnCommandHandler(IPMDbContext dbContext, ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
    }

    public async Task<bool> Handle(DeleteBoardColumnCommand request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("Bạn chưa đăng nhập.");

        var boardColumn = await _dbContext.BoardColumns
            .Include(c => c.Project)
            .FirstOrDefaultAsync(c => c.Id == request.BoardColumnId, cancellationToken);

        if (boardColumn == null)
            return false;

        var project = boardColumn.Project;
        if (project == null)
            return false;

        if (!project.TeamId.HasValue)
        {
            throw new UnauthorizedAccessException("Bạn không có quyền xóa cột của Project này.");
        }

        var member = await _dbContext.TeamMembers.FirstOrDefaultAsync(tm => tm.TeamId == project.TeamId.Value && tm.UserId == currentUserId, cancellationToken);
        if (member == null || (member.Role != "leader" && member.Role != "Owner"))
            throw new UnauthorizedAccessException("Chỉ có trưởng nhóm mới có quyền xóa cột của Project này.");

        // Get all active tasks in this column
        var tasksInColumn = await _dbContext.TaskItems
            .Where(t => t.BoardColumnId == boardColumn.Id && t.DeletedAt == null)
            .ToListAsync(cancellationToken);

        if (tasksInColumn.Any())
        {
            if (!request.MoveTasksToColumnId.HasValue)
            {
                throw new InvalidOperationException("Không thể xóa cột vì vẫn còn công việc. Hãy chọn cột để chuyển công việc.");
            }

            var targetColumn = await _dbContext.BoardColumns
                .FirstOrDefaultAsync(c => c.Id == request.MoveTasksToColumnId.Value && c.ProjectId == boardColumn.ProjectId, cancellationToken);

            if (targetColumn == null)
            {
                throw new InvalidOperationException("Cột đích chuyển công việc không tồn tại.");
            }

            // Move tasks
            bool willTargetBeDone = targetColumn.IsDone || boardColumn.IsDone;
            foreach (var task in tasksInColumn)
            {
                task.BoardColumnId = targetColumn.Id;
                task.CompletedAt = willTargetBeDone ? (task.CompletedAt ?? DateTime.UtcNow) : null;
                task.UpdatedAt = DateTime.UtcNow;
            }
        }

        // Done status transfer case:
        if (boardColumn.IsDone && request.MoveTasksToColumnId.HasValue)
        {
            var targetColumn = await _dbContext.BoardColumns
                .FirstOrDefaultAsync(c => c.Id == request.MoveTasksToColumnId.Value && c.ProjectId == boardColumn.ProjectId, cancellationToken);
            if (targetColumn != null)
            {
                targetColumn.IsDone = true;
                targetColumn.UpdatedAt = DateTime.UtcNow;

                // Cập nhật CompletedAt cho các công việc có sẵn ở cột đích (nay đã thành cột hoàn thành)
                var existingTasksInTarget = await _dbContext.TaskItems
                    .Where(t => t.BoardColumnId == targetColumn.Id && t.DeletedAt == null && t.CompletedAt == null)
                    .ToListAsync(cancellationToken);
                foreach (var task in existingTasksInTarget)
                {
                    task.CompletedAt = DateTime.UtcNow;
                    task.UpdatedAt = DateTime.UtcNow;
                }
            }
        }

        _dbContext.BoardColumns.Remove(boardColumn);

        // Reorder remaining columns position
        var remainingColumns = await _dbContext.BoardColumns
            .Where(c => c.ProjectId == boardColumn.ProjectId && c.Id != boardColumn.Id)
            .OrderBy(c => c.Position)
            .ToListAsync(cancellationToken);

        for (int i = 0; i < remainingColumns.Count; i++)
        {
            remainingColumns[i].Position = i + 1;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }
}
