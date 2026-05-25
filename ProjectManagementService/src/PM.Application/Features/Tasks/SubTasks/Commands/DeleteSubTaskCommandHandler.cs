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
        if (project.TeamId.HasValue)
        {
            var requestingMember = await _dbContext.TeamMembers.FirstOrDefaultAsync(tm => tm.TeamId == project.TeamId.Value && tm.UserId == currentUserId, cancellationToken);
            if (requestingMember == null)
                throw new UnauthorizedAccessException("Bạn không có quyền xóa SubTask này.");

            bool isLeader = requestingMember.Role == "leader";
            bool isParentAssignee = subTask.Task.AssigneeUserId == currentUserId;

            if (!isLeader && !isParentAssignee)
            {
                throw new UnauthorizedAccessException("Chỉ có trưởng nhóm hoặc người được giao thực hiện công việc cha mới có quyền xóa công việc con này.");
            }
        }
        else if (project.CreatedByUserId != currentUserId)
        {
            throw new UnauthorizedAccessException("Bạn không có quyền xóa SubTask này.");
        }

        subTask.DeletedAt = DateTime.UtcNow;

        var activityLog = new ActivityLog
        {
            Id = Guid.NewGuid(),
            ProjectId = project.Id,
            UserId = currentUserId,
            EntityType = "subtask",
            EntityId = subTask.Id,
            ActionType = "deleted",
            NewValue = System.Text.Json.JsonSerializer.Serialize(new { title = subTask.Title, parent_task_title = subTask.Task.Title, task_id = subTask.Task.Id }),
            CreatedAt = DateTime.UtcNow
        };
        _dbContext.ActivityLogs.Add(activityLog);

        await _dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }
}
