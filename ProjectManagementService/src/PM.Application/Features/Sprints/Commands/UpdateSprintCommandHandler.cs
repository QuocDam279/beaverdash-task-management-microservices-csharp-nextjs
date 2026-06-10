using MediatR;
using PM.Application.Contracts;
using PM.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Sprints.Commands;

public class UpdateSprintCommandHandler : IRequestHandler<UpdateSprintCommand, bool>
{
    private readonly IPMDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;

    public UpdateSprintCommandHandler(IPMDbContext dbContext, ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
    }

    public async Task<bool> Handle(UpdateSprintCommand request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("Bạn chưa đăng nhập.");

        var sprint = await _dbContext.Sprints
            .FirstOrDefaultAsync(s => s.Id == request.SprintId, cancellationToken);

        if (sprint == null)
            throw new InvalidOperationException("Sprint không tồn tại.");

        if (sprint.Status != SprintStatus.Future)
            throw new InvalidOperationException("Chỉ có thể chỉnh sửa Sprint đang ở trạng thái lên kế hoạch (Future).");

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

        // Validate name uniqueness in the project (excluding this sprint)
        var normalizedName = request.Name.Trim().ToLower();
        var nameExists = await _dbContext.Sprints.AnyAsync(
            s => s.ProjectId == sprint.ProjectId && s.Id != sprint.Id && s.Name.Trim().ToLower() == normalizedName,
            cancellationToken);

        if (nameExists)
        {
            throw new InvalidOperationException($"Sprint với tên \"{request.Name}\" đã tồn tại trong dự án này.");
        }

        // Validate dates
        if (request.StartDate.HasValue && request.EndDate.HasValue && request.StartDate.Value > request.EndDate.Value)
        {
            throw new InvalidOperationException("Ngày bắt đầu của Sprint không được lớn hơn ngày kết thúc.");
        }

        if (project.StartDate.HasValue)
        {
            if (request.StartDate.HasValue && request.StartDate.Value.Date < project.StartDate.Value.Date)
            {
                throw new InvalidOperationException($"Ngày bắt đầu của Sprint không được nhỏ hơn ngày bắt đầu của dự án ({project.StartDate.Value:yyyy-MM-dd}).");
            }
            if (request.EndDate.HasValue && request.EndDate.Value.Date < project.StartDate.Value.Date)
            {
                throw new InvalidOperationException($"Ngày kết thúc của Sprint không được nhỏ hơn ngày bắt đầu của dự án ({project.StartDate.Value:yyyy-MM-dd}).");
            }
        }

        if (project.DueDate.HasValue)
        {
            if (request.StartDate.HasValue && request.StartDate.Value.Date > project.DueDate.Value.Date)
            {
                throw new InvalidOperationException($"Ngày bắt đầu của Sprint không được lớn hơn hạn hoàn thành của dự án ({project.DueDate.Value:yyyy-MM-dd}).");
            }
            if (request.EndDate.HasValue && request.EndDate.Value.Date > project.DueDate.Value.Date)
            {
                throw new InvalidOperationException($"Ngày kết thúc của Sprint không được lớn hơn hạn hoàn thành của dự án ({project.DueDate.Value:yyyy-MM-dd}).");
            }
        }

        sprint.Name = request.Name;
        sprint.Goal = request.Goal;
        sprint.StartDate = request.StartDate.HasValue ? DateTime.SpecifyKind(request.StartDate.Value, DateTimeKind.Utc) : null;
        sprint.EndDate = request.EndDate.HasValue ? DateTime.SpecifyKind(request.EndDate.Value, DateTimeKind.Utc) : null;
        sprint.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return true;
    }
}
