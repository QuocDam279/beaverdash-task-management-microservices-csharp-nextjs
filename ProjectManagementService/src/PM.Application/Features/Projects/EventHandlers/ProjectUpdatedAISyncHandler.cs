using MediatR;
using PM.Application.Contracts;
using PM.Domain.Events;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Projects.EventHandlers;

public class ProjectUpdatedAISyncHandler : INotificationHandler<ProjectUpdatedEvent>
{
    private readonly IAIAssistantServiceClient _aiAssistantClient;

    public ProjectUpdatedAISyncHandler(IAIAssistantServiceClient aiAssistantClient)
    {
        _aiAssistantClient = aiAssistantClient;
    }

    public async Task Handle(ProjectUpdatedEvent notification, CancellationToken cancellationToken)
    {
        try
        {
            await _aiAssistantClient.SyncProjectAsync(
                notification.ProjectId,
                notification.ProjectName,
                notification.Description,
                null
            );
        }
        catch (Exception ex)
        {
            // Fail silently or log
            Console.WriteLine($"Async sync with AIAssistant failed for project: {ex.Message}");
        }
    }
}
