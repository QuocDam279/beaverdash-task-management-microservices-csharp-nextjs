using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Tasks.TaskItem.Commands;

public class MoveTaskDto
{
    public Guid NewBoardColumnId { get; set; }
    public int NewSortOrder { get; set; }
    public Guid RequestingUserId { get; set; } // Thêm RequestingUserId
}

public class MoveTaskCommand : IRequest<bool>
{
    public Guid TaskId { get; set; }
    public Guid NewBoardColumnId { get; set; }
    public int NewSortOrder { get; set; }
    public Guid RequestingUserId { get; set; } // Thêm RequestingUserId
}

public class MoveTaskCommandHandler : IRequestHandler<MoveTaskCommand, bool>
{
    private readonly IPMDbContext _dbContext;

    public MoveTaskCommandHandler(IPMDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<bool> Handle(MoveTaskCommand request, CancellationToken cancellationToken)
    {
        var task = await _dbContext.TaskItems
            .FirstOrDefaultAsync(t => t.Id == request.TaskId, cancellationToken);

        if (task == null)
            throw new InvalidOperationException("Task not found.");

        var oldColumnId = task.BoardColumnId;
        var newColumnId = request.NewBoardColumnId;
        var newSortOrder = request.NewSortOrder;

        // Check WIP limit only if moving to a different column
        if (oldColumnId != newColumnId)
        {
            var newColumn = await _dbContext.BoardColumns
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == newColumnId, cancellationToken);

            if (newColumn == null)
                throw new InvalidOperationException("Target column not found.");

            if (newColumn.WipLimit.HasValue)
            {
                var taskCount = await _dbContext.TaskItems
                    .CountAsync(t => t.BoardColumnId == newColumnId, cancellationToken);

                if (taskCount >= newColumn.WipLimit.Value)
                    throw new InvalidOperationException($"Target column WIP limit ({newColumn.WipLimit.Value}) reached.");
            }

            // Sinh ra Domain Event
            task.AddDomainEvent(new PM.Domain.Events.TaskMovedEvent(task.Id, request.RequestingUserId, oldColumnId, newColumnId));
        }

        // Fetch all other tasks in the target column to recalculate sort order
        var tasksInNewColumn = await _dbContext.TaskItems
            .Where(t => t.BoardColumnId == newColumnId && t.Id != task.Id)
            .OrderBy(t => t.SortOrder)
            .ToListAsync(cancellationToken);

        // Update task to new column
        task.BoardColumnId = newColumnId;
        task.UpdatedAt = DateTime.UtcNow;

        // Insert at the specified position (clamped to valid bounds)
        int insertIndex = Math.Max(0, Math.Min(newSortOrder, tasksInNewColumn.Count));
        tasksInNewColumn.Insert(insertIndex, task);

        // Reassign consecutive sort orders to ensure no duplicates or gaps
        for (int i = 0; i < tasksInNewColumn.Count; i++)
        {
            tasksInNewColumn[i].SortOrder = i;
        }

        // Explicitly update to ensure EF Core treats them as Modified, not Added
        _dbContext.TaskItems.UpdateRange(tasksInNewColumn);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return true;
    }
}
