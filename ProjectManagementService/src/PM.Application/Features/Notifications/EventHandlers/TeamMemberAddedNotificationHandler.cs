using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using PM.Domain.Entities;
using PM.Domain.Events;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Notifications.EventHandlers;

public class TeamMemberAddedNotificationHandler : INotificationHandler<TeamMemberAddedEvent>
{
    private readonly IPMDbContext _dbContext;
    private readonly INotificationService _notificationService;

    public TeamMemberAddedNotificationHandler(IPMDbContext dbContext, INotificationService notificationService)
    {
        _dbContext = dbContext;
        _notificationService = notificationService;
    }

    public async Task Handle(TeamMemberAddedEvent notification, CancellationToken cancellationToken)
    {
        var inviteNotif = new Notification
        {
            Id = Guid.CreateVersion7(),
            UserId = notification.NewMemberUserId,
            ActorUserId = notification.UserId,
            Type = "team_invited",
            Content = $"Bạn đã được thêm vào nhóm '{notification.TeamName}'.",
            ActionUrl = $"/teams/{notification.TeamId}",
            IsRead = false,
            IsSentViaEmail = false,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.Notifications.Add(inviteNotif);
        await _dbContext.SaveChangesAsync(cancellationToken);

        try
        {
            var actorUser = await _dbContext.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == notification.UserId, cancellationToken);

            await _notificationService.SendNotificationToUserAsync(
                inviteNotif.UserId.ToString(),
                new
                {
                    Id = inviteNotif.Id,
                    Type = inviteNotif.Type,
                    Content = inviteNotif.Content,
                    ActionUrl = inviteNotif.ActionUrl,
                    CreatedAt = inviteNotif.CreatedAt,
                    ActorUserId = inviteNotif.ActorUserId,
                    ActorDisplayName = actorUser?.DisplayName ?? "Unknown User",
                    ActorAvatar = actorUser?.Avatar
                }
            );
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error sending SignalR notification for team invitation: {ex.Message}");
        }
    }
}
