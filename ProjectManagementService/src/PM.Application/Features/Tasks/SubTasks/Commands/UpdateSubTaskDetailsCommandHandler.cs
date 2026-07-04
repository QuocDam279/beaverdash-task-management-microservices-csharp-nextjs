using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using PM.Domain.Entities;
using PM.Domain.Enums;
using PM.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Tasks.SubTasks.Commands;

public class UpdateSubTaskDetailsCommandHandler : IRequestHandler<UpdateSubTaskDetailsCommand, bool>
{
    private readonly IPMDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;

    public UpdateSubTaskDetailsCommandHandler(IPMDbContext dbContext, ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
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
        if (!project.TeamId.HasValue)
        {
            throw new UnauthorizedAccessException("Bạn không có quyền sửa SubTask này.");
        }

        var requestingMember = await _dbContext.TeamMembers.FirstOrDefaultAsync(tm => tm.TeamId == project.TeamId.Value && tm.UserId == currentUserId, cancellationToken);
        if (requestingMember == null)
            throw new UnauthorizedAccessException("Bạn không có quyền sửa SubTask này.");

        bool isLeader = requestingMember.Role == "leader" || requestingMember.Role == "Owner";
        bool isTaskCreator = subTask.Task!.CreatedByUserId == currentUserId;
        bool hasAssignedSubTask = await _dbContext.SubTasks
            .AnyAsync(st => st.TaskId == subTask.TaskId && st.AssigneeUserId == currentUserId && st.DeletedAt == null, cancellationToken);

        if (request.AssigneeUserId.HasValue)
        {
            var isAssigneeMember = await _dbContext.TeamMembers.AnyAsync(tm => tm.TeamId == project.TeamId.Value && tm.UserId == request.AssigneeUserId.Value, cancellationToken);
            if (!isAssigneeMember)
                throw new InvalidOperationException("Người nhận nhiệm vụ phải là thành viên trong nhóm.");
        }

        if (!isLeader && !isTaskCreator)
        {
            // 1. Regular members with no assigned tasks can only self-assign an unassigned task
            if (!hasAssignedSubTask)
            {
                bool isSelfAssign = !subTask.AssigneeUserId.HasValue && request.AssigneeUserId == currentUserId;
                if (!isSelfAssign)
                {
                    throw new UnauthorizedAccessException("Bạn không có quyền thao tác trên nhiệm vụ của công việc này.");
                }
            }

            // 2. Regular members can only toggle isCompleted for their own tasks
            if (subTask.IsCompleted != request.IsCompleted)
            {
                if (subTask.AssigneeUserId != currentUserId)
                {
                    throw new UnauthorizedAccessException("Bạn chỉ được phép hoàn thành nhiệm vụ được giao cho chính mình.");
                }
            }

            // 3. Regular members cannot edit Title, DueDate, or Priority
            SubTaskPriority? requestPriority = null;
            if (!string.IsNullOrEmpty(request.Priority) && Enum.TryParse<SubTaskPriority>(request.Priority, true, out var parsedReqPriority))
            {
                requestPriority = parsedReqPriority;
            }

            if (subTask.Title != request.Title || subTask.DueDate != request.DueDate || subTask.Priority != requestPriority)
            {
                throw new UnauthorizedAccessException("Chỉ trưởng nhóm hoặc người tạo công việc mới có quyền sửa đổi thông tin nhiệm vụ.");
            }
        }

        if (subTask.AssigneeUserId != request.AssigneeUserId)
        {
            if (!isLeader && !isTaskCreator)
            {
                bool isSelfAssign = !subTask.AssigneeUserId.HasValue && request.AssigneeUserId == currentUserId;
                bool isSelfUnassign = subTask.AssigneeUserId == currentUserId && !request.AssigneeUserId.HasValue;

                if (!isSelfAssign && !isSelfUnassign)
                {
                    if (subTask.AssigneeUserId.HasValue)
                    {
                        throw new UnauthorizedAccessException("Nhiệm vụ này đã có người nhận. Bạn không có quyền thay đổi phân công.");
                    }
                    else
                    {
                        throw new UnauthorizedAccessException("Bạn chỉ được phép tự nhận nhiệm vụ này hoặc giao cho người khác trong công việc do chính mình tạo ra.");
                    }
                }
            }
        }

        // Validate deadline
        if (request.DueDate.HasValue)
        {
            if (subTask.Task.DueDate.HasValue && request.DueDate.Value.Date > subTask.Task.DueDate.Value.Date)
                throw new InvalidOperationException("Hạn hoàn thành của SubTask không được vượt quá hạn hoàn thành của Task cha.");

            if (subTask.Task.StartDate.HasValue && request.DueDate.Value.Date < subTask.Task.StartDate.Value.Date)
                throw new InvalidOperationException("Hạn hoàn thành của SubTask không được nhỏ hơn ngày bắt đầu của Task cha.");
        }

        // Track changes
        var changedFields = new List<FieldChange>();

        if (subTask.IsCompleted != request.IsCompleted)
        {
            changedFields.Add(new FieldChange("IsCompleted", subTask.IsCompleted.ToString(), request.IsCompleted.ToString()));
            if (!subTask.IsCompleted && request.IsCompleted)
            {
                subTask.AddDomainEvent(new PM.Domain.Events.SubTaskCompletedEvent(
                    project.Id,
                    subTask.Id,
                    subTask.Task.Id,
                    subTask.Task.Title,
                    subTask.Title,
                    currentUserId,
                    subTask.Task.CreatedByUserId,
                    subTask.AssigneeUserId
                ));
            }
        }

        if (subTask.AssigneeUserId != request.AssigneeUserId)
        {
            changedFields.Add(new FieldChange("AssigneeUserId", subTask.AssigneeUserId?.ToString(), request.AssigneeUserId?.ToString()));
        }

        if (subTask.DueDate != request.DueDate)
        {
            changedFields.Add(new FieldChange("DueDate", subTask.DueDate?.ToString("o"), request.DueDate?.ToString("o")));
        }

        if (subTask.Title != request.Title)
        {
            changedFields.Add(new FieldChange("Title", subTask.Title, request.Title));
        }

        if (changedFields.Any())
        {
            subTask.AddDomainEvent(new PM.Domain.Events.SubTaskUpdatedEvent(
                project.Id,
                subTask.Id,
                subTask.Task.Id,
                subTask.Task.Title,
                subTask.Title,
                currentUserId,
                changedFields
            ));
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

        return true;
    }
}
