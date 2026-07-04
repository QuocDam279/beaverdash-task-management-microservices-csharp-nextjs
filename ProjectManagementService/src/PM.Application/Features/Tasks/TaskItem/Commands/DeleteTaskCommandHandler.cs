using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using PM.Domain.Entities;
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
                .ThenInclude(c => c!.Project)
            .Include(t => t.SubTasks)
            .FirstOrDefaultAsync(t => t.Id == request.TaskId, cancellationToken);

        if (task == null)
            return false;

        if (task.BoardColumn == null || task.BoardColumn.Project == null || !task.BoardColumn.Project.TeamId.HasValue)
        {
            throw new UnauthorizedAccessException("Bạn không có quyền xóa Task này.");
        }

        var requestingMember = await _dbContext.TeamMembers.FirstOrDefaultAsync(tm => tm.TeamId == task.BoardColumn.Project.TeamId.Value && tm.UserId == currentUserId, cancellationToken);
        if (requestingMember == null)
            throw new UnauthorizedAccessException("Bạn không có quyền xóa Task này.");

        bool isLeader = requestingMember.Role == "leader" || requestingMember.Role == "Owner";
        if (!isLeader && task.CreatedByUserId != currentUserId)
        {
            throw new UnauthorizedAccessException("Bạn chỉ có quyền xóa công việc do chính mình tạo ra.");
        }

        var now = DateTime.UtcNow;
        task.DeletedAt = now;
        task.DeletedByUserId = currentUserId;

        // Cascade soft delete SubTasks
        foreach (var subTask in task.SubTasks)
        {
            subTask.DeletedAt = now;
        }

        task.AddDomainEvent(new PM.Domain.Events.TaskDeletedEvent(
            task.BoardColumn!.ProjectId,
            task.Id,
            task.Title,
            currentUserId
        ));

        await _dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }
}
