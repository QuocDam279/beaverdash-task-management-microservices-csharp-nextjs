using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using PM.Domain.Entities;
using PM.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Tasks.SubTasks.Commands;

public class MoveSubTaskColumnCommandHandler : IRequestHandler<MoveSubTaskColumnCommand, bool>
{
    private readonly IPMDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;

    public MoveSubTaskColumnCommandHandler(IPMDbContext dbContext, ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
    }

    public async Task<bool> Handle(MoveSubTaskColumnCommand request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("Bạn chưa đăng nhập.");

        var subTask = await _dbContext.SubTasks
            .Include(s => s.Task)
                .ThenInclude(t => t!.BoardColumn)
                    .ThenInclude(c => c!.Project)
            .FirstOrDefaultAsync(s => s.Id == request.SubTaskId, cancellationToken);

        if (subTask == null)
            return false;

        var project = subTask.Task!.BoardColumn!.Project!;
        if (!project.TeamId.HasValue)
        {
            throw new UnauthorizedAccessException("Bạn không có quyền sửa SubTask này.");
        }

        var requestingMember = await _dbContext.TeamMembers.FirstOrDefaultAsync(tm => tm.TeamId == project.TeamId.Value && tm.UserId == currentUserId, cancellationToken);
        if (requestingMember == null)
            throw new UnauthorizedAccessException("Bạn không có quyền sửa SubTask này.");

        var targetColumn = await _dbContext.BoardColumns
            .FirstOrDefaultAsync(c => c.Id == request.BoardColumnId && c.ProjectId == project.Id, cancellationToken);

        if (targetColumn == null)
            throw new InvalidOperationException("Cột trạng thái đích không hợp lệ hoặc không thuộc dự án.");

        var changedFields = new List<FieldChange>();

        if (subTask.BoardColumnId != request.BoardColumnId)
        {
            changedFields.Add(new FieldChange("BoardColumnId", subTask.BoardColumnId?.ToString(), request.BoardColumnId.ToString()));
        }

        bool newIsCompleted = targetColumn.IsDone;
        if (subTask.IsCompleted != newIsCompleted)
        {
            changedFields.Add(new FieldChange("IsCompleted", subTask.IsCompleted.ToString(), newIsCompleted.ToString()));
        }

        if (changedFields.Any())
        {
            subTask.AddDomainEvent(new PM.Domain.Events.SubTaskUpdatedEvent(
                project.Id,
                subTask.Id,
                subTask.Task.Id,
                subTask.Task.Title,
                subTask.Title,
                currentUserId,
                changedFields
            ));

            subTask.BoardColumnId = request.BoardColumnId;
            subTask.IsCompleted = newIsCompleted;
            subTask.UpdatedAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync(cancellationToken);
        }

        return true;
    }
}
