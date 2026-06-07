using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Tasks.TaskItem.Queries;

public class TrashTaskDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = null!;
    public DateTime? DeletedAt { get; set; }
    public Guid ProjectId { get; set; }
    public string ProjectName { get; set; } = null!;
    public string ColumnName { get; set; } = null!;
    public bool IsCompleted { get; set; }
    public bool CanPermanentDelete { get; set; }
}

public record GetTrashTasksQuery : IRequest<List<TrashTaskDto>>;

public class GetTrashTasksQueryHandler : IRequestHandler<GetTrashTasksQuery, List<TrashTaskDto>>
{
    private readonly IPMDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;

    public GetTrashTasksQueryHandler(IPMDbContext dbContext, ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
    }

    public async Task<List<TrashTaskDto>> Handle(GetTrashTasksQuery request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("Bạn chưa đăng nhập.");

        // Find teams user is member of
        var myTeamIds = await _dbContext.TeamMembers
            .AsNoTracking()
            .Where(tm => tm.UserId == currentUserId)
            .Select(tm => tm.TeamId)
            .ToListAsync(cancellationToken);

        // Find team IDs where user is leader or owner
        var leaderTeamIds = await _dbContext.TeamMembers
            .AsNoTracking()
            .Where(tm => tm.UserId == currentUserId && (tm.Role == "leader" || tm.Role == "Owner"))
            .Select(tm => tm.TeamId)
            .ToListAsync(cancellationToken);

        // Query trash tasks with direct projection to TrashTaskDto
        var trashTasks = await _dbContext.TaskItems
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(t => t.DeletedAt != null && 
                        t.BoardColumn != null && 
                        t.BoardColumn!.Project!.TeamId.HasValue && 
                        myTeamIds.Contains(t.BoardColumn!.Project!.TeamId.Value))
            .OrderByDescending(t => t.DeletedAt)
            .Select(t => new TrashTaskDto
            {
                Id = t.Id,
                Title = t.Title,
                DeletedAt = t.DeletedAt,
                ProjectId = t.BoardColumn != null ? t.BoardColumn.ProjectId : Guid.Empty,
                ProjectName = t.BoardColumn != null && t.BoardColumn.Project != null ? t.BoardColumn.Project.Name : "Không rõ",
                ColumnName = t.BoardColumn != null ? t.BoardColumn.Name : "Không rõ",
                IsCompleted = t.CompletedAt.HasValue || (t.BoardColumn != null && t.BoardColumn.IsDone),
                CanPermanentDelete = t.BoardColumn != null && t.BoardColumn.Project != null && t.BoardColumn.Project.TeamId.HasValue && leaderTeamIds.Contains(t.BoardColumn.Project.TeamId.Value)
            })
            .ToListAsync(cancellationToken);

        return trashTasks;
    }
}
