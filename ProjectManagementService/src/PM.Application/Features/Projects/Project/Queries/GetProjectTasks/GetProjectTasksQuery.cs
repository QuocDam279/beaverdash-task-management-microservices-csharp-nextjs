using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Projects.Project.Queries.GetProjectTasks;

public class ProjectSubTaskDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = null!;
    public bool IsCompleted { get; set; }
    public DateTime? DueDate { get; set; }
    public Guid? AssigneeUserId { get; set; }
    public string? AssigneeName { get; set; }
}

public class ProjectTaskItemDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = null!;
    public string? Priority { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? DueDate { get; set; }
    public string? ColumnName { get; set; }
    public string? SprintName { get; set; }
    public List<ProjectSubTaskDto> SubTasks { get; set; } = new();
}

public class ProjectTasksDto
{
    public List<ProjectTaskItemDto> Tasks { get; set; } = new();
}

public record GetProjectTasksQuery(Guid ProjectId) : IRequest<ProjectTasksDto?>;

public class GetProjectTasksQueryHandler : IRequestHandler<GetProjectTasksQuery, ProjectTasksDto?>
{
    private readonly IPMDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;

    public GetProjectTasksQueryHandler(IPMDbContext dbContext, ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
    }

    public async Task<ProjectTasksDto?> Handle(GetProjectTasksQuery request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("Bạn chưa đăng nhập.");

        // Check project exists and authorization
        var projectInfo = await _dbContext.Projects
            .AsNoTracking()
            .Select(p => new { p.Id, p.TeamId, p.IsPublic })
            .FirstOrDefaultAsync(p => p.Id == request.ProjectId, cancellationToken);

        if (projectInfo == null)
            return null;

        if (!projectInfo.IsPublic)
        {
            if (!projectInfo.TeamId.HasValue)
                throw new UnauthorizedAccessException("Bạn không có quyền xem Project này.");

            var isMember = await _dbContext.TeamMembers.AnyAsync(tm => tm.TeamId == projectInfo.TeamId.Value && tm.UserId == currentUserId, cancellationToken);
            if (!isMember)
                throw new UnauthorizedAccessException("Bạn không có quyền xem Project này.");
        }

        // Fetch tasks
        var tasks = await _dbContext.TaskItems
            .AsNoTracking()
            .Where(t => t.BoardColumn != null && t.BoardColumn.ProjectId == request.ProjectId && t.DeletedAt == null)
            .OrderBy(t => t.CreatedAt)
            .Select(t => new ProjectTaskItemDto
            {
                Id = t.Id,
                Title = t.Title,
                Priority = t.Priority != null ? t.Priority.ToString() : null,
                StartDate = t.StartDate,
                DueDate = t.DueDate,
                ColumnName = t.BoardColumn != null ? t.BoardColumn.Name : null,
                SprintName = t.Sprint != null ? t.Sprint.Name : "Backlog",
                SubTasks = t.SubTasks.Where(st => st.DeletedAt == null).Select(st => new ProjectSubTaskDto
                {
                    Id = st.Id,
                    Title = st.Title,
                    IsCompleted = st.IsCompleted,
                    DueDate = st.DueDate,
                    AssigneeUserId = st.AssigneeUserId,
                    AssigneeName = st.AssigneeUser != null ? st.AssigneeUser.DisplayName : null
                }).ToList()
            })
            .ToListAsync(cancellationToken);

        return new ProjectTasksDto
        {
            Tasks = tasks
        };
    }
}
