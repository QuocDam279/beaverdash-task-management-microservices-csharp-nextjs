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

public class SprintStatusChangedNotificationHandler : 
    INotificationHandler<SprintStartedEvent>,
    INotificationHandler<SprintClosedEvent>
{
    private readonly IPMDbContext _dbContext;
    private readonly INotificationService _notificationService;

    public SprintStatusChangedNotificationHandler(IPMDbContext dbContext, INotificationService notificationService)
    {
        _dbContext = dbContext;
        _notificationService = notificationService;
    }

    public async Task Handle(SprintStartedEvent notification, CancellationToken cancellationToken)
    {
        var project = await _dbContext.Projects
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == notification.ProjectId, cancellationToken);

        if (project == null || !project.TeamId.HasValue)
            return;

        var teamMembers = await _dbContext.TeamMembers
            .AsNoTracking()
            .Where(tm => tm.TeamId == project.TeamId.Value)
            .ToListAsync(cancellationToken);

        var actorUser = await _dbContext.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == notification.StartedByUserId, cancellationToken);

        var actorDisplayName = actorUser?.DisplayName ?? "Một thành viên";
        var actorAvatar = actorUser?.Avatar;

        foreach (var member in teamMembers)
        {
            // Do not notify the person who started the sprint
            if (member.UserId == notification.StartedByUserId)
                continue;

            var notif = new Notification
            {
                Id = Guid.CreateVersion7(),
                UserId = member.UserId,
                ActorUserId = notification.StartedByUserId,
                Type = "sprint_started",
                Content = $"Sprint '{notification.SprintName}' của dự án '{project.Name}' đã được bắt đầu bởi {actorDisplayName}.",
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
                Console.WriteLine($"Error sending SignalR sprint_started notification: {ex.Message}");
            }
        }
    }

    public async Task Handle(SprintClosedEvent notification, CancellationToken cancellationToken)
    {
        var project = await _dbContext.Projects
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == notification.ProjectId, cancellationToken);

        if (project == null || !project.TeamId.HasValue)
            return;

        var teamMembers = await _dbContext.TeamMembers
            .AsNoTracking()
            .Where(tm => tm.TeamId == project.TeamId.Value)
            .ToListAsync(cancellationToken);

        var actorUser = await _dbContext.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == notification.ClosedByUserId, cancellationToken);

        var actorDisplayName = actorUser?.DisplayName ?? "Một thành viên";
        var actorAvatar = actorUser?.Avatar;

        foreach (var member in teamMembers)
        {
            // Do not notify the person who closed the sprint
            if (member.UserId == notification.ClosedByUserId)
                continue;

            var notif = new Notification
            {
                Id = Guid.CreateVersion7(),
                UserId = member.UserId,
                ActorUserId = notification.ClosedByUserId,
                Type = "sprint_closed",
                Content = $"Sprint '{notification.SprintName}' của dự án '{project.Name}' đã được đóng. Hoàn thành: {notification.CompletedTasksCount} công việc, chưa hoàn thành: {notification.IncompleteTasksCount} công việc.",
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
                Console.WriteLine($"Error sending SignalR sprint_closed notification: {ex.Message}");
            }
        }
    }
}
