using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using PM.Domain.Entities;
using PM.Domain.Events;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.ActivityLogs.EventHandlers;

public class TaskCreatedEventHandler : INotificationHandler<TaskCreatedEvent>
{
    private readonly IPMDbContext _dbContext;

    public TaskCreatedEventHandler(IPMDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task Handle(TaskCreatedEvent notification, CancellationToken cancellationToken)
    {
        var newValueObj = new { title = notification.Title };

        var activityLog = new ActivityLog
        {
            Id = Guid.CreateVersion7(),
            ProjectId = notification.ProjectId,
            UserId = notification.UserId, // Người tạo task
            EntityType = "task",
            EntityId = notification.TaskId,
            ActionType = "created",
            NewValue = System.Text.Json.JsonSerializer.Serialize(newValueObj),
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.ActivityLogs.Add(activityLog);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
