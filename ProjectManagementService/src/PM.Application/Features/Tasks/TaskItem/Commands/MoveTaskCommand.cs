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
    public double NewSortOrder { get; set; }
}

public class MoveTaskCommand : IRequest<bool>
{
    public Guid TaskId { get; set; }
    public Guid NewBoardColumnId { get; set; }
    public double NewSortOrder { get; set; }
}

public class MoveTaskCommandHandler : IRequestHandler<MoveTaskCommand, bool>
{
    private readonly IPMDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;

    public MoveTaskCommandHandler(IPMDbContext dbContext, ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
    }

    public async Task<bool> Handle(MoveTaskCommand request, CancellationToken cancellationToken)
    {
        var task = await _dbContext.TaskItems
            .Include(t => t.BoardColumn)
                .ThenInclude(c => c.Project)
            .FirstOrDefaultAsync(t => t.Id == request.TaskId, cancellationToken);

        if (task == null)
            throw new InvalidOperationException("Task not found.");

        var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("Bạn chưa đăng nhập.");

        if (task.BoardColumn.Project.TeamId.HasValue)
        {
            var requestingMember = await _dbContext.TeamMembers.FirstOrDefaultAsync(tm => tm.TeamId == task.BoardColumn.Project.TeamId.Value && tm.UserId == currentUserId, cancellationToken);
            if (requestingMember == null)
                throw new UnauthorizedAccessException("Bạn không có quyền di chuyển Task trong Project này.");

            bool isLeader = requestingMember.Role == "leader";
            bool isAssignee = task.AssigneeUserId == currentUserId;

            if (!isLeader && !isAssignee)
                throw new UnauthorizedAccessException("Chỉ có trưởng nhóm hoặc người thực hiện mới được quyền thay đổi trạng thái (di chuyển) công việc này.");
        }

        var oldColumnId = task.BoardColumnId;
        var newColumnId = request.NewBoardColumnId;

        // Check WIP limit only if moving to a different column
        if (oldColumnId != newColumnId)
        {
            var newColumn = await _dbContext.BoardColumns
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == newColumnId, cancellationToken);

            if (newColumn == null)
                throw new InvalidOperationException("Target column not found.");

            // Cập nhật trường CompletedAt
            task.CompletedAt = newColumn.IsDone ? DateTime.UtcNow : null;

            // Sinh ra Domain Event
            task.AddDomainEvent(new PM.Domain.Events.TaskMovedEvent(task.Id, currentUserId, oldColumnId, newColumnId));
        }

        // Update task to new column and direct double sort order
        task.BoardColumnId = newColumnId;
        task.SortOrder = request.NewSortOrder;
        task.UpdatedAt = DateTime.UtcNow;

        _dbContext.TaskItems.Update(task);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return true;
    }
}
