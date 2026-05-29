using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using PM.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Tasks.TaskItem.Queries;

public class MyTaskDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public string? Priority { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? DueDate { get; set; }
    public Guid BoardColumnId { get; set; }
    public string ColumnName { get; set; } = null!;
    public bool ColumnIsDone { get; set; }
    public Guid ProjectId { get; set; }
    public string ProjectName { get; set; } = null!;
    public Guid? TeamId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public int SubTasksCount { get; set; }
    public int CompletedSubTasksCount { get; set; }
}

public record GetMyTasksQuery : IRequest<List<MyTaskDto>>;

public class GetMyTasksQueryHandler : IRequestHandler<GetMyTasksQuery, List<MyTaskDto>>
{
    private readonly IPMDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;

    public GetMyTasksQueryHandler(IPMDbContext dbContext, ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
    }

    public async Task<List<MyTaskDto>> Handle(GetMyTasksQuery request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("Bạn chưa đăng nhập.");

        var tasks = await _dbContext.TaskItems
            .AsNoTracking()
            .Where(t => t.DeletedAt == null && (
                t.SubTasks.Any(st => st.AssigneeUserId == currentUserId && st.DeletedAt == null) ||
                (t.BoardColumn != null && t.BoardColumn.Project != null && 
                 t.BoardColumn.Project.TeamId == null && t.BoardColumn.Project.CreatedByUserId == currentUserId)
            ))
            .OrderBy(t => t.DueDate ?? DateTime.MaxValue)
            .Select(t => new MyTaskDto
            {
                Id = t.Id,
                Title = t.Title,
                Description = t.Description,
                Priority = t.Priority != null ? t.Priority.ToString() : null,
                StartDate = t.StartDate,
                DueDate = t.DueDate,
                BoardColumnId = t.BoardColumnId,
                ColumnName = t.BoardColumn != null ? t.BoardColumn.Name : string.Empty,
                ColumnIsDone = t.BoardColumn != null && t.BoardColumn.IsDone,
                ProjectId = t.BoardColumn != null ? t.BoardColumn.ProjectId : Guid.Empty,
                ProjectName = t.BoardColumn != null && t.BoardColumn.Project != null ? t.BoardColumn.Project.Name : string.Empty,
                TeamId = t.BoardColumn != null && t.BoardColumn.Project != null ? t.BoardColumn.Project.TeamId : null,
                CreatedAt = t.CreatedAt,
                UpdatedAt = t.UpdatedAt,
                SubTasksCount = t.SubTasks.Count(st => st.DeletedAt == null),
                CompletedSubTasksCount = t.SubTasks.Count(st => st.IsCompleted && st.DeletedAt == null)
            })
            .ToListAsync(cancellationToken);

        return tasks;
    }
}
