using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using PM.Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Tasks.TaskItem.Commands;

public class PermanentDeleteTaskCommand : IRequest<bool>
{
    public Guid TaskId { get; set; }
}

public class PermanentDeleteTaskCommandHandler : IRequestHandler<PermanentDeleteTaskCommand, bool>
{
    private readonly IPMDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;

    public PermanentDeleteTaskCommandHandler(IPMDbContext dbContext, ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
    }

    public async Task<bool> Handle(PermanentDeleteTaskCommand request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("Bạn chưa đăng nhập.");

        var task = await _dbContext.TaskItems
            .IgnoreQueryFilters()
            .Include(t => t.BoardColumn)
                .ThenInclude(c => c!.Project)
            .FirstOrDefaultAsync(t => t.Id == request.TaskId, cancellationToken);

        if (task == null)
            return false;

        if (task.BoardColumn == null || task.BoardColumn.Project == null || !task.BoardColumn.Project.TeamId.HasValue)
        {
            throw new UnauthorizedAccessException("Bạn không có quyền xóa vĩnh viễn công việc này.");
        }

        var requestingMember = await _dbContext.TeamMembers
            .FirstOrDefaultAsync(tm => tm.TeamId == task.BoardColumn.Project.TeamId.Value && tm.UserId == currentUserId, cancellationToken);

        bool isLeader = requestingMember != null && (requestingMember.Role == "leader" || requestingMember.Role == "Owner");
        bool isCreatorAndDeleter = task.CreatedByUserId == currentUserId && task.DeletedByUserId == currentUserId;

        if (!isLeader && !isCreatorAndDeleter)
        {
            throw new UnauthorizedAccessException("Chỉ có trưởng nhóm hoặc người tạo kiêm người xóa công việc này mới có quyền xóa vĩnh viễn.");
        }

        task.AddDomainEvent(new PM.Domain.Events.TaskPermanentlyDeletedEvent(
            task.BoardColumn!.ProjectId,
            task.Id,
            task.Title,
            currentUserId
        ));

        _dbContext.TaskItems.Remove(task);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }
}
