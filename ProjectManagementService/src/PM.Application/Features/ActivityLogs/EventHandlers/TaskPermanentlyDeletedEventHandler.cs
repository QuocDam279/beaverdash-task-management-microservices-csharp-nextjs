using MediatR;
using PM.Application.Contracts;
using PM.Domain.Entities;
using PM.Domain.Events;
using System;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.ActivityLogs.EventHandlers;

public class TaskPermanentlyDeletedEventHandler : INotificationHandler<TaskPermanentlyDeletedEvent>
{
    private readonly IPMDbContext _dbContext;

    public TaskPermanentlyDeletedEventHandler(IPMDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task Handle(TaskPermanentlyDeletedEvent notification, CancellationToken cancellationToken)
    {
        var newValueObj = new { title = notification.TaskTitle };

        var activityLog = new ActivityLog
        {
            Id = Guid.CreateVersion7(),
            ProjectId = notification.ProjectId,
            UserId = notification.UserId,
            EntityType = "task",
            EntityId = notification.TaskId,
            ActionType = "permanently_deleted",
            NewValue = JsonSerializer.Serialize(newValueObj),
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.ActivityLogs.Add(activityLog);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
