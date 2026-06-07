using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Teams.Queries.GetTeamProjects;

public class ProjectDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public int Progress { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime CreatedAt { get; set; }
    
    // UI cần thông tin người tạo
    public string CreatedByDisplayName { get; set; } = string.Empty;
    public string? CreatedByAvatar { get; set; }
}

public record GetTeamProjectsQuery(Guid TeamId) : IRequest<List<ProjectDto>>;

public class GetTeamProjectsQueryHandler : IRequestHandler<GetTeamProjectsQuery, List<ProjectDto>>
{
    private readonly IPMDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;

    public GetTeamProjectsQueryHandler(IPMDbContext dbContext, ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
    }

    public async Task<List<ProjectDto>> Handle(GetTeamProjectsQuery request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("Bạn chưa đăng nhập.");

        var isMember = await _dbContext.TeamMembers.AnyAsync(tm => tm.TeamId == request.TeamId && tm.UserId == currentUserId, cancellationToken);
        if (!isMember)
        {
            throw new UnauthorizedAccessException("Bạn không phải là thành viên của Team này.");
        }

        var projects = await _dbContext.Projects
            .AsNoTracking()
            .Where(p => p.TeamId == request.TeamId)
            .OrderByDescending(p => p.CreatedAt) // Mới nhất lên trên
            .Select(p => new
            {
                p.Id,
                p.Name,
                p.Description,
                p.StartDate,
                p.DueDate,
                p.CreatedAt,
                CreatedByDisplayName = p.CreatedByUser != null ? p.CreatedByUser.DisplayName : string.Empty,
                CreatedByAvatar = p.CreatedByUser != null ? p.CreatedByUser.Avatar : null,
                TotalTasksCount = _dbContext.TaskItems.Count(t => t.BoardColumn != null && t.BoardColumn.ProjectId == p.Id && t.DeletedAt == null),
                DoneTasksCount = _dbContext.TaskItems.Count(t => t.BoardColumn != null && t.BoardColumn.ProjectId == p.Id && t.DeletedAt == null && t.BoardColumn.IsDone)
            })
            .ToListAsync(cancellationToken);

        var projectDtos = projects.Select(p => new ProjectDto
        {
            Id = p.Id,
            Name = p.Name,
            Description = p.Description,
            Progress = p.TotalTasksCount > 0 ? (int)Math.Round((double)p.DoneTasksCount / p.TotalTasksCount * 100) : 0,
            StartDate = p.StartDate,
            DueDate = p.DueDate,
            CreatedAt = p.CreatedAt,
            CreatedByDisplayName = p.CreatedByDisplayName,
            CreatedByAvatar = p.CreatedByAvatar
        }).ToList();

        return projectDtos;
    }
}
