using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.BoardColumns.Commands;

public class UpdateBoardColumnCommandHandler : IRequestHandler<UpdateBoardColumnCommand, bool>
{
    private readonly IPMDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;

    public UpdateBoardColumnCommandHandler(IPMDbContext dbContext, ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
    }

    public async Task<bool> Handle(UpdateBoardColumnCommand request, CancellationToken cancellationToken)
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
            throw new UnauthorizedAccessException("Bạn không có quyền sửa cột của Project này.");
        }

        var member = await _dbContext.TeamMembers.FirstOrDefaultAsync(tm => tm.TeamId == project.TeamId.Value && tm.UserId == currentUserId, cancellationToken);
        if (member == null || (member.Role != "leader" && member.Role != "Owner"))
            throw new UnauthorizedAccessException("Chỉ có trưởng nhóm mới có quyền sửa cột của Project này.");

        boardColumn.Name = request.Name;
        boardColumn.Position = request.Position;
        boardColumn.WipLimit = request.WipLimit;
        boardColumn.UpdatedAt = DateTime.UtcNow;

        // If setting this column as IsDone, reset all other columns of this project
        bool originalIsDone = boardColumn.IsDone;
        if (request.IsDone && !originalIsDone)
        {
            var otherColumns = await _dbContext.BoardColumns
                .Where(c => c.ProjectId == boardColumn.ProjectId && c.Id != boardColumn.Id)
                .ToListAsync(cancellationToken);

            foreach (var col in otherColumns)
            {
                if (col.IsDone)
                {
                    col.IsDone = false;
                    col.UpdatedAt = DateTime.UtcNow;

                    // Reset CompletedAt for tasks in this column that is no longer Done
                    var tasksInCol = await _dbContext.TaskItems
                        .Where(t => t.BoardColumnId == col.Id && t.DeletedAt == null)
                        .ToListAsync(cancellationToken);
                    foreach (var t in tasksInCol)
                    {
                        t.CompletedAt = null;
                        t.UpdatedAt = DateTime.UtcNow;
                    }
                }
            }
            boardColumn.IsDone = true;

            // Set CompletedAt for tasks in this column that is now Done
            var tasksInBoardColumn = await _dbContext.TaskItems
                .Where(t => t.BoardColumnId == boardColumn.Id && t.DeletedAt == null)
                .ToListAsync(cancellationToken);
            foreach (var t in tasksInBoardColumn)
            {
                t.CompletedAt = t.CompletedAt ?? DateTime.UtcNow;
                t.UpdatedAt = DateTime.UtcNow;
            }
        }
        else if (!request.IsDone && originalIsDone)
        {
            boardColumn.IsDone = false;

            // Reset CompletedAt for tasks in this column that is no longer Done
            var tasksInBoardColumn = await _dbContext.TaskItems
                .Where(t => t.BoardColumnId == boardColumn.Id && t.DeletedAt == null)
                .ToListAsync(cancellationToken);
            foreach (var t in tasksInBoardColumn)
            {
                t.CompletedAt = null;
                t.UpdatedAt = DateTime.UtcNow;
            }
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }
}
