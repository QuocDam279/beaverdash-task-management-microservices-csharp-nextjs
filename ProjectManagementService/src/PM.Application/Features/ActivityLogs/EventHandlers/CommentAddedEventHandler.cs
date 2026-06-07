using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using PM.Domain.Entities;
using PM.Domain.Events;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.ActivityLogs.EventHandlers;

public class CommentAddedEventHandler : INotificationHandler<CommentAddedEvent>
{
    private readonly IPMDbContext _dbContext;

    public CommentAddedEventHandler(IPMDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task Handle(CommentAddedEvent notification, CancellationToken cancellationToken)
    {
        var newValueObj = new 
        { 
            content = notification.Content,
            subtask_title = notification.SubTaskTitle,
            task_title = notification.TaskTitle,
            task_id = notification.TaskId
        };

        var activityLog = new ActivityLog
        {
            Id = Guid.CreateVersion7(),
            ProjectId = notification.ProjectId,
            UserId = notification.UserId,
            EntityType = "comment",
            EntityId = notification.CommentId,
            ActionType = "created",
            NewValue = System.Text.Json.JsonSerializer.Serialize(newValueObj),
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.ActivityLogs.Add(activityLog);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
