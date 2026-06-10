using MediatR;
using PM.Application.Contracts;
using PM.Domain.Enums;
using PM.Domain.Events;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Sprints.Commands;

public class CloseSprintCommandHandler : IRequestHandler<CloseSprintCommand, bool>
{
    private readonly IPMDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;

    public CloseSprintCommandHandler(IPMDbContext dbContext, ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
    }

    public async Task<bool> Handle(CloseSprintCommand request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("Bạn chưa đăng nhập.");

        // Lấy Sprint kèm danh sách Task và cột để check IsDone
        var sprint = await _dbContext.Sprints
            .Include(s => s.TaskItems)
                .ThenInclude(t => t.BoardColumn)
            .FirstOrDefaultAsync(s => s.Id == request.SprintId, cancellationToken);

        if (sprint == null)
            throw new InvalidOperationException("Sprint không tồn tại.");

        if (sprint.Status != SprintStatus.Active)
            throw new InvalidOperationException("Chỉ có thể kết thúc một Sprint đang hoạt động (Active).");

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

        // Phân loại Task: hoàn thành vs chưa hoàn thành
        var completedTasks = sprint.TaskItems.Where(t => t.BoardColumn != null && t.BoardColumn.IsDone).ToList();
        var incompleteTasks = sprint.TaskItems.Where(t => t.BoardColumn == null || !t.BoardColumn.IsDone).ToList();

        // Xử lý các task chưa hoàn thành
        if (incompleteTasks.Any())
        {
            if (request.Action == UncompletedTaskAction.MoveToNextSprint && request.MoveToSprintId.HasValue)
            {
                var nextSprint = await _dbContext.Sprints
                    .FirstOrDefaultAsync(s => s.Id == request.MoveToSprintId.Value && s.ProjectId == sprint.ProjectId, cancellationToken);

                if (nextSprint == null)
                    throw new InvalidOperationException("Sprint đích để chuyển công việc không hợp lệ.");

                if (nextSprint.Status == SprintStatus.Closed)
                    throw new InvalidOperationException("Không thể chuyển công việc vào một Sprint đã kết thúc.");

                foreach (var task in incompleteTasks)
                {
                    task.SprintId = request.MoveToSprintId.Value;
                    task.UpdatedAt = DateTime.UtcNow;
                }
            }
            else
            {
                // Mặc định hoặc chọn MoveToBacklog: trả về Backlog (SprintId = null)
                foreach (var task in incompleteTasks)
                {
                    task.SprintId = null;
                    task.UpdatedAt = DateTime.UtcNow;
                }
            }
        }

        // Kết thúc Sprint
        sprint.Status = SprintStatus.Closed;
        sprint.EndDate = DateTime.UtcNow; // Đặt ngày kết thúc thực tế
        sprint.UpdatedAt = DateTime.UtcNow;

        sprint.AddDomainEvent(new SprintClosedEvent(
            sprint.ProjectId,
            sprint.Id,
            sprint.Name,
            currentUserId,
            completedTasks.Count,
            incompleteTasks.Count
        ));

        await _dbContext.SaveChangesAsync(cancellationToken);

        return true;
    }
}
