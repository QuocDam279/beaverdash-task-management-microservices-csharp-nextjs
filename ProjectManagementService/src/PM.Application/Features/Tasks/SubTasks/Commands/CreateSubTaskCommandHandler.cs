using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using PM.Domain.Entities;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Tasks.SubTasks.Commands;

public class CreateSubTaskCommandHandler : IRequestHandler<CreateSubTaskCommand, Guid>
{
    private readonly IPMDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;
    private readonly INotificationService _notificationService;

    public CreateSubTaskCommandHandler(IPMDbContext dbContext, ICurrentUserService currentUserService, INotificationService notificationService)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
        _notificationService = notificationService;
    }

    public async Task<Guid> Handle(CreateSubTaskCommand request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("Bạn chưa đăng nhập.");

        var task = await _dbContext.TaskItems
            .Include(t => t.BoardColumn)
                .ThenInclude(c => c.Project)
            .FirstOrDefaultAsync(t => t.Id == request.TaskId, cancellationToken);

        if (task == null)
            throw new InvalidOperationException("Task cha không tồn tại.");

        if (task.BoardColumn.Project.TeamId.HasValue)
        {
            var requestingMember = await _dbContext.TeamMembers.FirstOrDefaultAsync(tm => tm.TeamId == task.BoardColumn.Project.TeamId.Value && tm.UserId == currentUserId, cancellationToken);
            if (requestingMember == null)
                throw new UnauthorizedAccessException("Bạn không có quyền thêm SubTask vào Task này.");

            bool isLeader = requestingMember.Role == "leader";
            bool isParentAssignee = task.AssigneeUserId == currentUserId;

            if (!isLeader && !isParentAssignee)
            {
                throw new UnauthorizedAccessException("Chỉ có trưởng nhóm hoặc người được giao thực hiện công việc cha mới có quyền tạo công việc con.");
            }
        }
        else if (task.BoardColumn.Project.CreatedByUserId != currentUserId)
        {
            throw new UnauthorizedAccessException("Bạn không có quyền thêm SubTask vào Task này.");
        }

        // Validate deadline
        if (request.DueDate.HasValue)
        {
            if (task.DueDate.HasValue && request.DueDate.Value > task.DueDate.Value)
                throw new InvalidOperationException("Hạn hoàn thành của SubTask không được vượt quá hạn hoàn thành của Task cha.");

            if (task.StartDate.HasValue && request.DueDate.Value < task.StartDate.Value)
                throw new InvalidOperationException("Hạn hoàn thành của SubTask không được nhỏ hơn ngày bắt đầu của Task cha.");
        }

        int sortOrder = request.SortOrder ?? 0;
        if (!request.SortOrder.HasValue)
        {
            var maxSortOrder = await _dbContext.SubTasks
                .Where(s => s.TaskId == request.TaskId)
                .MaxAsync(s => (int?)s.SortOrder, cancellationToken);
            
            sortOrder = (maxSortOrder ?? 0) + 1;
        }

        var subTask = new SubTask
        {
            Id = Guid.NewGuid(),
            TaskId = request.TaskId,
            Title = request.Title,
            AssigneeUserId = request.AssigneeUserId,
            DueDate = request.DueDate,
            SortOrder = sortOrder,
            IsCompleted = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _dbContext.SubTasks.Add(subTask);

        var activityLog = new ActivityLog
        {
            Id = Guid.NewGuid(),
            ProjectId = task.BoardColumn.ProjectId,
            UserId = currentUserId,
            EntityType = "subtask",
            EntityId = subTask.Id,
            ActionType = "created",
            NewValue = System.Text.Json.JsonSerializer.Serialize(new { title = subTask.Title, parent_task_title = task.Title, task_id = task.Id }),
            CreatedAt = DateTime.UtcNow
        };
        _dbContext.ActivityLogs.Add(activityLog);

        Notification? assignNotif = null;
        if (subTask.AssigneeUserId.HasValue && subTask.AssigneeUserId.Value != currentUserId)
        {
            assignNotif = new Notification
            {
                Id = Guid.NewGuid(),
                UserId = subTask.AssigneeUserId.Value,
                ActorUserId = currentUserId,
                Type = "subtask_assigned",
                Content = $"Bạn vừa được giao subtask '{subTask.Title}' thuộc công việc '{task.Title}'.",
                ActionUrl = task.BoardColumn != null ? $"/projects/{task.BoardColumn.ProjectId}/board" : "/tasks",
                IsRead = false,
                IsSentViaEmail = false,
                CreatedAt = DateTime.UtcNow
            };
            _dbContext.Notifications.Add(assignNotif);
        }

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
                Console.WriteLine($"Error sending SignalR notification for subtask assignment: {ex.Message}");
            }
        }

        return subTask.Id;
    }
}
