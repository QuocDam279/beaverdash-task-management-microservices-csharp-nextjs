using MediatR;
using PM.Application.Contracts;
using PM.Domain.Enums;
using PM.Domain.Events;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Sprints.Commands;

public class StartSprintCommandHandler : IRequestHandler<StartSprintCommand, bool>
{
    private readonly IPMDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;

    public StartSprintCommandHandler(IPMDbContext dbContext, ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
    }

    public async Task<bool> Handle(StartSprintCommand request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("Bạn chưa đăng nhập.");

        var sprint = await _dbContext.Sprints
            .FirstOrDefaultAsync(s => s.Id == request.SprintId, cancellationToken);

        if (sprint == null)
            throw new InvalidOperationException("Sprint không tồn tại.");

        if (sprint.Status != SprintStatus.Future)
            throw new InvalidOperationException("Chỉ có thể bắt đầu Sprint đang ở trạng thái lên kế hoạch (Future).");

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

        // Kiểm tra xem đã có Sprint active khác trong project chưa
        var hasActiveSprint = await _dbContext.Sprints
            .AnyAsync(s => s.ProjectId == sprint.ProjectId && s.Status == SprintStatus.Active, cancellationToken);

        if (hasActiveSprint)
            throw new InvalidOperationException("Dự án đã có một Sprint đang hoạt động. Vui lòng kết thúc nó trước khi bắt đầu Sprint mới.");

        // Bắt đầu Sprint
        sprint.Status = SprintStatus.Active;
        
        // Chỉ thiết lập ngày bắt đầu/kết thúc nếu chưa được gán giá trị trước đó
        if (!sprint.StartDate.HasValue)
        {
            sprint.StartDate = DateTime.UtcNow;
        }

        if (!sprint.EndDate.HasValue)
        {
            sprint.EndDate = sprint.StartDate.Value.AddDays(14); // Mặc định 2 tuần
        }

        sprint.UpdatedAt = DateTime.UtcNow;

        // Gán tất cả công việc trong Sprint này vào cột đầu tiên trên bảng Kanban của dự án
        var firstColumn = await _dbContext.BoardColumns
            .Where(c => c.ProjectId == sprint.ProjectId)
            .OrderBy(c => c.Position)
            .FirstOrDefaultAsync(cancellationToken);

        if (firstColumn != null)
        {
            var sprintTasks = await _dbContext.TaskItems
                .Where(t => t.SprintId == sprint.Id && t.DeletedAt == null)
                .ToListAsync(cancellationToken);

            foreach (var task in sprintTasks)
            {
                task.BoardColumnId = firstColumn.Id;
                task.UpdatedAt = DateTime.UtcNow;
            }
        }

        sprint.AddDomainEvent(new SprintStartedEvent(sprint.ProjectId, sprint.Id, sprint.Name, currentUserId));

        await _dbContext.SaveChangesAsync(cancellationToken);

        return true;
    }
}
