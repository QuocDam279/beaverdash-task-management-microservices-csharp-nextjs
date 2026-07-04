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
                .ThenInclude(c => c!.Project)
            .FirstOrDefaultAsync(t => t.Id == request.TaskId, cancellationToken);

        if (task == null)
            return false;

        var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("Bạn chưa đăng nhập.");

        if (task.BoardColumn == null || task.BoardColumn.Project == null || !task.BoardColumn.Project.TeamId.HasValue)
        {
            throw new UnauthorizedAccessException("Bạn không có quyền cập nhật Task này.");
        }

        var requestingMember = await _dbContext.TeamMembers.FirstOrDefaultAsync(tm => tm.TeamId == task.BoardColumn.Project.TeamId.Value && tm.UserId == currentUserId, cancellationToken);
        if (requestingMember == null)
            throw new UnauthorizedAccessException("Bạn không có quyền cập nhật Task này.");
        
        bool isLeader = requestingMember.Role == "leader" || requestingMember.Role == "Owner";

        if (!isLeader && task.CreatedByUserId != currentUserId)
        {
            throw new UnauthorizedAccessException("Bạn chỉ có quyền chỉnh sửa công việc do chính mình tạo ra.");
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
                if (newStartDate.HasValue && newStartDate.Value.Date < project.StartDate.Value.Date)
                {
                    throw new InvalidOperationException($"Ngày bắt đầu của Task không được nhỏ hơn ngày bắt đầu của dự án ({project.StartDate.Value:yyyy-MM-dd}).");
                }
                if (newDueDate.HasValue && newDueDate.Value.Date < project.StartDate.Value.Date)
                {
                    throw new InvalidOperationException($"Hạn hoàn thành của Task không được nhỏ hơn ngày bắt đầu của dự án ({project.StartDate.Value:yyyy-MM-dd}).");
                }
            }

            if (project.DueDate.HasValue)
            {
                if (newStartDate.HasValue && newStartDate.Value.Date > project.DueDate.Value.Date)
                {
                    throw new InvalidOperationException($"Ngày bắt đầu của Task không được lớn hơn hạn hoàn thành của dự án ({project.DueDate.Value:yyyy-MM-dd}).");
                }
                if (newDueDate.HasValue && newDueDate.Value.Date > project.DueDate.Value.Date)
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

        // Track changes
        var changedFields = new System.Collections.Generic.List<PM.Domain.Common.FieldChange>();

        if (request.Title != null && request.Title != oldTitle)
        {
            changedFields.Add(new PM.Domain.Common.FieldChange("Title", oldTitle, request.Title));
        }

        if (request.Description != null)
        {
            var newDesc = string.IsNullOrEmpty(request.Description) ? null : request.Description;
            if (newDesc != oldDescription)
            {
                changedFields.Add(new PM.Domain.Common.FieldChange("Description", oldDescription, newDesc));
            }
        }

        if (request.DueDate.HasValue && request.DueDate.Value != oldDueDate)
        {
            changedFields.Add(new PM.Domain.Common.FieldChange("DueDate", oldDueDate?.ToString("o"), request.DueDate.Value.ToString("o")));
        }

        if (request.StartDate.HasValue && request.StartDate.Value != oldStartDate)
        {
            changedFields.Add(new PM.Domain.Common.FieldChange("StartDate", oldStartDate?.ToString("o"), request.StartDate.Value.ToString("o")));
        }

        if (!string.IsNullOrEmpty(request.Priority))
        {
            var newPriority = Enum.TryParse<TaskPriority>(request.Priority, true, out var p) ? p : (TaskPriority?)null;
            if (newPriority != oldPriority)
            {
                changedFields.Add(new PM.Domain.Common.FieldChange("Priority", oldPriority?.ToString(), newPriority?.ToString()));
            }
        }

        if (changedFields.Count > 0)
        {
            task.AddDomainEvent(new PM.Domain.Events.TaskUpdatedEvent(
                task.BoardColumn!.ProjectId,
                task.Id,
                task.Title,
                currentUserId,
                changedFields
            ));
        }



        task.UpdatedAt = DateTime.UtcNow;
        
        // SaveChangesAsync sẽ tự động lưu thông tin task và phát sóng Event đi
        await _dbContext.SaveChangesAsync(cancellationToken);
        
        return true;
    }
}
