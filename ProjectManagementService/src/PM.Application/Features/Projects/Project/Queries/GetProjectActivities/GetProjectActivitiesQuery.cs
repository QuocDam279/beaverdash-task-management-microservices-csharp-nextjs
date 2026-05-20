using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Projects.Project.Queries.GetProjectActivities;

public class ActivityLogDto
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public Guid UserId { get; set; }
    public string? EntityType { get; set; }
    public Guid? EntityId { get; set; }
    public string? ActionType { get; set; }
    public string? OldValue { get; set; }
    public string? NewValue { get; set; }
    public DateTime CreatedAt { get; set; }

    // Thông tin người thực hiện hành động để UI hiển thị Timeline
    public string DisplayName { get; set; } = null!;
    public string? Avatar { get; set; }
}

public record GetProjectActivitiesQuery(Guid ProjectId) : IRequest<List<ActivityLogDto>>;

public class GetProjectActivitiesQueryHandler : IRequestHandler<GetProjectActivitiesQuery, List<ActivityLogDto>>
{
    private readonly IPMDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;

    public GetProjectActivitiesQueryHandler(IPMDbContext dbContext, ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
    }

    public async Task<List<ActivityLogDto>> Handle(GetProjectActivitiesQuery request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("Bạn chưa đăng nhập.");

        var project = await _dbContext.Projects
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == request.ProjectId, cancellationToken);

        if (project == null)
            return new List<ActivityLogDto>();

        if (project.TeamId.HasValue && !project.IsPublic)
        {
            var isMember = await _dbContext.TeamMembers.AnyAsync(tm => tm.TeamId == project.TeamId.Value && tm.UserId == currentUserId, cancellationToken);
            if (!isMember)
                throw new UnauthorizedAccessException("Bạn không có quyền xem lịch sử hoạt động của Project này.");
        }
        else if (!project.TeamId.HasValue && !project.IsPublic && project.CreatedByUserId != currentUserId)
        {
            throw new UnauthorizedAccessException("Bạn không có quyền xem lịch sử hoạt động của Project này.");
        }

        // Truy vấn ActivityLog theo ProjectId, kết hợp bảng User để lấy tên/avatar
        var activities = await _dbContext.ActivityLogs
            .AsNoTracking()
            .Include(a => a.User)
            .Where(a => a.ProjectId == request.ProjectId)
            .OrderByDescending(a => a.CreatedAt) // Mới nhất xếp lên đầu
            .Take(50) // Giới hạn lấy tối đa 50 log gần nhất
            .Select(a => new ActivityLogDto
            {
                Id = a.Id,
                ProjectId = a.ProjectId,
                UserId = a.UserId,
                EntityType = a.EntityType,
                EntityId = a.EntityId,
                ActionType = a.ActionType,
                OldValue = a.OldValue,
                NewValue = a.NewValue,
                CreatedAt = a.CreatedAt,
                DisplayName = a.User != null ? a.User.DisplayName : "Unknown User",
                Avatar = a.User != null ? a.User.Avatar : null
            })
            .ToListAsync(cancellationToken);

        return activities;
    }
}
