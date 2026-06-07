using MediatR;
using PM.Application.Contracts;
using PM.Domain.Entities;
using PM.Domain.Events;
using System;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.ActivityLogs.EventHandlers;

public class ProjectUpdatedEventHandler : INotificationHandler<ProjectUpdatedEvent>
{
    private readonly IPMDbContext _dbContext;

    public ProjectUpdatedEventHandler(IPMDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task Handle(ProjectUpdatedEvent notification, CancellationToken cancellationToken)
    {
        foreach (var change in notification.ChangedFields)
        {
            string actionType;
            string newValueJson;

            if (change.FieldName == "IsPublic")
            {
                bool isPublic = bool.Parse(change.NewValue ?? "false");
                actionType = isPublic ? "public_shared" : "private_restricted";
                newValueJson = JsonSerializer.Serialize(new { isPublic = isPublic });
            }
            else if (change.FieldName == "Name")
            {
                actionType = "updated_name";
                newValueJson = JsonSerializer.Serialize(new { name = change.NewValue, old_name = change.OldValue });
            }
            else if (change.FieldName == "Description")
            {
                actionType = "updated_description";
                newValueJson = JsonSerializer.Serialize(new { name = notification.ProjectName });
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
                EntityType = "project",
                EntityId = notification.ProjectId,
                ActionType = actionType,
                NewValue = newValueJson,
                CreatedAt = DateTime.UtcNow
            };

            _dbContext.ActivityLogs.Add(activityLog);
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
