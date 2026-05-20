using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using System;
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
        if (project.TeamId.HasValue)
        {
            var isMember = await _dbContext.TeamMembers.AnyAsync(tm => tm.TeamId == project.TeamId.Value && tm.UserId == currentUserId, cancellationToken);
            if (!isMember)
                throw new UnauthorizedAccessException("Bạn không có quyền sửa SubTask này.");
        }
        else if (project.CreatedByUserId != currentUserId)
        {
            throw new UnauthorizedAccessException("Bạn không có quyền sửa SubTask này.");
        }

        // Validate deadline
        if (request.DueDate.HasValue && subTask.Task.DueDate.HasValue)
        {
            if (request.DueDate.Value > subTask.Task.DueDate.Value)
                throw new InvalidOperationException("Hạn hoàn thành của SubTask không được vượt quá hạn hoàn thành của Task cha.");
        }

        subTask.Title = request.Title;
        subTask.AssigneeUserId = request.AssigneeUserId;
        subTask.StartDate = request.StartDate;
        subTask.DueDate = request.DueDate;
        subTask.IsCompleted = request.IsCompleted;
        subTask.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }
}
