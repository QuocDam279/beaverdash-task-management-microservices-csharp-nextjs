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
                .ThenInclude(c => c.Project)
            .FirstOrDefaultAsync(t => t.Id == request.TaskId, cancellationToken);

        if (task == null)
            throw new InvalidOperationException("Task cha không tồn tại.");

        if (task.BoardColumn.Project.TeamId.HasValue)
        {
            var isMember = await _dbContext.TeamMembers.AnyAsync(tm => tm.TeamId == task.BoardColumn.Project.TeamId.Value && tm.UserId == currentUserId, cancellationToken);
            if (!isMember)
                throw new UnauthorizedAccessException("Bạn không có quyền thêm SubTask vào Task này.");
        }
        else if (task.BoardColumn.Project.CreatedByUserId != currentUserId)
        {
            throw new UnauthorizedAccessException("Bạn không có quyền thêm SubTask vào Task này.");
        }

        // Validate deadline
        if (request.DueDate.HasValue && task.DueDate.HasValue)
        {
            if (request.DueDate.Value > task.DueDate.Value)
                throw new InvalidOperationException("Hạn hoàn thành của SubTask không được vượt quá hạn hoàn thành của Task cha.");
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
            StartDate = request.StartDate,
            DueDate = request.DueDate,
            SortOrder = sortOrder,
            IsCompleted = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _dbContext.SubTasks.Add(subTask);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return subTask.Id;
    }
}
