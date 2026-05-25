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
        var task = await _dbContext.TaskItems
            .Include(t => t.BoardColumn)
            .FirstOrDefaultAsync(t => t.Id == notification.TaskId, cancellationToken);

        if (task == null || task.BoardColumn == null)
            return;

        // Fetch old and new column names
        var oldColumn = await _dbContext.BoardColumns.AsNoTracking().FirstOrDefaultAsync(c => c.Id == notification.OldColumnId, cancellationToken);
        var newColumn = await _dbContext.BoardColumns.AsNoTracking().FirstOrDefaultAsync(c => c.Id == notification.NewColumnId, cancellationToken);

        // Định dạng cột cũ và cột mới thành JSON để lưu vào NewValue
        var newValueObj = new 
        {
            task_title = task.Title,
            old_column_id = notification.OldColumnId,
            old_column_name = oldColumn?.Name ?? "Không rõ",
            new_column_id = notification.NewColumnId,
            new_column_name = newColumn?.Name ?? "Không rõ"
        };

        var activityLog = new ActivityLog
        {
            Id = Guid.NewGuid(),
            ProjectId = task.BoardColumn.ProjectId,
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
