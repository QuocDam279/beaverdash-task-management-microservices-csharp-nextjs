using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using PM.Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Tasks.SubTasks.Commands;

public class DeleteSubTaskCommandHandler : IRequestHandler<DeleteSubTaskCommand, bool>
{
    private readonly IPMDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;

    public DeleteSubTaskCommandHandler(IPMDbContext dbContext, ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
    }

    public async Task<bool> Handle(DeleteSubTaskCommand request, CancellationToken cancellationToken)
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
            throw new UnauthorizedAccessException("Bạn không có quyền xóa SubTask này.");
        }

        var requestingMember = await _dbContext.TeamMembers.FirstOrDefaultAsync(tm => tm.TeamId == project.TeamId.Value && tm.UserId == currentUserId, cancellationToken);
        if (requestingMember == null)
            throw new UnauthorizedAccessException("Bạn không có quyền xóa SubTask này.");

        bool isLeader = requestingMember.Role == "leader" || requestingMember.Role == "Owner";
        bool isTaskCreator = subTask.Task!.CreatedByUserId == currentUserId;
        bool hasAssignedSubTask = await _dbContext.SubTasks
            .AnyAsync(st => st.TaskId == subTask.TaskId && st.AssigneeUserId == currentUserId && st.DeletedAt == null, cancellationToken);

        if (!isLeader && !isTaskCreator && !hasAssignedSubTask)
        {
            throw new UnauthorizedAccessException("Bạn không có quyền thao tác trên công việc này vì chưa được giao bất kỳ nhiệm vụ nào.");
        }

        subTask.DeletedAt = DateTime.UtcNow;

        subTask.AddDomainEvent(new PM.Domain.Events.SubTaskDeletedEvent(
            project.Id,
            subTask.Id,
            subTask.Task.Id,
            subTask.Task.Title,
            subTask.Title,
            currentUserId
        ));

        await _dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }
}
