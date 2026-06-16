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

public class MyTasksResponseDto
{
    public List<MyTaskDto> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => PageSize > 0 ? (int)Math.Ceiling(TotalCount / (double)PageSize) : 0;
    
    // Stats
    public int TotalTasksCount { get; set; }
    public int CompletedTasksCount { get; set; }
    public int UncompletedTasksCount { get; set; }
    public List<MyTaskDto> OverdueTasks { get; set; } = new();
    public List<MyTaskDto> TodayTasks { get; set; } = new();
}

public record GetMyTasksQuery : IRequest<MyTasksResponseDto>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public string? SearchQuery { get; init; }
    public Guid? ProjectId { get; init; }
    public string? Priority { get; init; }
    public string? Status { get; init; }
    public string? DueDateFilter { get; init; }
    public string? SortBy { get; init; }
}

public class GetMyTasksQueryHandler : IRequestHandler<GetMyTasksQuery, MyTasksResponseDto>
{
    private readonly IPMDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;

    public GetMyTasksQueryHandler(IPMDbContext dbContext, ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
    }

    public async Task<MyTasksResponseDto> Handle(GetMyTasksQuery request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("Bạn chưa đăng nhập.");

        // Find teams user is currently a member of
        var myTeamIds = await _dbContext.TeamMembers
            .AsNoTracking()
            .Where(tm => tm.UserId == currentUserId)
            .Select(tm => tm.TeamId)
            .ToListAsync(cancellationToken);

        var baseQuery = _dbContext.SubTasks
            .AsNoTracking()
            .Where(st => st.DeletedAt == null && 
                         st.AssigneeUserId == currentUserId && 
                         st.Task != null &&
                         (st.Task!.Sprint == null || st.Task!.Sprint!.Status != SprintStatus.Closed) &&
                         st.Task!.BoardColumn != null &&
                         st.Task!.BoardColumn!.Project!.TeamId.HasValue &&
                         myTeamIds.Contains(st.Task!.BoardColumn!.Project!.TeamId.Value));

        // 1. Calculate stats on all tasks assigned to the user
        var totalTasksCount = await baseQuery.CountAsync(cancellationToken);
        var completedTasksCount = await baseQuery.CountAsync(st => st.IsCompleted, cancellationToken);
        var uncompletedTasksCount = totalTasksCount - completedTasksCount;

        var todayStart = DateTime.UtcNow.Date;
        var todayEnd = todayStart.AddDays(1).AddTicks(-1);

        var overdueTasks = await baseQuery
            .Where(st => !st.IsCompleted && st.DueDate != null && st.DueDate < todayStart)
            .OrderBy(st => st.DueDate)
            .Select(st => new MyTaskDto
            {
                Id = st.Id,
                ParentTaskId = st.TaskId,
                ParentTaskTitle = st.Task!.Title,
                Title = st.Title,
                Description = st.Task!.Description,
                Priority = st.Priority != null ? st.Priority.ToString() : null,
                StartDate = st.Task!.StartDate,
                DueDate = st.DueDate,
                BoardColumnId = st.Task!.BoardColumnId,
                ColumnName = st.Task!.BoardColumn != null ? st.Task!.BoardColumn!.Name : string.Empty,
                ColumnIsDone = st.Task!.BoardColumn != null && st.Task!.BoardColumn!.IsDone,
                IsCompleted = st.IsCompleted,
                ProjectId = st.Task!.BoardColumn != null ? st.Task!.BoardColumn!.ProjectId : Guid.Empty,
                ProjectName = st.Task!.BoardColumn != null && st.Task!.BoardColumn!.Project != null ? st.Task!.BoardColumn!.Project!.Name : string.Empty,
                TeamId = st.Task!.BoardColumn != null && st.Task!.BoardColumn!.Project != null ? st.Task!.BoardColumn!.Project!.TeamId : null,
                CreatedAt = st.CreatedAt,
                UpdatedAt = st.UpdatedAt,
                SubTasksCount = st.Task!.SubTasks.Count(s => s.DeletedAt == null),
                CompletedSubTasksCount = st.Task!.SubTasks.Count(s => s.IsCompleted && s.DeletedAt == null)
            })
            .ToListAsync(cancellationToken);

        var todayTasks = await baseQuery
            .Where(st => !st.IsCompleted && st.DueDate != null && st.DueDate >= todayStart && st.DueDate <= todayEnd)
            .OrderBy(st => st.DueDate)
            .Select(st => new MyTaskDto
            {
                Id = st.Id,
                ParentTaskId = st.TaskId,
                ParentTaskTitle = st.Task!.Title,
                Title = st.Title,
                Description = st.Task!.Description,
                Priority = st.Priority != null ? st.Priority.ToString() : null,
                StartDate = st.Task!.StartDate,
                DueDate = st.DueDate,
                BoardColumnId = st.Task!.BoardColumnId,
                ColumnName = st.Task!.BoardColumn != null ? st.Task!.BoardColumn!.Name : string.Empty,
                ColumnIsDone = st.Task!.BoardColumn != null && st.Task!.BoardColumn!.IsDone,
                IsCompleted = st.IsCompleted,
                ProjectId = st.Task!.BoardColumn != null ? st.Task!.BoardColumn!.ProjectId : Guid.Empty,
                ProjectName = st.Task!.BoardColumn != null && st.Task!.BoardColumn!.Project != null ? st.Task!.BoardColumn!.Project!.Name : string.Empty,
                TeamId = st.Task!.BoardColumn != null && st.Task!.BoardColumn!.Project != null ? st.Task!.BoardColumn!.Project!.TeamId : null,
                CreatedAt = st.CreatedAt,
                UpdatedAt = st.UpdatedAt,
                SubTasksCount = st.Task!.SubTasks.Count(s => s.DeletedAt == null),
                CompletedSubTasksCount = st.Task!.SubTasks.Count(s => s.IsCompleted && s.DeletedAt == null)
            })
            .ToListAsync(cancellationToken);

        // 2. Apply filters to query for page items
        var filteredQuery = baseQuery;

        if (!string.IsNullOrWhiteSpace(request.SearchQuery))
        {
            var search = request.SearchQuery.Trim().ToLower();
            filteredQuery = filteredQuery.Where(st => st.Title.ToLower().Contains(search) || 
                                                      (st.Task != null && st.Task.Title.ToLower().Contains(search)));
        }

        if (request.ProjectId.HasValue)
        {
            filteredQuery = filteredQuery.Where(st => st.Task != null && st.Task.BoardColumn != null && st.Task.BoardColumn.ProjectId == request.ProjectId.Value);
        }

        if (!string.IsNullOrWhiteSpace(request.Priority) && request.Priority != "all")
        {
            if (Enum.TryParse<SubTaskPriority>(request.Priority, true, out var parsedPriority))
            {
                filteredQuery = filteredQuery.Where(st => st.Priority == parsedPriority);
            }
        }

        if (!string.IsNullOrWhiteSpace(request.Status) && request.Status != "all")
        {
            bool isCompleted = request.Status == "completed";
            filteredQuery = filteredQuery.Where(st => st.IsCompleted == isCompleted);
        }

        if (!string.IsNullOrWhiteSpace(request.DueDateFilter) && request.DueDateFilter != "all")
        {
            var utcNow = DateTime.UtcNow;
            if (request.DueDateFilter == "overdue")
            {
                filteredQuery = filteredQuery.Where(st => !st.IsCompleted && st.DueDate != null && st.DueDate < utcNow);
            }
            else if (request.DueDateFilter == "upcoming7")
            {
                var sevenDaysLater = utcNow.AddDays(7);
                filteredQuery = filteredQuery.Where(st => !st.IsCompleted && st.DueDate != null && st.DueDate >= utcNow && st.DueDate <= sevenDaysLater);
            }
        }

        var totalCount = await filteredQuery.CountAsync(cancellationToken);

        // 3. Apply sorting
        if (!string.IsNullOrWhiteSpace(request.SortBy))
        {
            if (request.SortBy == "dueDate")
            {
                filteredQuery = filteredQuery.OrderBy(st => st.DueDate == null).ThenBy(st => st.DueDate);
            }
            else if (request.SortBy == "priority")
            {
                filteredQuery = filteredQuery.OrderBy(st => st.Priority == null).ThenByDescending(st => st.Priority);
            }
            else if (request.SortBy == "project")
            {
                filteredQuery = filteredQuery.OrderBy(st => st.Task != null && st.Task.BoardColumn != null && st.Task.BoardColumn.Project != null ? st.Task.BoardColumn.Project.Name : string.Empty);
            }
        }
        else
        {
            filteredQuery = filteredQuery.OrderBy(st => st.DueDate == null).ThenBy(st => st.DueDate);
        }

        // 4. Apply pagination
        var itemsQuery = filteredQuery;
        if (request.PageSize > 0)
        {
            var pageNumber = Math.Max(1, request.PageNumber);
            itemsQuery = filteredQuery.Skip((pageNumber - 1) * request.PageSize).Take(request.PageSize);
        }

        var items = await itemsQuery.Select(st => new MyTaskDto
        {
            Id = st.Id,
            ParentTaskId = st.TaskId,
            ParentTaskTitle = st.Task!.Title,
            Title = st.Title,
            Description = st.Task!.Description,
            Priority = st.Priority != null ? st.Priority.ToString() : null,
            StartDate = st.Task!.StartDate,
            DueDate = st.DueDate,
            BoardColumnId = st.Task!.BoardColumnId,
            ColumnName = st.Task!.BoardColumn != null ? st.Task!.BoardColumn!.Name : string.Empty,
            ColumnIsDone = st.Task!.BoardColumn != null && st.Task!.BoardColumn!.IsDone,
            IsCompleted = st.IsCompleted,
            ProjectId = st.Task!.BoardColumn != null ? st.Task!.BoardColumn!.ProjectId : Guid.Empty,
            ProjectName = st.Task!.BoardColumn != null && st.Task!.BoardColumn!.Project != null ? st.Task!.BoardColumn!.Project!.Name : string.Empty,
            TeamId = st.Task!.BoardColumn != null && st.Task!.BoardColumn!.Project != null ? st.Task!.BoardColumn!.Project!.TeamId : null,
            CreatedAt = st.CreatedAt,
            UpdatedAt = st.UpdatedAt,
            SubTasksCount = st.Task!.SubTasks.Count(s => s.DeletedAt == null),
            CompletedSubTasksCount = st.Task!.SubTasks.Count(s => s.IsCompleted && s.DeletedAt == null)
        }).ToListAsync(cancellationToken);

        return new MyTasksResponseDto
        {
            Items = items,
            TotalCount = totalCount,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize,
            TotalTasksCount = totalTasksCount,
            CompletedTasksCount = completedTasksCount,
            UncompletedTasksCount = uncompletedTasksCount,
            OverdueTasks = overdueTasks,
            TodayTasks = todayTasks
        };
    }
}
