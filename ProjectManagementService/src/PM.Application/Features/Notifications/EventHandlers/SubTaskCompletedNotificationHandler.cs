using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using PM.Domain.Entities;
using PM.Domain.Events;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Notifications.EventHandlers;

public class SubTaskCompletedNotificationHandler : INotificationHandler<SubTaskCompletedEvent>
{
    private readonly IPMDbContext _dbContext;
    private readonly INotificationService _notificationService;

    public SubTaskCompletedNotificationHandler(IPMDbContext dbContext, INotificationService notificationService)
    {
        _dbContext = dbContext;
        _notificationService = notificationService;
    }

    public async Task Handle(SubTaskCompletedEvent notification, CancellationToken cancellationToken)
    {
        // Don't notify yourself
        if (notification.CompletedByUserId == notification.TaskCreatorUserId)
            return;

        var actorUser = await _dbContext.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == notification.CompletedByUserId, cancellationToken);

        var actorDisplayName = actorUser?.DisplayName ?? "Một thành viên";
        var actorAvatar = actorUser?.Avatar;

        var notif = new Notification
        {
            Id = Guid.CreateVersion7(),
            UserId = notification.TaskCreatorUserId,
            ActorUserId = notification.CompletedByUserId,
            Type = "subtask_completed",
            Content = $"{actorDisplayName} đã hoàn thành công việc con '{notification.SubTaskTitle}' thuộc công việc '{notification.TaskTitle}' do bạn tạo.",
            ActionUrl = $"/projects/{notification.ProjectId}/board?taskId={notification.TaskId}",
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
            Console.WriteLine($"Error sending SignalR subtask_completed notification: {ex.Message}");
        }
    }
}
