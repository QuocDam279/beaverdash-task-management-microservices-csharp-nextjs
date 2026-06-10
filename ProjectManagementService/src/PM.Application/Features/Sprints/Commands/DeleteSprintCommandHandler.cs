using MediatR;
using PM.Application.Contracts;
using PM.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Sprints.Commands;

public class DeleteSprintCommandHandler : IRequestHandler<DeleteSprintCommand, bool>
{
    private readonly IPMDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;

    public DeleteSprintCommandHandler(IPMDbContext dbContext, ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
    }

    public async Task<bool> Handle(DeleteSprintCommand request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("Bạn chưa đăng nhập.");

        var sprint = await _dbContext.Sprints
            .Include(s => s.TaskItems)
            .FirstOrDefaultAsync(s => s.Id == request.SprintId, cancellationToken);

        if (sprint == null)
            throw new InvalidOperationException("Sprint không tồn tại.");

        if (sprint.Status != SprintStatus.Future)
            throw new InvalidOperationException("Chỉ có thể xóa Sprint đang ở trạng thái lên kế hoạch (Future).");

        // Kiểm tra quyền trên project
        var project = await _dbContext.Projects
            .FirstOrDefaultAsync(p => p.Id == sprint.ProjectId, cancellationToken);

        if (project == null)
            throw new InvalidOperationException("Project của Sprint không tồn tại.");

        if (!project.TeamId.HasValue)
        {
            throw new UnauthorizedAccessException("Bạn không có quyền quản lý Sprint của Project này.");
        }

        var isMember = await _dbContext.TeamMembers.AnyAsync(
            tm => tm.TeamId == project.TeamId.Value && tm.UserId == currentUserId, 
            cancellationToken);

        if (!isMember)
            throw new UnauthorizedAccessException("Bạn không có quyền quản lý Sprint của Project này.");

        // Đẩy tất cả task của Sprint về Backlog
        foreach (var task in sprint.TaskItems)
        {
            task.SprintId = null;
            task.UpdatedAt = DateTime.UtcNow;
        }

        _dbContext.Sprints.Remove(sprint);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return true;
    }
}
