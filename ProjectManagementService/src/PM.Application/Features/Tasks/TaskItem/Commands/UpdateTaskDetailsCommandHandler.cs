using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using PM.Domain.Enums;
using PM.Domain.Events;
using PM.Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Tasks.TaskItem.Commands;

public class UpdateTaskDetailsCommandHandler : IRequestHandler<UpdateTaskDetailsCommand, bool>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IPMDbContext _dbContext;

    public UpdateTaskDetailsCommandHandler(IPMDbContext dbContext, ICurrentUserService currentUserService)
    {
        _currentUserService = currentUserService;
        _dbContext = dbContext;
    }

    public async Task<bool> Handle(UpdateTaskDetailsCommand request, CancellationToken cancellationToken)
    {
        var task = await _dbContext.TaskItems
            .Include(t => t.BoardColumn)
                .ThenInclude(c => c.Project)
            .FirstOrDefaultAsync(t => t.Id == request.TaskId, cancellationToken);

        if (task == null)
            return false;

        var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("Bạn chưa đăng nhập.");

        bool isLeader = false;
        if (task.BoardColumn.Project.TeamId.HasValue)
        {
            var requestingMember = await _dbContext.TeamMembers.FirstOrDefaultAsync(tm => tm.TeamId == task.BoardColumn.Project.TeamId.Value && tm.UserId == currentUserId, cancellationToken);
            if (requestingMember == null)
                throw new UnauthorizedAccessException("Bạn không có quyền cập nhật Task này.");
            
            isLeader = requestingMember.Role == "leader";
        }

        bool isAssignee = task.AssigneeUserId == currentUserId;
        bool canModifyProperties = isLeader || isAssignee;

        if (task.BoardColumn.Project.TeamId.HasValue && !canModifyProperties)
        {
            if (request.DueDate.HasValue && request.DueDate.Value != task.DueDate)
            {
                throw new UnauthorizedAccessException("Chỉ có trưởng nhóm hoặc người thực hiện mới được quyền thay đổi hạn hoàn thành.");
            }
            if (request.StartDate.HasValue && request.StartDate.Value != task.StartDate)
            {
                throw new UnauthorizedAccessException("Chỉ có trưởng nhóm hoặc người thực hiện mới được quyền thay đổi ngày bắt đầu.");
            }
            if (!string.IsNullOrEmpty(request.Priority))
            {
                var newPriority = Enum.TryParse<TaskPriority>(request.Priority, true, out var p) ? p : (TaskPriority?)null;
                if (newPriority != task.Priority)
                {
                    throw new UnauthorizedAccessException("Chỉ có trưởng nhóm hoặc người thực hiện mới được quyền thay đổi độ ưu tiên.");
                }
            }
            if (request.Title != null && request.Title != task.Title)
            {
                throw new UnauthorizedAccessException("Chỉ có trưởng nhóm hoặc người thực hiện mới được quyền chỉnh sửa tên công việc.");
            }
            if (request.Description != null)
            {
                var newDesc = string.IsNullOrEmpty(request.Description) ? null : request.Description;
                if (newDesc != task.Description)
                {
                    throw new UnauthorizedAccessException("Chỉ có trưởng nhóm hoặc người thực hiện mới được quyền chỉnh sửa mô tả công việc.");
                }
            }
        }

        // Capture old values for activity logging
        string oldTitle = task.Title;
        string? oldDescription = task.Description;
        DateTime? oldDueDate = task.DueDate;
        DateTime? oldStartDate = task.StartDate;
        TaskPriority? oldPriority = task.Priority;

        // Chỉ cập nhật những trường có truyền dữ liệu lên
        if (request.Title != null)
            task.Title = request.Title;

        if (request.Description != null)
            task.Description = string.IsNullOrEmpty(request.Description) ? null : request.Description;

        // Validate project date boundaries and task start/due date consistency
        var project = task.BoardColumn?.Project;
        DateTime? newStartDate = request.StartDate.HasValue ? request.StartDate.Value : task.StartDate;
        DateTime? newDueDate = request.DueDate.HasValue ? request.DueDate.Value : task.DueDate;

        if (newStartDate.HasValue && newDueDate.HasValue && newStartDate.Value > newDueDate.Value)
        {
            throw new InvalidOperationException("Ngày bắt đầu không được lớn hơn ngày hạn hoàn thành của Task.");
        }

        if (project != null)
        {
            if (project.StartDate.HasValue)
            {
                if (newStartDate.HasValue && newStartDate.Value < project.StartDate.Value)
                {
                    throw new InvalidOperationException($"Ngày bắt đầu của Task không được nhỏ hơn ngày bắt đầu của dự án ({project.StartDate.Value:yyyy-MM-dd}).");
                }
                if (newDueDate.HasValue && newDueDate.Value < project.StartDate.Value)
                {
                    throw new InvalidOperationException($"Hạn hoàn thành của Task không được nhỏ hơn ngày bắt đầu của dự án ({project.StartDate.Value:yyyy-MM-dd}).");
                }
            }

            if (project.DueDate.HasValue)
            {
                if (newStartDate.HasValue && newStartDate.Value > project.DueDate.Value)
                {
                    throw new InvalidOperationException($"Ngày bắt đầu của Task không được lớn hơn hạn hoàn thành của dự án ({project.DueDate.Value:yyyy-MM-dd}).");
                }
                if (newDueDate.HasValue && newDueDate.Value > project.DueDate.Value)
                {
                    throw new InvalidOperationException($"Hạn hoàn thành của Task không được lớn hơn hạn hoàn thành của dự án ({project.DueDate.Value:yyyy-MM-dd}).");
                }
            }
        }

        // Validate against subtask deadlines
        if (request.StartDate.HasValue)
        {
            var minSubTaskDueDate = await _dbContext.SubTasks
                .Where(s => s.TaskId == task.Id && s.DueDate.HasValue)
                .Select(s => s.DueDate)
                .OrderBy(d => d)
                .FirstOrDefaultAsync(cancellationToken);

            if (minSubTaskDueDate.HasValue && request.StartDate.Value > minSubTaskDueDate.Value)
                throw new InvalidOperationException($"Ngày bắt đầu của Task không được lớn hơn hạn hoàn thành nhỏ nhất của các SubTask ({minSubTaskDueDate.Value:yyyy-MM-dd}).");
        }

        if (request.DueDate.HasValue)
        {
            var maxSubTaskDueDate = await _dbContext.SubTasks
                .Where(s => s.TaskId == task.Id && s.DueDate.HasValue)
                .Select(s => s.DueDate)
                .OrderByDescending(d => d)
                .FirstOrDefaultAsync(cancellationToken);

            if (maxSubTaskDueDate.HasValue && request.DueDate.Value < maxSubTaskDueDate.Value)
                throw new InvalidOperationException($"Hạn hoàn thành của Task không được nhỏ hơn hạn hoàn thành lớn nhất của các SubTask ({maxSubTaskDueDate.Value:yyyy-MM-dd}).");
        }

        // Assign values if valid
        if (request.DueDate.HasValue)
            task.DueDate = request.DueDate.Value;

        if (request.StartDate.HasValue)
            task.StartDate = request.StartDate.Value;

        if (!string.IsNullOrEmpty(request.Priority))
        {
            task.Priority = Enum.TryParse<TaskPriority>(request.Priority, true, out var p) ? p : null;
        }

        // Log changes
        if (request.Title != null && request.Title != oldTitle)
        {
            _dbContext.ActivityLogs.Add(new ActivityLog
            {
                Id = Guid.NewGuid(),
                ProjectId = task.BoardColumn.ProjectId,
                UserId = currentUserId,
                EntityType = "task",
                EntityId = task.Id,
                ActionType = "updated_title",
                NewValue = System.Text.Json.JsonSerializer.Serialize(new { title = request.Title, old_title = oldTitle }),
                CreatedAt = DateTime.UtcNow
            });
        }
        if (request.Description != null)
        {
            var newDesc = string.IsNullOrEmpty(request.Description) ? null : request.Description;
            if (newDesc != oldDescription)
            {
                _dbContext.ActivityLogs.Add(new ActivityLog
                {
                    Id = Guid.NewGuid(),
                    ProjectId = task.BoardColumn.ProjectId,
                    UserId = currentUserId,
                    EntityType = "task",
                    EntityId = task.Id,
                    ActionType = "updated_description",
                    NewValue = System.Text.Json.JsonSerializer.Serialize(new { title = task.Title }),
                    CreatedAt = DateTime.UtcNow
                });
            }
        }
        if (request.DueDate.HasValue && request.DueDate.Value != oldDueDate)
        {
            _dbContext.ActivityLogs.Add(new ActivityLog
            {
                Id = Guid.NewGuid(),
                ProjectId = task.BoardColumn.ProjectId,
                UserId = currentUserId,
                EntityType = "task",
                EntityId = task.Id,
                ActionType = "updated_due_date",
                NewValue = System.Text.Json.JsonSerializer.Serialize(new { title = task.Title, due_date = request.DueDate.Value }),
                CreatedAt = DateTime.UtcNow
            });
        }
        if (request.StartDate.HasValue && request.StartDate.Value != oldStartDate)
        {
            _dbContext.ActivityLogs.Add(new ActivityLog
            {
                Id = Guid.NewGuid(),
                ProjectId = task.BoardColumn.ProjectId,
                UserId = currentUserId,
                EntityType = "task",
                EntityId = task.Id,
                ActionType = "updated_start_date",
                NewValue = System.Text.Json.JsonSerializer.Serialize(new { title = task.Title, start_date = request.StartDate.Value }),
                CreatedAt = DateTime.UtcNow
            });
        }
        if (!string.IsNullOrEmpty(request.Priority))
        {
            var newPriority = Enum.TryParse<TaskPriority>(request.Priority, true, out var p) ? p : (TaskPriority?)null;
            if (newPriority != oldPriority)
            {
                _dbContext.ActivityLogs.Add(new ActivityLog
                {
                    Id = Guid.NewGuid(),
                    ProjectId = task.BoardColumn.ProjectId,
                    UserId = currentUserId,
                    EntityType = "task",
                    EntityId = task.Id,
                    ActionType = "updated_priority",
                    NewValue = System.Text.Json.JsonSerializer.Serialize(new { title = task.Title, priority = request.Priority, old_priority = oldPriority?.ToString() }),
                    CreatedAt = DateTime.UtcNow
                });
            }
        }

        // Xử lý riêng logic Giao việc (Assignee)
        if (request.AssigneeUserId.HasValue)
        {
            Guid? newAssigneeId = request.AssigneeUserId.Value == Guid.Empty ? null : request.AssigneeUserId.Value;

            // Nếu thực sự có thay đổi người được giao (người mới khác người cũ)
            if (task.AssigneeUserId != newAssigneeId)
            {
                if (task.BoardColumn.Project.TeamId.HasValue && !isLeader)
                {
                    // Case 1: Task is currently unassigned
                    if (task.AssigneeUserId == null)
                    {
                        // Normal members can only assign to themselves (self-apply)
                        if (newAssigneeId != currentUserId)
                        {
                            throw new UnauthorizedAccessException("Chỉ có trưởng nhóm mới được quyền giao việc cho thành viên khác.");
                        }
                    }
                    // Case 2: Task is currently assigned to someone else
                    else if (task.AssigneeUserId != currentUserId)
                    {
                        throw new UnauthorizedAccessException("Công việc đã có người thực hiện. Bạn không có quyền thay đổi.");
                    }
                    // Case 3: Task is currently assigned to the current user
                    else // task.AssigneeUserId == currentUserId
                    {
                        // They can only unassign themselves (newAssigneeId == null)
                        if (newAssigneeId != null)
                        {
                            throw new UnauthorizedAccessException("Bạn chỉ có thể tự hủy giao việc, không được quyền giao cho thành viên khác.");
                        }
                    }
                }

                task.AssigneeUserId = newAssigneeId;
                task.AssignedAt = newAssigneeId.HasValue ? DateTime.UtcNow : null;

                if (newAssigneeId.HasValue)
                {
                    // Kích hoạt Domain Event cho việc gán Task
                    task.AddDomainEvent(new TaskAssignedEvent(task.Id, currentUserId, newAssigneeId.Value));
                }
            }
        }

        task.UpdatedAt = DateTime.UtcNow;
        
        // SaveChangesAsync sẽ tự động lưu thông tin task và phát sóng Event đi
        await _dbContext.SaveChangesAsync(cancellationToken);
        
        return true;
    }
}
