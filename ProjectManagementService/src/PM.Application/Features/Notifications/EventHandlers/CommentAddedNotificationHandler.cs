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
        var subTask = await _dbContext.SubTasks
            .Include(s => s.Task)
                .ThenInclude(t => t!.BoardColumn)
            .FirstOrDefaultAsync(s => s.Id == notification.TaskId, cancellationToken);

        if (subTask == null)
            return;

        var actorUser = await _dbContext.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == notification.UserId, cancellationToken);

        var actorDisplayName = actorUser?.DisplayName ?? "Unknown User";
        var actorAvatar = actorUser?.Avatar;

        string actionUrl = "/tasks";
        if (subTask.Task?.BoardColumn != null)
        {
            actionUrl = $"/projects/{subTask.Task.BoardColumn.ProjectId}/board";
        }

        Notification? subTaskAssigneeNotif = null;

        // 1. Chuẩn bị thông báo cho Người thực hiện Subtask (Subtask Assignee)
        if (subTask.AssigneeUserId.HasValue && subTask.AssigneeUserId.Value != notification.UserId)
        {
            subTaskAssigneeNotif = new Notification
            {
                Id = Guid.NewGuid(),
                UserId = subTask.AssigneeUserId.Value,
                ActorUserId = notification.UserId,
                Type = "subtask_comment",
                Content = $"Một đồng nghiệp vừa bình luận trên subtask '{subTask.Title}' được giao cho bạn.",
                ActionUrl = actionUrl,
                IsRead = false,
                IsSentViaEmail = false,
                CreatedAt = DateTime.UtcNow
            };
            _dbContext.Notifications.Add(subTaskAssigneeNotif);
        }



        // Lưu tất cả vào database
        if (subTaskAssigneeNotif != null)
        {
            await _dbContext.SaveChangesAsync(cancellationToken);
        }

        // Gửi Real-time qua SignalR
        if (subTaskAssigneeNotif != null)
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


    }
}
