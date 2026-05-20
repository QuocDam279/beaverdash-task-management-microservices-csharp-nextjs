using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Tasks.SubTasks.Commands;

public class DeleteSubTaskCommandHandler : IRequestHandler<DeleteSubTaskCommand, bool>
{
    private readonly IPMDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;

    public DeleteSubTaskCommandHandler(IPMDbContext dbContext, ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
    }

    public async Task<bool> Handle(DeleteSubTaskCommand request, CancellationToken cancellationToken)
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
                throw new UnauthorizedAccessException("Bạn không có quyền xóa SubTask này.");
        }
        else if (project.CreatedByUserId != currentUserId)
        {
            throw new UnauthorizedAccessException("Bạn không có quyền xóa SubTask này.");
        }

        subTask.DeletedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }
}
