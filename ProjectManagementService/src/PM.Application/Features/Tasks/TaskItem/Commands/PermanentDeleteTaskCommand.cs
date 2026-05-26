using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using PM.Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Tasks.TaskItem.Commands;

public class PermanentDeleteTaskCommand : IRequest<bool>
{
    public Guid TaskId { get; set; }
}

public class PermanentDeleteTaskCommandHandler : IRequestHandler<PermanentDeleteTaskCommand, bool>
{
    private readonly IPMDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;

    public PermanentDeleteTaskCommandHandler(IPMDbContext dbContext, ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
    }

    public async Task<bool> Handle(PermanentDeleteTaskCommand request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("Bạn chưa đăng nhập.");

        var task = await _dbContext.TaskItems
            .IgnoreQueryFilters()
            .Include(t => t.BoardColumn)
                .ThenInclude(c => c.Project)
            .FirstOrDefaultAsync(t => t.Id == request.TaskId, cancellationToken);

        if (task == null)
            return false;

        // Authorization check (only leader can permanently delete in a team project)
        if (task.BoardColumn.Project.TeamId.HasValue)
        {
            var requestingMember = await _dbContext.TeamMembers
                .FirstOrDefaultAsync(tm => tm.TeamId == task.BoardColumn.Project.TeamId.Value && tm.UserId == currentUserId, cancellationToken);

            bool isLeader = requestingMember != null && (requestingMember.Role == "leader" || requestingMember.Role == "Owner");

            if (!isLeader)
            {
                throw new UnauthorizedAccessException("Chỉ có trưởng nhóm mới có quyền xóa vĩnh viễn công việc.");
            }
        }
        else if (task.BoardColumn.Project.CreatedByUserId != currentUserId)
        {
            throw new UnauthorizedAccessException("Bạn không có quyền xóa vĩnh viễn công việc này.");
        }

        var activityLog = new ActivityLog
        {
            Id = Guid.NewGuid(),
            ProjectId = task.BoardColumn.ProjectId,
            UserId = currentUserId,
            EntityType = "task",
            EntityId = task.Id,
            ActionType = "permanently_deleted",
            NewValue = System.Text.Json.JsonSerializer.Serialize(new { title = task.Title }),
            CreatedAt = DateTime.UtcNow
        };
        _dbContext.ActivityLogs.Add(activityLog);

        _dbContext.TaskItems.Remove(task);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }
}
