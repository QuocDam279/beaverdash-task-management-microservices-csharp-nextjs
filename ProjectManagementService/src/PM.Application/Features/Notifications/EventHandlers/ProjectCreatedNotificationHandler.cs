using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using PM.Domain.Entities;
using PM.Domain.Events;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Notifications.EventHandlers;

public class ProjectCreatedNotificationHandler : INotificationHandler<ProjectCreatedEvent>
{
    private readonly IPMDbContext _dbContext;
    private readonly INotificationService _notificationService;

    public ProjectCreatedNotificationHandler(IPMDbContext dbContext, INotificationService notificationService)
    {
        _dbContext = dbContext;
        _notificationService = notificationService;
    }

    public async Task Handle(ProjectCreatedEvent notification, CancellationToken cancellationToken)
    {
        var teamMembers = await _dbContext.TeamMembers
            .AsNoTracking()
            .Where(tm => tm.TeamId == notification.TeamId)
            .ToListAsync(cancellationToken);

        var actorUser = await _dbContext.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == notification.CreatedByUserId, cancellationToken);

        var actorDisplayName = actorUser?.DisplayName ?? "Trưởng nhóm";
        var actorAvatar = actorUser?.Avatar;

        foreach (var member in teamMembers)
        {
            // Do not notify the person who created the project
            if (member.UserId == notification.CreatedByUserId)
                continue;

            var notif = new Notification
            {
                Id = Guid.CreateVersion7(),
                UserId = member.UserId,
                ActorUserId = notification.CreatedByUserId,
                Type = "project_created_in_team",
                Content = $"Dự án mới '{notification.ProjectName}' đã được tạo trong nhóm bởi {actorDisplayName}.",
                ActionUrl = $"/projects/{notification.ProjectId}/board",
                IsRead = false,
                IsSentViaEmail = false,
                CreatedAt = DateTime.UtcNow
            };

            _dbContext.Notifications.Add(notif);
            await _dbContext.SaveChangesAsync(cancellationToken);

            try
            {
                await _notificationService.SendNotificationToUserAsync(
                    member.UserId.ToString(),
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
                Console.WriteLine($"Error sending SignalR project_created_in_team notification: {ex.Message}");
            }
        }
    }
}
