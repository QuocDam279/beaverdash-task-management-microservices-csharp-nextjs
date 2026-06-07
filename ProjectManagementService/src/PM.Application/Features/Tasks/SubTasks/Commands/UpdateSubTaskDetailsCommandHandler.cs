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

        if (request.AssigneeUserId.HasValue)
        {
            var isAssigneeMember = await _dbContext.TeamMembers.AnyAsync(tm => tm.TeamId == project.TeamId.Value && tm.UserId == request.AssigneeUserId.Value, cancellationToken);
            if (!isAssigneeMember)
                throw new InvalidOperationException("Người nhận nhiệm vụ phải là thành viên trong nhóm.");
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
