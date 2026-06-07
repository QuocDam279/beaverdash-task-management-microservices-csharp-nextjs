using MediatR;
using PM.Application.Contracts;
using PM.Domain.Entities;
using PM.Domain.Events;
using System;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.ActivityLogs.EventHandlers;

public class SubTaskCreatedEventHandler : INotificationHandler<SubTaskCreatedEvent>
{
    private readonly IPMDbContext _dbContext;

    public SubTaskCreatedEventHandler(IPMDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task Handle(SubTaskCreatedEvent notification, CancellationToken cancellationToken)
    {
        var newValueObj = new 
        { 
            title = notification.SubTaskTitle, 
            parent_task_title = notification.TaskTitle, 
            task_id = notification.TaskId 
        };

        var activityLog = new ActivityLog
        {
            Id = Guid.CreateVersion7(),
            ProjectId = notification.ProjectId,
            UserId = notification.UserId,
            EntityType = "subtask",
            EntityId = notification.SubTaskId,
            ActionType = "created",
            NewValue = JsonSerializer.Serialize(newValueObj),
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.ActivityLogs.Add(activityLog);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
