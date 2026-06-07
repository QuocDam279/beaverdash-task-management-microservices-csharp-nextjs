using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using PM.Domain.Entities;
using PM.Domain.Events;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Notifications.EventHandlers;

public class SubTaskCreatedNotificationHandler : INotificationHandler<SubTaskCreatedEvent>
{
    private readonly IPMDbContext _dbContext;
    private readonly INotificationService _notificationService;

    public SubTaskCreatedNotificationHandler(IPMDbContext dbContext, INotificationService notificationService)
    {
        _dbContext = dbContext;
        _notificationService = notificationService;
    }

    public async Task Handle(SubTaskCreatedEvent notification, CancellationToken cancellationToken)
    {
        if (!notification.AssigneeUserId.HasValue || notification.AssigneeUserId.Value == notification.UserId)
            return;

        var assignNotif = new Notification
        {
            Id = Guid.CreateVersion7(),
            UserId = notification.AssigneeUserId.Value,
            ActorUserId = notification.UserId,
            Type = "subtask_assigned",
            Content = $"Bạn vừa được giao công việc con '{notification.SubTaskTitle}' thuộc công việc '{notification.TaskTitle}'.",
            ActionUrl = $"/projects/{notification.ProjectId}/board?taskId={notification.TaskId}",
            IsRead = false,
            IsSentViaEmail = false,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.Notifications.Add(assignNotif);
        await _dbContext.SaveChangesAsync(cancellationToken);

        try
        {
            var actorUser = await _dbContext.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == notification.UserId, cancellationToken);

            await _notificationService.SendNotificationToUserAsync(
                assignNotif.UserId.ToString(),
                new
                {
                    Id = assignNotif.Id,
                    Type = assignNotif.Type,
                    Content = assignNotif.Content,
                    ActionUrl = assignNotif.ActionUrl,
                    CreatedAt = assignNotif.CreatedAt,
                    ActorUserId = assignNotif.ActorUserId,
                    ActorDisplayName = actorUser?.DisplayName ?? "Unknown User",
                    ActorAvatar = actorUser?.Avatar
                }
            );
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error sending SignalR notification for subtask assignment: {ex.Message}");
        }
    }
}
