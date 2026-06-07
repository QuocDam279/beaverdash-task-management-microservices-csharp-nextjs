using MediatR;
using PM.Application.Contracts;
using PM.Domain.Events;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Teams.EventHandlers;

public class TeamMemberAddedAISyncHandler : INotificationHandler<TeamMemberAddedEvent>
{
    private readonly IAIAssistantServiceClient _aiAssistantClient;

    public TeamMemberAddedAISyncHandler(IAIAssistantServiceClient aiAssistantClient)
    {
        _aiAssistantClient = aiAssistantClient;
    }

    public async Task Handle(TeamMemberAddedEvent notification, CancellationToken cancellationToken)
    {
        try
        {
            foreach (var projectId in notification.ProjectIds)
            {
                await _aiAssistantClient.SyncProjectMembersAsync(projectId, notification.MemberUserIds);
            }
        }
        catch (Exception ex)
        {
            // Fail silently or log
            Console.WriteLine($"Async sync with AIAssistant failed for team members: {ex.Message}");
        }
    }
}
