using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Domain.Entities;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Tasks.TaskItem.Commands;

public class CreateTaskCommandHandler : IRequestHandler<CreateTaskCommand, Guid>
{
    private readonly PM.Application.Contracts.IPMDbContext _dbContext;
    private readonly PM.Application.Contracts.ICurrentUserService _currentUserService;

    public CreateTaskCommandHandler(PM.Application.Contracts.IPMDbContext dbContext, PM.Application.Contracts.ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
    }

    public async Task<Guid> Handle(CreateTaskCommand request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("Bạn chưa đăng nhập.");

        var column = await _dbContext.BoardColumns
            .AsNoTracking()
            .Include(c => c.Project)
            .FirstOrDefaultAsync(c => c.Id == request.BoardColumnId, cancellationToken);

        if (column == null)
            throw new InvalidOperationException("Board column not found.");

        if (column.Project.TeamId.HasValue)
        {
            var isMember = await _dbContext.TeamMembers.AnyAsync(tm => tm.TeamId == column.Project.TeamId.Value && tm.UserId == currentUserId, cancellationToken);
            if (!isMember)
                throw new UnauthorizedAccessException("Bạn không có quyền thêm Task vào Project này.");
        }

        var isDuplicateName = await _dbContext.TaskItems
            .AnyAsync(t => t.Title.ToLower() == request.Title.ToLower() && t.BoardColumn!.ProjectId == column.ProjectId, cancellationToken);

        if (isDuplicateName)
            throw new InvalidOperationException($"A task with the name '{request.Title}' already exists in this project.");

        if (column.WipLimit.HasValue)
        {
            var taskCount = await _dbContext.TaskItems
                .CountAsync(t => t.BoardColumnId == request.BoardColumnId, cancellationToken);

            if (taskCount >= column.WipLimit.Value)
                throw new InvalidOperationException($"WIP limit ({column.WipLimit.Value}) for this column has been reached.");
        }

        double sortOrder = request.SortOrder ?? 0;
        if (!request.SortOrder.HasValue)
        {
            var maxSortOrder = await _dbContext.TaskItems
                .Where(t => t.BoardColumnId == request.BoardColumnId)
                .MaxAsync(t => (double?)t.SortOrder, cancellationToken);
            
            sortOrder = (maxSortOrder ?? 0) + 1;
        }

        var task = new PM.Domain.Entities.TaskItem
        {
            Id = Guid.NewGuid(),
            BoardColumnId = request.BoardColumnId,
            Title = request.Title,
            Description = request.Description,
            Priority = request.Priority,
            AssigneeUserId = request.AssigneeUserId,
            DueDate = request.DueDate,
            StartDate = request.StartDate,
            SortOrder = sortOrder,
            CreatedByUserId = currentUserId,
            AssignedAt = request.AssigneeUserId.HasValue ? DateTime.UtcNow : null,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _dbContext.TaskItems.Add(task);
        
        // Gắn sự kiện tạo Task để ghi log
        task.AddDomainEvent(new PM.Domain.Events.TaskCreatedEvent(task.Id, currentUserId, task.Title));
        
        await _dbContext.SaveChangesAsync(cancellationToken);

        return task.Id;
    }
}

