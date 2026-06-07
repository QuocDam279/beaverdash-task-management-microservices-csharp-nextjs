using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using PM.Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Tasks.TaskItem.Commands;

public class RestoreTaskCommand : IRequest<bool>
{
    public Guid TaskId { get; set; }
}

public class RestoreTaskCommandHandler : IRequestHandler<RestoreTaskCommand, bool>
{
    private readonly IPMDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;

    public RestoreTaskCommandHandler(IPMDbContext dbContext, ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
    }

    public async Task<bool> Handle(RestoreTaskCommand request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("Bạn chưa đăng nhập.");

        var task = await _dbContext.TaskItems
            .IgnoreQueryFilters()
            .Include(t => t.BoardColumn)
                .ThenInclude(c => c!.Project)
            .Include(t => t.SubTasks)
            .FirstOrDefaultAsync(t => t.Id == request.TaskId, cancellationToken);

        if (task == null)
            return false;

        if (task.BoardColumn == null || task.BoardColumn.Project == null || !task.BoardColumn.Project.TeamId.HasValue)
        {
            throw new UnauthorizedAccessException("Bạn không có quyền khôi phục công việc này.");
        }

        var isMember = await _dbContext.TeamMembers.AnyAsync(tm => tm.TeamId == task.BoardColumn.Project.TeamId.Value && tm.UserId == currentUserId, cancellationToken);
        if (!isMember)
            throw new UnauthorizedAccessException("Bạn không có quyền khôi phục công việc này.");

        task.DeletedAt = null;

        // Restore SubTasks cascade
        foreach (var subTask in task.SubTasks)
        {
            subTask.DeletedAt = null;
        }

        task.AddDomainEvent(new PM.Domain.Events.TaskRestoredEvent(
            task.BoardColumn!.ProjectId,
            task.Id,
            task.Title,
            currentUserId
        ));

        await _dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }
}
