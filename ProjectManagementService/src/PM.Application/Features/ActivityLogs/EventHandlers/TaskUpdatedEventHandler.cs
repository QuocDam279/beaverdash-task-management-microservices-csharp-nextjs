using MediatR;
using PM.Application.Contracts;
using PM.Domain.Entities;
using PM.Domain.Events;
using System;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.ActivityLogs.EventHandlers;

public class TaskUpdatedEventHandler : INotificationHandler<TaskUpdatedEvent>
{
    private readonly IPMDbContext _dbContext;

    public TaskUpdatedEventHandler(IPMDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task Handle(TaskUpdatedEvent notification, CancellationToken cancellationToken)
    {
        foreach (var change in notification.ChangedFields)
        {
            string actionType;
            string newValueJson;

            if (change.FieldName == "Title")
            {
                actionType = "updated_title";
                newValueJson = JsonSerializer.Serialize(new { title = change.NewValue, old_title = change.OldValue });
            }
            else if (change.FieldName == "Description")
            {
                actionType = "updated_description";
                newValueJson = JsonSerializer.Serialize(new { title = notification.TaskTitle });
            }
            else if (change.FieldName == "DueDate")
            {
                actionType = "updated_due_date";
                DateTime? dueDate = null;
                if (!string.IsNullOrEmpty(change.NewValue) && DateTime.TryParse(change.NewValue, out var dt))
                {
                    dueDate = dt;
                }
                newValueJson = JsonSerializer.Serialize(new { title = notification.TaskTitle, due_date = dueDate });
            }
            else if (change.FieldName == "StartDate")
            {
                actionType = "updated_start_date";
                DateTime? startDate = null;
                if (!string.IsNullOrEmpty(change.NewValue) && DateTime.TryParse(change.NewValue, out var dt))
                {
                    startDate = dt;
                }
                newValueJson = JsonSerializer.Serialize(new { title = notification.TaskTitle, start_date = startDate });
            }
            else if (change.FieldName == "Priority")
            {
                actionType = "updated_priority";
                newValueJson = JsonSerializer.Serialize(new { title = notification.TaskTitle, priority = change.NewValue, old_priority = change.OldValue });
            }
            else
            {
                continue;
            }

            var activityLog = new ActivityLog
            {
                Id = Guid.CreateVersion7(),
                ProjectId = notification.ProjectId,
                UserId = notification.UserId,
                EntityType = "task",
                EntityId = notification.TaskId,
                ActionType = actionType,
                NewValue = newValueJson,
                CreatedAt = DateTime.UtcNow
            };

            _dbContext.ActivityLogs.Add(activityLog);
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
