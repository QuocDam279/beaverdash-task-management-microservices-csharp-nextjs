using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using PM.Domain.Entities;
using PM.Domain.Events;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Notifications.EventHandlers;

public class CommentAddedNotificationHandler : INotificationHandler<CommentAddedEvent>
{
    private readonly IPMDbContext _dbContext;
    private readonly INotificationService _notificationService;

    public CommentAddedNotificationHandler(IPMDbContext dbContext, INotificationService notificationService)
    {
        _dbContext = dbContext;
        _notificationService = notificationService;
    }

    public async Task Handle(CommentAddedEvent notification, CancellationToken cancellationToken)
    {
        var task = await _dbContext.TaskItems
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == notification.TaskId, cancellationToken);

        if (task == null)
            return;

        if (task.AssigneeUserId.HasValue && task.AssigneeUserId.Value != notification.UserId)
        {
            var newNotification = new Notification
            {
                Id = Guid.NewGuid(),
                UserId = task.AssigneeUserId.Value,
                ActorUserId = notification.UserId,
                Type = "task_comment",
                Content = "Một đồng nghiệp vừa để lại bình luận trong công việc của bạn.",
                ActionUrl = $"/tasks/{notification.TaskId}",
                IsRead = false,
                IsSentViaEmail = false,
                CreatedAt = DateTime.UtcNow
            };

            _dbContext.Notifications.Add(newNotification);
            await _dbContext.SaveChangesAsync(cancellationToken);

            // Gửi Real-time notification qua SignalR tới đúng người dùng (Assignee)
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
}
