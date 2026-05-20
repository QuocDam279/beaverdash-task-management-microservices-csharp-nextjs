using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Tasks.TaskItem.Commands;

public class DeleteTaskCommandHandler : IRequestHandler<DeleteTaskCommand, bool>
{
    private readonly IPMDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;

    public DeleteTaskCommandHandler(IPMDbContext dbContext, ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
    }

    public async Task<bool> Handle(DeleteTaskCommand request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("Bạn chưa đăng nhập.");

        var task = await _dbContext.TaskItems
            .Include(t => t.BoardColumn)
                .ThenInclude(c => c.Project)
            .Include(t => t.SubTasks)
            .FirstOrDefaultAsync(t => t.Id == request.TaskId, cancellationToken);

        if (task == null)
            return false;

        if (task.BoardColumn.Project.TeamId.HasValue)
        {
            var isMember = await _dbContext.TeamMembers.AnyAsync(tm => tm.TeamId == task.BoardColumn.Project.TeamId.Value && tm.UserId == currentUserId, cancellationToken);
            if (!isMember)
                throw new UnauthorizedAccessException("Bạn không có quyền xóa Task này.");
        }
        else if (task.BoardColumn.Project.CreatedByUserId != currentUserId)
        {
            throw new UnauthorizedAccessException("Bạn không có quyền xóa Task này.");
        }

        var now = DateTime.UtcNow;
        task.DeletedAt = now;

        // Cascade soft delete SubTasks
        foreach (var subTask in task.SubTasks)
        {
            subTask.DeletedAt = now;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }
}
