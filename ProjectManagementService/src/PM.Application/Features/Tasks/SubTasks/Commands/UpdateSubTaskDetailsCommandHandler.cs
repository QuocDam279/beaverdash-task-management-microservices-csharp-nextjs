using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using PM.Domain.Entities;
using PM.Domain.Enums;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Tasks.SubTasks.Commands;

public class UpdateSubTaskDetailsCommandHandler : IRequestHandler<UpdateSubTaskDetailsCommand, bool>
{
    private readonly IPMDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;
    private readonly INotificationService _notificationService;

    public UpdateSubTaskDetailsCommandHandler(IPMDbContext dbContext, ICurrentUserService currentUserService, INotificationService notificationService)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
        _notificationService = notificationService;
    }

    public async Task<bool> Handle(UpdateSubTaskDetailsCommand request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("Bạn chưa đăng nhập.");

        var subTask = await _dbContext.SubTasks
            .Include(s => s.Task)
                .ThenInclude(t => t!.BoardColumn)
                    .ThenInclude(c => c!.Project)
            .FirstOrDefaultAsync(s => s.Id == request.SubTaskId, cancellationToken);

        if (subTask == null)
            return false;

        var project = subTask.Task!.BoardColumn!.Project!;
        if (project.TeamId.HasValue)
        {
            var requestingMember = await _dbContext.TeamMembers.FirstOrDefaultAsync(tm => tm.TeamId == project.TeamId.Value && tm.UserId == currentUserId, cancellationToken);
            if (requestingMember == null)
                throw new UnauthorizedAccessException("Bạn không có quyền sửa SubTask này.");


        }
        else if (project.CreatedByUserId != currentUserId)
        {
            throw new UnauthorizedAccessException("Bạn không có quyền sửa SubTask này.");
        }

        // Validate deadline
        if (request.DueDate.HasValue)
        {
            if (subTask.Task.DueDate.HasValue && request.DueDate.Value > subTask.Task.DueDate.Value)
                throw new InvalidOperationException("Hạn hoàn thành của SubTask không được vượt quá hạn hoàn thành của Task cha.");

            if (subTask.Task.StartDate.HasValue && request.DueDate.Value < subTask.Task.StartDate.Value)
                throw new InvalidOperationException("Hạn hoàn thành của SubTask không được nhỏ hơn ngày bắt đầu của Task cha.");
        }

        // Log changes
        if (subTask.IsCompleted != request.IsCompleted)
        {
            _dbContext.ActivityLogs.Add(new ActivityLog
            {
                Id = Guid.NewGuid(),
                ProjectId = project.Id,
                UserId = currentUserId,
                EntityType = "subtask",
                EntityId = subTask.Id,
                ActionType = request.IsCompleted ? "completed" : "incomplete",
                NewValue = System.Text.Json.JsonSerializer.Serialize(new { title = subTask.Title, parent_task_title = subTask.Task.Title, task_id = subTask.Task.Id }),
                CreatedAt = DateTime.UtcNow
            });
        }

        if (subTask.AssigneeUserId != request.AssigneeUserId)
        {
            var assigneeName = "Chưa phân công";
            if (request.AssigneeUserId.HasValue)
            {
                var assigneeUser = await _dbContext.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == request.AssigneeUserId.Value, cancellationToken);
                assigneeName = assigneeUser?.DisplayName ?? "Chưa phân công";
            }

            _dbContext.ActivityLogs.Add(new ActivityLog
            {
                Id = Guid.NewGuid(),
                ProjectId = project.Id,
                UserId = currentUserId,
                EntityType = "subtask",
                EntityId = subTask.Id,
                ActionType = "assigned",
                NewValue = System.Text.Json.JsonSerializer.Serialize(new { 
                    title = subTask.Title, 
                    parent_task_title = subTask.Task.Title,
                    assignee_user_id = request.AssigneeUserId,
                    assignee_name = assigneeName,
                    task_id = subTask.Task.Id
                }),
                CreatedAt = DateTime.UtcNow
            });
        }

        if (subTask.DueDate != request.DueDate)
        {
            _dbContext.ActivityLogs.Add(new ActivityLog
            {
                Id = Guid.NewGuid(),
                ProjectId = project.Id,
                UserId = currentUserId,
                EntityType = "subtask",
                EntityId = subTask.Id,
                ActionType = "updated_deadline",
                NewValue = System.Text.Json.JsonSerializer.Serialize(new { 
                    title = subTask.Title, 
                    parent_task_title = subTask.Task.Title,
                    due_date = request.DueDate,
                    task_id = subTask.Task.Id
                }),
                CreatedAt = DateTime.UtcNow
            });
        }

        if (subTask.Title != request.Title)
        {
            _dbContext.ActivityLogs.Add(new ActivityLog
            {
                Id = Guid.NewGuid(),
                ProjectId = project.Id,
                UserId = currentUserId,
                EntityType = "subtask",
                EntityId = subTask.Id,
                ActionType = "updated_title",
                NewValue = System.Text.Json.JsonSerializer.Serialize(new { 
                    title = request.Title, 
                    old_title = subTask.Title,
                    parent_task_title = subTask.Task.Title,
                    task_id = subTask.Task.Id
                }),
                CreatedAt = DateTime.UtcNow
            });
        }

        Notification? assignNotif = null;
        if (subTask.AssigneeUserId != request.AssigneeUserId && request.AssigneeUserId.HasValue && request.AssigneeUserId.Value != currentUserId)
        {
            assignNotif = new Notification
            {
                Id = Guid.NewGuid(),
                UserId = request.AssigneeUserId.Value,
                ActorUserId = currentUserId,
                Type = "subtask_assigned",
                Content = $"Bạn vừa được giao subtask '{request.Title}' thuộc công việc '{subTask.Task!.Title}'.",
                ActionUrl = subTask.Task?.BoardColumn != null ? $"/projects/{subTask.Task.BoardColumn.ProjectId}/board?taskId={subTask.TaskId}" : "/tasks",
                IsRead = false,
                IsSentViaEmail = false,
                CreatedAt = DateTime.UtcNow
            };
            _dbContext.Notifications.Add(assignNotif);
        }

        SubTaskPriority? priority = null;
        if (!string.IsNullOrEmpty(request.Priority) && Enum.TryParse<SubTaskPriority>(request.Priority, true, out var parsedPriority))
        {
            priority = parsedPriority;
        }

        subTask.Title = request.Title;
        subTask.AssigneeUserId = request.AssigneeUserId;
        subTask.DueDate = request.DueDate;
        subTask.Priority = priority;
        subTask.IsCompleted = request.IsCompleted;
        subTask.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);

        if (assignNotif != null)
        {
            try
            {
                var actorUser = await _dbContext.Users
                    .AsNoTracking()
                    .FirstOrDefaultAsync(u => u.Id == currentUserId, cancellationToken);

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
                Console.WriteLine($"Error sending SignalR notification for subtask assignment update: {ex.Message}");
            }
        }

        return true;
    }
}
