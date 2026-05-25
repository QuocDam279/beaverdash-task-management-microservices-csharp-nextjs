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
    public string ProjectName { get; set; } = null!;
    public string ColumnName { get; set; } = null!;
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

        // Find projects user has access to
        var myProjectIds = await _dbContext.Projects
            .AsNoTracking()
            .Where(p => p.CreatedByUserId == currentUserId || (p.TeamId.HasValue && myTeamIds.Contains(p.TeamId.Value)))
            .Select(p => p.Id)
            .ToListAsync(cancellationToken);

        // Query trash tasks
        var trashTasks = await _dbContext.TaskItems
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(t => t.DeletedAt != null && 
                       (t.CreatedByUserId == currentUserId || 
                        _dbContext.BoardColumns
                            .Where(bc => myProjectIds.Contains(bc.ProjectId))
                            .Select(bc => bc.Id)
                            .Contains(t.BoardColumnId)))
            .OrderByDescending(t => t.DeletedAt)
            .Select(t => new TrashTaskDto
            {
                Id = t.Id,
                Title = t.Title,
                DeletedAt = t.DeletedAt,
                ProjectName = t.BoardColumn != null && t.BoardColumn.Project != null ? t.BoardColumn.Project.Name : "Không rõ",
                ColumnName = t.BoardColumn != null ? t.BoardColumn.Name : "Không rõ"
            })
            .ToListAsync(cancellationToken);

        return trashTasks;
    }
}
