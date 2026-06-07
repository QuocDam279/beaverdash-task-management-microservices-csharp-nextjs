using MediatR;
using PM.Application.Contracts;
using PM.Domain.Entities;
using PM.Domain.Events;
using System;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.ActivityLogs.EventHandlers;

public class ProjectDocumentUploadedEventHandler : INotificationHandler<ProjectDocumentUploadedEvent>
{
    private readonly IPMDbContext _dbContext;

    public ProjectDocumentUploadedEventHandler(IPMDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task Handle(ProjectDocumentUploadedEvent notification, CancellationToken cancellationToken)
    {
        var activityLog = new ActivityLog
        {
            Id = Guid.CreateVersion7(),
            ProjectId = notification.ProjectId,
            UserId = notification.UserId,
            EntityType = "ProjectDocument",
            EntityId = notification.DocumentId,
            ActionType = "Upload",
            OldValue = null,
            NewValue = JsonSerializer.Serialize(notification.FileName),
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.ActivityLogs.Add(activityLog);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
