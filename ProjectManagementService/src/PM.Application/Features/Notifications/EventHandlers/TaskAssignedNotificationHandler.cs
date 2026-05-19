using MediatR;
using PM.Application.Contracts;
using PM.Domain.Entities;
using PM.Domain.Events;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Notifications.EventHandlers;

public class TaskAssignedNotificationHandler : INotificationHandler<TaskAssignedEvent>
{
    private readonly IPMDbContext _dbContext;
    private readonly INotificationService _notificationService;

    public TaskAssignedNotificationHandler(IPMDbContext dbContext, INotificationService notificationService)
    {
        _dbContext = dbContext;
        _notificationService = notificationService;
    }

    public async Task Handle(TaskAssignedEvent notification, CancellationToken cancellationToken)
    {
        // Chống tự thông báo: Nếu người dùng tự assign task cho chính mình thì không gửi thông báo
        if (notification.ActorUserId == notification.AssigneeUserId)
            return;

        var newNotification = new Notification
        {
            Id = Guid.NewGuid(),
            UserId = notification.AssigneeUserId, // Người nhận thông báo (người được giao task)
            ActorUserId = notification.ActorUserId, // Người thực hiện giao việc
            Type = "task_assigned",
            Content = "Bạn vừa được phân công một công việc mới.",
            ActionUrl = $"/tasks/{notification.TaskId}",
            IsRead = false,
            IsSentViaEmail = false,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.Notifications.Add(newNotification);
        await _dbContext.SaveChangesAsync(cancellationToken);

        // Gửi Real-time qua SignalR
        await _notificationService.SendNotificationToUserAsync(
            newNotification.UserId.ToString(),
            new
            {
                Id = newNotification.Id,
                Type = newNotification.Type,
                Content = newNotification.Content,
                ActionUrl = newNotification.ActionUrl,
                CreatedAt = newNotification.CreatedAt
            }
        );
    }
}
