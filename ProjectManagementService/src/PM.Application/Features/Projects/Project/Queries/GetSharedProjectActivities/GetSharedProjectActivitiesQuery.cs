using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using PM.Application.Features.Projects.Project.Queries.GetProjectActivities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Projects.Project.Queries.GetSharedProjectActivities;

public record GetSharedProjectActivitiesQuery(
    string ShareToken, 
    int Page = 1, 
    int PageSize = 50, 
    Guid? UserId = null, 
    string? Date = null) : IRequest<List<ActivityLogDto>>;

public class GetSharedProjectActivitiesQueryHandler : IRequestHandler<GetSharedProjectActivitiesQuery, List<ActivityLogDto>>
{
    private readonly IPMDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;

    public GetSharedProjectActivitiesQueryHandler(IPMDbContext dbContext, ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
    }

    public async Task<List<ActivityLogDto>> Handle(GetSharedProjectActivitiesQuery request, CancellationToken cancellationToken)
    {
        var project = await SharedProjectAccessHelper.GetSharedProjectAndVerifyAccessAsync(
            _dbContext,
            _currentUserService,
            request.ShareToken,
            cancellationToken);

        if (project == null)
            return new List<ActivityLogDto>();

        int page = request.Page > 0 ? request.Page : 1;
        int pageSize = request.PageSize > 0 ? request.PageSize : 50;

        var queryable = _dbContext.ActivityLogs
            .AsNoTracking()
            .Where(a => a.ProjectId == project.Id);

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
            .OrderByDescending(a => a.CreatedAt)
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
