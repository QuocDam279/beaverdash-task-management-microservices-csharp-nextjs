using MediatR;
using PM.Application.Contracts;
using PM.Domain.Entities;
using PM.Domain.Events;
using System;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.ActivityLogs.EventHandlers;

public class ProjectDocumentDeletedEventHandler : INotificationHandler<ProjectDocumentDeletedEvent>
{
    private readonly IPMDbContext _dbContext;

    public ProjectDocumentDeletedEventHandler(IPMDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task Handle(ProjectDocumentDeletedEvent notification, CancellationToken cancellationToken)
    {
        var activityLog = new ActivityLog
        {
            Id = Guid.CreateVersion7(),
            ProjectId = notification.ProjectId,
            UserId = notification.UserId,
            EntityType = "ProjectDocument",
            EntityId = notification.DocumentId,
            ActionType = "Delete",
            OldValue = JsonSerializer.Serialize(notification.FileName),
            NewValue = null,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.ActivityLogs.Add(activityLog);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
