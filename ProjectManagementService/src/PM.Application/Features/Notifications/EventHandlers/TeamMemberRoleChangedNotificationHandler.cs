using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using PM.Domain.Entities;
using PM.Domain.Events;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Notifications.EventHandlers;

public class TeamMemberRoleChangedNotificationHandler : INotificationHandler<TeamMemberRoleChangedEvent>
{
    private readonly IPMDbContext _dbContext;
    private readonly INotificationService _notificationService;

    public TeamMemberRoleChangedNotificationHandler(IPMDbContext dbContext, INotificationService notificationService)
    {
        _dbContext = dbContext;
        _notificationService = notificationService;
    }

    public async Task Handle(TeamMemberRoleChangedEvent notification, CancellationToken cancellationToken)
    {
        // Don't notify yourself if you somehow changed your own role
        if (notification.UserId == notification.UpdatedByUserId)
            return;

        var actorUser = await _dbContext.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == notification.UpdatedByUserId, cancellationToken);

        var actorDisplayName = actorUser?.DisplayName ?? "Trưởng nhóm";
        var actorAvatar = actorUser?.Avatar;

        string oldRoleVN = notification.OldRole.ToLower() == "leader" ? "Trưởng nhóm" : "Thành viên";
        string newRoleVN = notification.NewRole.ToLower() == "leader" ? "Trưởng nhóm" : "Thành viên";

        var notif = new Notification
        {
            Id = Guid.CreateVersion7(),
            UserId = notification.UserId,
            ActorUserId = notification.UpdatedByUserId,
            Type = "team_role_changed",
            Content = $"Vai trò của bạn trong nhóm '{notification.TeamName}' đã được thay đổi từ '{oldRoleVN}' thành '{newRoleVN}' bởi {actorDisplayName}.",
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
            Console.WriteLine($"Error sending SignalR team_role_changed notification: {ex.Message}");
        }
    }
}
