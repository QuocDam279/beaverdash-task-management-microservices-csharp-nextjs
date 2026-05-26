using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Search.Queries;

public record SearchResultDto(
    Guid Id,
    string Title,
    string Type,
    string Subtitle,
    string ActionUrl
);

public record GlobalSearchQuery(string Query) : IRequest<List<SearchResultDto>>;

public class GlobalSearchQueryHandler : IRequestHandler<GlobalSearchQuery, List<SearchResultDto>>
{
    private readonly IPMDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;

    public GlobalSearchQueryHandler(IPMDbContext dbContext, ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
    }

    public async Task<List<SearchResultDto>> Handle(GlobalSearchQuery request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException();
        var q = (request.Query ?? "").Trim().ToLower();

        if (string.IsNullOrWhiteSpace(q))
        {
            return new List<SearchResultDto>();
        }

        var results = new List<SearchResultDto>();

        // 1. Lấy danh sách Team ID mà user tham gia
        var userTeamIds = await _dbContext.TeamMembers
            .AsNoTracking()
            .Where(tm => tm.UserId == currentUserId)
            .Select(tm => tm.TeamId)
            .ToListAsync(cancellationToken);

        // 2. Lấy danh sách Project ID mà user có quyền truy cập
        var accessibleProjectIds = await _dbContext.Projects
            .AsNoTracking()
            .Where(p => (p.TeamId.HasValue && userTeamIds.Contains(p.TeamId.Value)) || (!p.TeamId.HasValue && p.CreatedByUserId == currentUserId))
            .Select(p => p.Id)
            .ToListAsync(cancellationToken);

        // --- TÌM KIẾM TEAMS ---
        var teams = await _dbContext.Teams
            .AsNoTracking()
            .Where(t => userTeamIds.Contains(t.Id) && t.Name.ToLower().Contains(q))
            .Take(10)
            .Select(t => new SearchResultDto(
                t.Id,
                t.Name,
                "team",
                "Nhóm",
                $"/teams/{t.Id}"
            ))
            .ToListAsync(cancellationToken);
        results.AddRange(teams);

        // --- TÌM KIẾM PROJECTS ---
        var projects = await _dbContext.Projects
            .AsNoTracking()
            .Where(p => accessibleProjectIds.Contains(p.Id) && p.Name.ToLower().Contains(q))
            .Take(10)
            .Select(p => new SearchResultDto(
                p.Id,
                p.Name,
                "project",
                "Dự án",
                $"/projects/{p.Id}/board"
            ))
            .ToListAsync(cancellationToken);
        results.AddRange(projects);

        // --- TÌM KIẾM PARENT TASKS ---
        var tasks = await _dbContext.TaskItems
            .AsNoTracking()
            .Include(t => t.BoardColumn)
                .ThenInclude(bc => bc!.Project)
            .Where(t => t.BoardColumn != null && accessibleProjectIds.Contains(t.BoardColumn.ProjectId) && t.Title.ToLower().Contains(q))
            .Take(15)
            .Select(t => new SearchResultDto(
                t.Id,
                t.Title,
                "task",
                $"Công việc chính (Dự án: {(t.BoardColumn != null && t.BoardColumn.Project != null ? t.BoardColumn.Project.Name : "")})",
                $"/projects/{(t.BoardColumn != null ? t.BoardColumn.ProjectId : Guid.Empty)}/board?taskId={t.Id}"
            ))
            .ToListAsync(cancellationToken);
        results.AddRange(tasks);

        // --- TÌM KIẾM SUBTASKS ---
        var subtasks = await _dbContext.SubTasks
            .AsNoTracking()
            .Include(s => s.Task)
                .ThenInclude(t => t!.BoardColumn)
                    .ThenInclude(bc => bc!.Project)
            .Where(s => s.Task != null && s.Task.BoardColumn != null && accessibleProjectIds.Contains(s.Task.BoardColumn.ProjectId) && s.Title.ToLower().Contains(q))
            .Take(15)
            .Select(s => new SearchResultDto(
                s.Id,
                s.Title,
                "subtask",
                $"Công việc phụ (Dự án: {(s.Task != null && s.Task.BoardColumn != null && s.Task.BoardColumn.Project != null ? s.Task.BoardColumn.Project.Name : "")} | Công việc chính: {(s.Task != null ? s.Task.Title : "")})",
                $"/projects/{(s.Task != null && s.Task.BoardColumn != null ? s.Task.BoardColumn.ProjectId : Guid.Empty)}/board?taskId={(s.Task != null ? s.Task.Id : Guid.Empty)}"
            ))
            .ToListAsync(cancellationToken);
        results.AddRange(subtasks);

        return results;
    }
}
