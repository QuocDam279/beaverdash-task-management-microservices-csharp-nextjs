using MediatR;
using PM.Application.Contracts;
using PM.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Sprints.Commands;

public class MoveTaskToSprintCommandHandler : IRequestHandler<MoveTaskToSprintCommand, bool>
{
    private readonly IPMDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;

    public MoveTaskToSprintCommandHandler(IPMDbContext dbContext, ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
    }

    public async Task<bool> Handle(MoveTaskToSprintCommand request, CancellationToken cancellationToken)
    {
        if (request.TaskIds == null || !request.TaskIds.Any())
            return true;

        var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("Bạn chưa đăng nhập.");

        // Kiểm tra quyền trên project
        var project = await _dbContext.Projects
            .FirstOrDefaultAsync(p => p.Id == request.ProjectId, cancellationToken);

        if (project == null)
            throw new InvalidOperationException("Project không tồn tại.");

        if (!project.TeamId.HasValue)
        {
            throw new UnauthorizedAccessException("Bạn không có quyền quản lý công việc của Project này.");
        }

        var isMember = await _dbContext.TeamMembers.AnyAsync(
            tm => tm.TeamId == project.TeamId.Value && tm.UserId == currentUserId, 
            cancellationToken);

        if (!isMember)
            throw new UnauthorizedAccessException("Bạn không có quyền quản lý công việc của Project này.");

        // Nếu di chuyển vào Sprint, kiểm tra Sprint hợp lệ
        if (request.SprintId.HasValue)
        {
            var sprint = await _dbContext.Sprints
                .FirstOrDefaultAsync(s => s.Id == request.SprintId.Value && s.ProjectId == request.ProjectId, cancellationToken);

            if (sprint == null)
                throw new InvalidOperationException("Sprint đích không tồn tại hoặc không thuộc Project này.");

            if (sprint.Status == SprintStatus.Closed)
                throw new InvalidOperationException("Không thể di chuyển công việc vào một Sprint đã kết thúc.");
        }

        // Lấy danh sách Task cần di chuyển, bảo đảm thuộc Project này thông qua BoardColumn
        var tasks = await _dbContext.TaskItems
            .Include(t => t.BoardColumn)
            .Where(t => request.TaskIds.Contains(t.Id) && t.BoardColumn != null && t.BoardColumn.ProjectId == request.ProjectId)
            .ToListAsync(cancellationToken);

        foreach (var task in tasks)
        {
            task.SprintId = request.SprintId;
            task.UpdatedAt = DateTime.UtcNow;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        return true;
    }
}
