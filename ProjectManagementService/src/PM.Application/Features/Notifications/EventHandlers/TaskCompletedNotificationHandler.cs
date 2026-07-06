using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using PM.Domain.Entities;
using PM.Domain.Events;
using System;
using System.Linq;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Notifications.EventHandlers;

public class TaskCompletedNotificationHandler : INotificationHandler<TaskMovedEvent>
{
    private readonly IPMDbContext _dbContext;
    private readonly INotificationService _notificationService;

    public TaskCompletedNotificationHandler(IPMDbContext dbContext, INotificationService notificationService)
    {
        _dbContext = dbContext;
        _notificationService = notificationService;
    }

    public async Task Handle(TaskMovedEvent notification, CancellationToken cancellationToken)
    {
        // 1. Check if the target column is marked as "Done"
        var newColumn = await _dbContext.BoardColumns
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == notification.NewColumnId, cancellationToken);

        if (newColumn == null || !newColumn.IsDone)
            return; // Column is not Done, skip notification

        // 2. Load the task with its subtasks to get creator and assignees
        var taskItem = await _dbContext.TaskItems
            .AsNoTracking()
            .Include(t => t.SubTasks)
            .FirstOrDefaultAsync(t => t.Id == notification.TaskId, cancellationToken);

        if (taskItem == null)
            return;

        var actorUser = await _dbContext.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == notification.UserId, cancellationToken);

        var actorDisplayName = actorUser?.DisplayName ?? "Một thành viên";
        var actorAvatar = actorUser?.Avatar;

        // 3. Determine recipients
        var recipients = new HashSet<Guid>();

        // Creator of the task (if they didn't complete it themselves)
        if (taskItem.CreatedByUserId != notification.UserId)
        {
            recipients.Add(taskItem.CreatedByUserId);
        }

        // Assignees of subtasks (who didn't complete it themselves)
        foreach (var subTask in taskItem.SubTasks)
        {
            if (subTask.AssigneeUserId.HasValue && subTask.AssigneeUserId.Value != notification.UserId && subTask.DeletedAt == null)
            {
                recipients.Add(subTask.AssigneeUserId.Value);
            }
        }

        // 4. Send notifications
        foreach (var recipientId in recipients)
        {
            string actionUrl = await NotificationUrlHelper.GetTaskUrlAsync(
                _dbContext,
                notification.ProjectId,
                notification.TaskId,
                recipientId,
                cancellationToken);

            var notif = new Notification
            {
                Id = Guid.CreateVersion7(),
                UserId = recipientId,
                ActorUserId = notification.UserId,
                Type = "task_completed",
                Content = $"{actorDisplayName} đã hoàn thành công việc '{notification.TaskTitle}' liên quan đến bạn.",
                ActionUrl = actionUrl,
                IsRead = false,
                IsSentViaEmail = false,
                CreatedAt = DateTime.UtcNow
            };

            _dbContext.Notifications.Add(notif);
            await _dbContext.SaveChangesAsync(cancellationToken);

            try
            {
                await _notificationService.SendNotificationToUserAsync(
                    recipientId.ToString(),
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
                Console.WriteLine($"Error sending SignalR task_completed notification: {ex.Message}");
            }
        }
    }
}
