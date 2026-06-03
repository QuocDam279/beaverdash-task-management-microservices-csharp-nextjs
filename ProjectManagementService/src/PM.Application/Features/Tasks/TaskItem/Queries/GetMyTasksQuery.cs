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
    public Guid ParentTaskId { get; set; }
    public string ParentTaskTitle { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public string? Priority { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? DueDate { get; set; }
    public Guid BoardColumnId { get; set; }
    public string ColumnName { get; set; } = null!;
    public bool ColumnIsDone { get; set; }
    public bool IsCompleted { get; set; }
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

        var tasks = await _dbContext.SubTasks
            .AsNoTracking()
            .Where(st => st.DeletedAt == null && st.AssigneeUserId == currentUserId && st.Task != null)
            .OrderBy(st => st.DueDate ?? DateTime.MaxValue)
            .Select(st => new MyTaskDto
            {
                Id = st.Id,
                ParentTaskId = st.TaskId,
                ParentTaskTitle = st.Task!.Title,
                Title = st.Title,
                Description = st.Task.Description,
                Priority = st.Priority != null ? st.Priority.ToString() : null,
                StartDate = st.Task.StartDate,
                DueDate = st.DueDate,
                BoardColumnId = st.Task.BoardColumnId,
                ColumnName = st.Task.BoardColumn != null ? st.Task.BoardColumn.Name : string.Empty,
                ColumnIsDone = st.Task.BoardColumn != null && st.Task.BoardColumn.IsDone,
                IsCompleted = st.IsCompleted,
                ProjectId = st.Task.BoardColumn != null ? st.Task.BoardColumn.ProjectId : Guid.Empty,
                ProjectName = st.Task.BoardColumn != null && st.Task.BoardColumn.Project != null ? st.Task.BoardColumn.Project.Name : string.Empty,
                TeamId = st.Task.BoardColumn != null && st.Task.BoardColumn.Project != null ? st.Task.BoardColumn.Project.TeamId : null,
                CreatedAt = st.CreatedAt,
                UpdatedAt = st.UpdatedAt,
                SubTasksCount = st.Task.SubTasks.Count(s => s.DeletedAt == null),
                CompletedSubTasksCount = st.Task.SubTasks.Count(s => s.IsCompleted && s.DeletedAt == null)
            })
            .ToListAsync(cancellationToken);

        return tasks;
    }
}
