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
        if (!notification.AssigneeUserId.HasValue || notification.AssigneeUserId.Value == notification.UserId)
            return;

        var actorUser = await _dbContext.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == notification.UserId, cancellationToken);

        var actorDisplayName = !string.IsNullOrWhiteSpace(actorUser?.DisplayName) ? actorUser.DisplayName : "Một đồng nghiệp";
        var actorAvatar = actorUser?.Avatar;

        string actionUrl = $"/projects/{notification.ProjectId}/board?taskId={notification.TaskId}";

        var subTaskAssigneeNotif = new Notification
        {
            Id = Guid.CreateVersion7(),
            UserId = notification.AssigneeUserId.Value,
            ActorUserId = notification.UserId,
            Type = "subtask_comment",
            Content = $"{actorDisplayName} vừa bình luận trên công việc con '{notification.SubTaskTitle}' được giao cho bạn.",
            ActionUrl = actionUrl,
            IsRead = false,
            IsSentViaEmail = false,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.Notifications.Add(subTaskAssigneeNotif);
        await _dbContext.SaveChangesAsync(cancellationToken);

        // Gửi Real-time qua SignalR
        try
        {
            await _notificationService.SendNotificationToUserAsync(
                subTaskAssigneeNotif.UserId.ToString(),
                new
                {
                    Id = subTaskAssigneeNotif.Id,
                    Type = subTaskAssigneeNotif.Type,
                    Content = subTaskAssigneeNotif.Content,
                    ActionUrl = subTaskAssigneeNotif.ActionUrl,
                    CreatedAt = subTaskAssigneeNotif.CreatedAt,
                    ActorUserId = subTaskAssigneeNotif.ActorUserId,
                    ActorDisplayName = actorDisplayName,
                    ActorAvatar = actorAvatar
                }
            );
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error sending SignalR notification: {ex.Message}");
        }
    }
}
