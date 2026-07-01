using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using PM.Domain.Enums;
using PM.Domain.Entities;
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
    public int InactiveTasksCount { get; set; }
    public List<MyTaskDto> OverdueTasks { get; set; } = new();
    public List<MyTaskDto> TodayTasks { get; set; } = new();
    public List<MyTaskDto> UpcomingTasks { get; set; } = new();
    public List<MyTaskDto> UrgentTasks { get; set; } = new();
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
    public string? SprintFilter { get; init; } = "active";
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

        var activeQuery = _dbContext.SubTasks
            .AsNoTracking()
            .Where(st => st.DeletedAt == null && 
                         st.AssigneeUserId == currentUserId && 
                         st.Task != null &&
                         st.Task.Sprint != null && 
                         st.Task.Sprint.Status == SprintStatus.Active &&
                         st.Task.BoardColumn != null &&
                         st.Task.BoardColumn.Project!.TeamId.HasValue &&
                         myTeamIds.Contains(st.Task.BoardColumn.Project.TeamId.Value));

        var backlogQuery = _dbContext.SubTasks
            .AsNoTracking()
            .Where(st => st.DeletedAt == null && 
                         st.AssigneeUserId == currentUserId && 
                         st.Task != null &&
                         (st.Task.Sprint == null || st.Task.Sprint.Status != SprintStatus.Closed) &&
                         st.Task.BoardColumn != null &&
                         st.Task.BoardColumn.Project!.TeamId.HasValue &&
                         myTeamIds.Contains(st.Task.BoardColumn.Project.TeamId.Value));

        var baseQuery = request.SprintFilter == "all" 
            ? backlogQuery 
            : request.SprintFilter == "inactive"
                ? backlogQuery.Where(st => st.Task!.Sprint == null || st.Task!.Sprint!.Status == SprintStatus.Future)
                : activeQuery;

        // 1. Calculate stats on all tasks assigned to the user
        var completedTasksCount = await activeQuery.CountAsync(st => st.IsCompleted, cancellationToken);
        var uncompletedTasksCount = await activeQuery.CountAsync(st => !st.IsCompleted, cancellationToken);
        var inactiveTasksCount = await backlogQuery.CountAsync(st => st.Task!.Sprint == null || st.Task!.Sprint!.Status == SprintStatus.Future, cancellationToken);
        var totalTasksCount = completedTasksCount + uncompletedTasksCount + inactiveTasksCount;

        Console.WriteLine($"[DIAGNOSTIC] request.SprintFilter received: '{request.SprintFilter}'");
        Console.WriteLine($"[DIAGNOSTIC] completedTasksCount: {completedTasksCount}");
        Console.WriteLine($"[DIAGNOSTIC] uncompletedTasksCount: {uncompletedTasksCount}");
        Console.WriteLine($"[DIAGNOSTIC] inactiveTasksCount: {inactiveTasksCount}");
        Console.WriteLine($"[DIAGNOSTIC] totalTasksCount: {totalTasksCount}");
        Console.WriteLine($"[DIAGNOSTIC] baseQuery count: {await baseQuery.CountAsync(cancellationToken)}");
        
        var diagInactiveItems = await backlogQuery
            .Where(st => st.Task!.Sprint == null || st.Task!.Sprint!.Status == SprintStatus.Future)
            .Select(st => new { st.Id, st.Title, SprintName = st.Task!.Sprint != null ? st.Task!.Sprint!.Name : "Null", IsCompleted = st.IsCompleted })
            .ToListAsync(cancellationToken);
            
        Console.WriteLine($"[DIAGNOSTIC] Database inactive subtasks ({diagInactiveItems.Count}):");
        foreach (var item in diagInactiveItems)
        {
            Console.WriteLine($"  - {item.Id}: {item.Title} (Sprint: {item.SprintName}, Completed: {item.IsCompleted})");
        }

        var todayStart = DateTime.UtcNow.Date;
        var todayEnd = todayStart.AddDays(1).AddTicks(-1);
        var upcomingEnd = todayStart.AddDays(4).AddTicks(-1); // next 72 hours

        var projectToDto = (IQueryable<SubTask> q) => q.Select(st => new MyTaskDto
        {
            Id = st.Id,
            ParentTaskId = st.TaskId,
            ParentTaskTitle = st.Task!.Title,
            Title = st.Title,
            Description = st.Task!.Description,
            Priority = st.Task!.Priority != null ? st.Task!.Priority.ToString() : null,
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
        });

        var overdueTasks = await projectToDto(activeQuery
            .Where(st => !st.IsCompleted && st.DueDate != null && st.DueDate < todayStart)
            .OrderBy(st => st.DueDate))
            .ToListAsync(cancellationToken);

        var todayTasks = await projectToDto(activeQuery
            .Where(st => !st.IsCompleted && st.DueDate != null && st.DueDate >= todayStart && st.DueDate <= todayEnd)
            .OrderBy(st => st.DueDate))
            .ToListAsync(cancellationToken);

        var upcomingTasks = await projectToDto(activeQuery
            .Where(st => !st.IsCompleted && st.DueDate != null && st.DueDate > todayEnd && st.DueDate <= upcomingEnd)
            .OrderBy(st => st.DueDate))
            .ToListAsync(cancellationToken);

        var urgentTasks = await projectToDto(activeQuery
            .Where(st => !st.IsCompleted && 
                         st.Task != null && 
                         st.Task.Priority != null && 
                         (st.Task.Priority == TaskPriority.Required || st.Task.Priority == TaskPriority.Important) &&
                         (st.DueDate == null || st.DueDate > upcomingEnd))
            .OrderBy(st => st.Task!.Priority == TaskPriority.Required ? 0 : 1)
            .ThenBy(st => st.DueDate))
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
            if (Enum.TryParse<TaskPriority>(request.Priority, true, out var parsedPriority))
            {
                filteredQuery = filteredQuery.Where(st => st.Task != null && st.Task.Priority == parsedPriority);
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
                filteredQuery = filteredQuery.OrderBy(st => st.Task == null || st.Task.Priority == null)
                                             .ThenBy(st => st.Task!.Priority == TaskPriority.Required ? 0 : st.Task!.Priority == TaskPriority.Important ? 1 : 2);
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

        var items = await projectToDto(itemsQuery).ToListAsync(cancellationToken);

        return new MyTasksResponseDto
        {
            Items = items,
            TotalCount = totalCount,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize,
            TotalTasksCount = totalTasksCount,
            CompletedTasksCount = completedTasksCount,
            UncompletedTasksCount = uncompletedTasksCount,
            InactiveTasksCount = inactiveTasksCount,
            OverdueTasks = overdueTasks,
            TodayTasks = todayTasks,
            UpcomingTasks = upcomingTasks,
            UrgentTasks = urgentTasks
        };
    }
}
