using MassTransit;
using MediatR;
using PM.Domain.Events;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Projects.EventHandlers;

public class ProjectUpdatedAISyncHandler : INotificationHandler<ProjectUpdatedEvent>
{
    private readonly IPublishEndpoint _publishEndpoint;

    public ProjectUpdatedAISyncHandler(IPublishEndpoint publishEndpoint)
    {
        _publishEndpoint = publishEndpoint;
    }

    public async Task Handle(ProjectUpdatedEvent notification, CancellationToken cancellationToken)
    {
        try
        {
            await _publishEndpoint.Publish(new EventBus.Messages.Events.ProjectUpdatedIntegrationEvent
            {
                ProjectId = notification.ProjectId,
                Name = notification.ProjectName,
                Description = notification.Description,
                Status = null
            }, cancellationToken);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed to publish ProjectUpdatedIntegrationEvent: {ex.Message}");
        }
    }
}
