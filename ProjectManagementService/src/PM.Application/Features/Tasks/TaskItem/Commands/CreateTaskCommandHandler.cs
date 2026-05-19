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

    public CreateTaskCommandHandler(PM.Application.Contracts.IPMDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Guid> Handle(CreateTaskCommand request, CancellationToken cancellationToken)
    {
        var column = await _dbContext.BoardColumns
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == request.BoardColumnId, cancellationToken);

        if (column == null)
            throw new InvalidOperationException("Board column not found.");

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

        int sortOrder = request.SortOrder ?? 0;
        if (!request.SortOrder.HasValue)
        {
            var maxSortOrder = await _dbContext.TaskItems
                .Where(t => t.BoardColumnId == request.BoardColumnId)
                .MaxAsync(t => (int?)t.SortOrder, cancellationToken);
            
            sortOrder = (maxSortOrder ?? 0) + 1;
        }

        var task = new PM.Domain.Entities.TaskItem
        {
            Id = Guid.NewGuid(),
            BoardColumnId = request.BoardColumnId,
            Title = request.Title,
            Description = request.Description,
            TaskType = request.TaskType,
            Priority = request.Priority,
            AssigneeUserId = request.AssigneeUserId,
            ParentTaskId = request.ParentTaskId,
            DueDate = request.DueDate,
            StartDate = request.StartDate,
            SortOrder = sortOrder,
            CreatedByUserId = request.CreatedByUserId,
            AssignedAt = request.AssigneeUserId.HasValue ? DateTime.UtcNow : null,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _dbContext.TaskItems.Add(task);
        
        // Gắn sự kiện tạo Task để ghi log
        task.AddDomainEvent(new PM.Domain.Events.TaskCreatedEvent(task.Id, request.CreatedByUserId, task.Title));
        
        await _dbContext.SaveChangesAsync(cancellationToken);

        return task.Id;
    }
}

