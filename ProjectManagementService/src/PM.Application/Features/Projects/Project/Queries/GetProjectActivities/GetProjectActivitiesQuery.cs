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

public record GetProjectActivitiesQuery(Guid ProjectId, int Page = 1, int PageSize = 50, Guid? UserId = null, string? Date = null) : IRequest<List<ActivityLogDto>>;

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

        if (!project.IsPublic)
        {
            if (!project.TeamId.HasValue)
            {
                throw new UnauthorizedAccessException("Bạn không có quyền xem lịch sử hoạt động của Project này.");
            }

            var isMember = await _dbContext.TeamMembers.AnyAsync(tm => tm.TeamId == project.TeamId.Value && tm.UserId == currentUserId, cancellationToken);
            if (!isMember)
                throw new UnauthorizedAccessException("Bạn không có quyền xem lịch sử hoạt động của Project này.");
        }

        int page = request.Page > 0 ? request.Page : 1;
        int pageSize = request.PageSize > 0 ? request.PageSize : 50;

        // Truy vấn ActivityLog theo ProjectId, kết hợp bảng User để lấy tên/avatar
        var queryable = _dbContext.ActivityLogs
            .AsNoTracking()
            .Where(a => a.ProjectId == request.ProjectId);

        if (request.UserId.HasValue)
        {
            queryable = queryable.Where(a => a.UserId == request.UserId.Value);
        }

        if (!string.IsNullOrEmpty(request.Date))
        {
            if (DateTime.TryParse(request.Date, out var dateValue))
            {
                var startDate = DateTime.SpecifyKind(dateValue.Date, DateTimeKind.Utc);
                var endDate = DateTime.SpecifyKind(dateValue.Date.AddDays(1), DateTimeKind.Utc);
                queryable = queryable.Where(a => a.CreatedAt >= startDate && a.CreatedAt < endDate);
            }
        }

        var activities = await queryable
            .OrderByDescending(a => a.CreatedAt) // Mới nhất xếp lên đầu
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
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
