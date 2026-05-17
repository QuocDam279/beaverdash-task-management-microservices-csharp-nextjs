using MediatR;
using PM.Domain.Entities;

using System;
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
            SortOrder = request.SortOrder,
            CreatedByUserId = request.CreatedByUserId,
            AssignedAt = request.AssigneeUserId.HasValue ? DateTime.UtcNow : null,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _dbContext.TaskItems.Add(task);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return task.Id;
    }
}

