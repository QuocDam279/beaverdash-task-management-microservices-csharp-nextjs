using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using PM.Domain.Entities;
using PM.Domain.Events;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.ActivityLogs.EventHandlers;

public class TaskAssignedEventHandler : INotificationHandler<TaskAssignedEvent>
{
    private readonly IPMDbContext _dbContext;

    public TaskAssignedEventHandler(IPMDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task Handle(TaskAssignedEvent notification, CancellationToken cancellationToken)
    {
        var task = await _dbContext.TaskItems
            .Include(t => t.BoardColumn)
            .FirstOrDefaultAsync(t => t.Id == notification.TaskId, cancellationToken);

        if (task == null || task.BoardColumn == null)
            return;

        var newValueObj = new { assignee_user_id = notification.AssigneeUserId };

        var activityLog = new ActivityLog
        {
            Id = Guid.NewGuid(),
            ProjectId = task.BoardColumn.ProjectId,
            UserId = notification.ActorUserId, // Người thực hiện giao việc
            EntityType = "task",
            EntityId = notification.TaskId,
            ActionType = "assigned",
            NewValue = System.Text.Json.JsonSerializer.Serialize(newValueObj), // Serialize JSON hợp lệ
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.ActivityLogs.Add(activityLog);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
