using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using PM.Domain.Entities;
using PM.Domain.Enums;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Tasks.SubTasks.Commands;

public class CreateSubTaskCommandHandler : IRequestHandler<CreateSubTaskCommand, Guid>
{
    private readonly IPMDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;

    public CreateSubTaskCommandHandler(IPMDbContext dbContext, ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
    }

    public async Task<Guid> Handle(CreateSubTaskCommand request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("Bạn chưa đăng nhập.");

        var task = await _dbContext.TaskItems
            .Include(t => t.BoardColumn)
                .ThenInclude(c => c!.Project)
            .FirstOrDefaultAsync(t => t.Id == request.TaskId, cancellationToken);

        if (task == null)
            throw new InvalidOperationException("Task cha không tồn tại.");

        if (!task.BoardColumn!.Project!.TeamId.HasValue)
        {
            throw new UnauthorizedAccessException("Bạn không có quyền thêm SubTask vào Task này.");
        }

        var requestingMember = await _dbContext.TeamMembers.FirstOrDefaultAsync(tm => tm.TeamId == task.BoardColumn!.Project!.TeamId!.Value && tm.UserId == currentUserId, cancellationToken);
        if (requestingMember == null)
            throw new UnauthorizedAccessException("Bạn không có quyền thêm SubTask vào Task này.");

        if (request.AssigneeUserId.HasValue)
        {
            var isAssigneeMember = await _dbContext.TeamMembers.AnyAsync(tm => tm.TeamId == task.BoardColumn!.Project!.TeamId!.Value && tm.UserId == request.AssigneeUserId.Value, cancellationToken);
            if (!isAssigneeMember)
                throw new InvalidOperationException("Người nhận nhiệm vụ phải là thành viên trong nhóm.");
        }

        // Check for duplicate subtask title under the same parent task (case-insensitive)
        var isDuplicateSubtaskName = await _dbContext.SubTasks
            .AnyAsync(s => s.Title.ToLower() == request.Title.ToLower() && s.TaskId == request.TaskId && s.DeletedAt == null, cancellationToken);

        if (isDuplicateSubtaskName)
            throw new InvalidOperationException($"A subtask with the name '{request.Title}' already exists under this parent task.");

        // Validate deadline
        if (request.DueDate.HasValue)
        {
            if (task.DueDate.HasValue && request.DueDate.Value.Date > task.DueDate.Value.Date)
                throw new InvalidOperationException("Hạn hoàn thành của SubTask không được vượt quá hạn hoàn thành của Task cha.");

            if (task.StartDate.HasValue && request.DueDate.Value.Date < task.StartDate.Value.Date)
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

        SubTaskPriority? priority = null;
        if (!string.IsNullOrEmpty(request.Priority) && Enum.TryParse<SubTaskPriority>(request.Priority, true, out var parsedPriority))
        {
            priority = parsedPriority;
        }

        var firstColumn = await _dbContext.BoardColumns
            .Where(c => c.ProjectId == task.BoardColumn!.ProjectId)
            .OrderBy(c => c.Position)
            .FirstOrDefaultAsync(cancellationToken);

        var subTask = new SubTask
        {
            Id = Guid.CreateVersion7(),
            TaskId = request.TaskId,
            Title = request.Title,
            AssigneeUserId = request.AssigneeUserId,
            DueDate = request.DueDate,
            Priority = priority,
            SortOrder = sortOrder,
            IsCompleted = false,
            BoardColumnId = firstColumn?.Id,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        subTask.AddDomainEvent(new PM.Domain.Events.SubTaskCreatedEvent(
            task.BoardColumn!.ProjectId,
            subTask.Id,
            task.Id,
            task.Title,
            subTask.Title,
            currentUserId,
            subTask.AssigneeUserId
        ));

        _dbContext.SubTasks.Add(subTask);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return subTask.Id;
    }
}
