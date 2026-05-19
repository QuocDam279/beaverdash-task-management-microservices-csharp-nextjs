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

    public GetProjectActivitiesQueryHandler(IPMDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<ActivityLogDto>> Handle(GetProjectActivitiesQuery request, CancellationToken cancellationToken)
    {
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
