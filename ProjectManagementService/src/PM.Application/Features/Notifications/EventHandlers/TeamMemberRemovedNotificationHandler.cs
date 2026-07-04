using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using PM.Domain.Entities;
using PM.Domain.Events;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Notifications.EventHandlers;

public class TeamMemberRemovedNotificationHandler : INotificationHandler<TeamMemberRemovedEvent>
{
    private readonly IPMDbContext _dbContext;
    private readonly INotificationService _notificationService;

    public TeamMemberRemovedNotificationHandler(IPMDbContext dbContext, INotificationService notificationService)
    {
        _dbContext = dbContext;
        _notificationService = notificationService;
    }

    public async Task Handle(TeamMemberRemovedEvent notification, CancellationToken cancellationToken)
    {
        // Don't notify yourself if you chose to leave
        if (notification.RemovedUserId == notification.RemovedByUserId)
            return;

        var actorUser = await _dbContext.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == notification.RemovedByUserId, cancellationToken);

        var actorDisplayName = actorUser?.DisplayName ?? "Trưởng nhóm";
        var actorAvatar = actorUser?.Avatar;

        var notif = new Notification
        {
            Id = Guid.CreateVersion7(),
            UserId = notification.RemovedUserId,
            ActorUserId = notification.RemovedByUserId,
            Type = "team_member_removed",
            Content = $"Bạn đã bị xóa khỏi nhóm '{notification.TeamName}' bởi {actorDisplayName}.",
            ActionUrl = "/",
            IsRead = false,
            IsSentViaEmail = false,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.Notifications.Add(notif);
        await _dbContext.SaveChangesAsync(cancellationToken);

        try
        {
            await _notificationService.SendNotificationToUserAsync(
                notif.UserId.ToString(),
                new
                {
                    Id = notif.Id,
                    Type = notif.Type,
                    Content = notif.Content,
                    ActionUrl = notif.ActionUrl,
                    CreatedAt = notif.CreatedAt,
                    ActorUserId = notif.ActorUserId,
                    ActorDisplayName = actorDisplayName,
                    ActorAvatar = actorAvatar
                }
            );
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error sending SignalR team_member_removed notification: {ex.Message}");
        }
    }
}
