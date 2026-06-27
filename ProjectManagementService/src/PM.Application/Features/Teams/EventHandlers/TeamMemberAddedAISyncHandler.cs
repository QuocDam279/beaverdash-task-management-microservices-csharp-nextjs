using MassTransit;
using MediatR;
using PM.Domain.Events;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Teams.EventHandlers;

public class TeamMemberAddedAISyncHandler : INotificationHandler<TeamMemberAddedEvent>
{
    private readonly IPublishEndpoint _publishEndpoint;

    public TeamMemberAddedAISyncHandler(IPublishEndpoint publishEndpoint)
    {
        _publishEndpoint = publishEndpoint;
    }

    public async Task Handle(TeamMemberAddedEvent notification, CancellationToken cancellationToken)
    {
        try
        {
            foreach (var projectId in notification.ProjectIds)
            {
                await _publishEndpoint.Publish(new EventBus.Messages.Events.ProjectMembersSyncedEvent
                {
                    ProjectId = projectId,
                    MemberUserIds = notification.MemberUserIds
                }, cancellationToken);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed to publish ProjectMembersSyncedEvent: {ex.Message}");
        }
    }
}
