using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using PM.Domain.Entities;
using PM.Domain.Events;
using System;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.ActivityLogs.EventHandlers;

public class TaskMovedEventHandler : INotificationHandler<TaskMovedEvent>
{
    private readonly IPMDbContext _dbContext;

    public TaskMovedEventHandler(IPMDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task Handle(TaskMovedEvent notification, CancellationToken cancellationToken)
    {
        // Định dạng cột cũ và cột mới thành JSON để lưu vào NewValue
        var newValueObj = new 
        {
            task_title = notification.TaskTitle,
            old_column_id = notification.OldColumnId,
            old_column_name = notification.OldColumnName,
            new_column_id = notification.NewColumnId,
            new_column_name = notification.NewColumnName
        };

        var activityLog = new ActivityLog
        {
            Id = Guid.CreateVersion7(),
            ProjectId = notification.ProjectId,
            UserId = notification.UserId,
            EntityType = "task",
            EntityId = notification.TaskId,
            ActionType = "moved",
            NewValue = JsonSerializer.Serialize(newValueObj),
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.ActivityLogs.Add(activityLog);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
