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

public class SubTaskUpdatedEventHandler : INotificationHandler<SubTaskUpdatedEvent>
{
    private readonly IPMDbContext _dbContext;

    public SubTaskUpdatedEventHandler(IPMDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task Handle(SubTaskUpdatedEvent notification, CancellationToken cancellationToken)
    {
        foreach (var change in notification.ChangedFields)
        {
            string actionType;
            string newValueJson;

            if (change.FieldName == "IsCompleted")
            {
                bool isCompleted = bool.Parse(change.NewValue ?? "false");
                actionType = isCompleted ? "completed" : "incomplete";
                newValueJson = JsonSerializer.Serialize(new 
                { 
                    title = notification.SubTaskTitle, 
                    parent_task_title = notification.TaskTitle, 
                    task_id = notification.TaskId 
                });
            }
            else if (change.FieldName == "AssigneeUserId")
            {
                actionType = "assigned";
                var assigneeName = "Chưa phân công";
                if (!string.IsNullOrEmpty(change.NewValue) && Guid.TryParse(change.NewValue, out var assigneeId))
                {
                    var assigneeUser = await _dbContext.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == assigneeId, cancellationToken);
                    assigneeName = assigneeUser?.DisplayName ?? "Chưa phân công";
                }

                newValueJson = JsonSerializer.Serialize(new 
                { 
                    title = notification.SubTaskTitle, 
                    parent_task_title = notification.TaskTitle,
                    assignee_user_id = change.NewValue,
                    assignee_name = assigneeName,
                    task_id = notification.TaskId
                });
            }
            else if (change.FieldName == "DueDate")
            {
                actionType = "updated_deadline";
                newValueJson = JsonSerializer.Serialize(new 
                { 
                    title = notification.SubTaskTitle, 
                    parent_task_title = notification.TaskTitle,
                    due_date = change.NewValue,
                    task_id = notification.TaskId
                });
            }
            else if (change.FieldName == "Title")
            {
                actionType = "updated_title";
                newValueJson = JsonSerializer.Serialize(new 
                { 
                    title = change.NewValue, 
                    old_title = change.OldValue,
                    parent_task_title = notification.TaskTitle,
                    task_id = notification.TaskId
                });
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
                EntityType = "subtask",
                EntityId = notification.SubTaskId,
                ActionType = actionType,
                NewValue = newValueJson,
                CreatedAt = DateTime.UtcNow
            };

            _dbContext.ActivityLogs.Add(activityLog);
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
