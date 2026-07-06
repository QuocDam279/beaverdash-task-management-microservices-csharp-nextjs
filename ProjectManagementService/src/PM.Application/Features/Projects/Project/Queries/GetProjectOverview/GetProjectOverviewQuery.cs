using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using PM.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Projects.Project.Queries.GetProjectOverview;

public class MemberWorkloadDto
{
    public Guid UserId { get; set; }
    public string DisplayName { get; set; } = null!;
    public string? Avatar { get; set; }
    public string Role { get; set; } = null!;
    public int AssignedTasksCount { get; set; }
    public int WorkloadPercentage { get; set; }
}

public class ColumnStatusDto
{
    public Guid ColumnId { get; set; }
    public string ColumnName { get; set; } = null!;
    public int TasksCount { get; set; }
    public int SubTasksCount { get; set; }
    public int Position { get; set; }
    public bool IsDone { get; set; }
}

public class ProjectOverviewDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? DueDate { get; set; }
    public Guid? TeamId { get; set; }
    public string? TeamName { get; set; }
    public Guid CreatedByUserId { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsPublic { get; set; }
    public string? ShareToken { get; set; }

    // Metrics (7 days)
    public int CompletedTasksCount { get; set; }
    public int NewTasksCount { get; set; }
    public int UpcomingDueTasksCount { get; set; }

    public int CompletedTasksSubTasksTotal { get; set; }
    public int CompletedTasksSubTasksDone { get; set; }
    public int NewTasksSubTasksTotal { get; set; }
    public int NewTasksSubTasksDone { get; set; }
    public int UpcomingDueTasksSubTasksTotal { get; set; }
    public int UpcomingDueTasksSubTasksDone { get; set; }

    // Subtask Status Counts
    public int TodoSubTasksCount { get; set; }
    public int InProgressSubTasksCount { get; set; }
    public int DoneSubTasksCount { get; set; }

    // Subtask Priority Breakdown inside Parent Priorities
    public int RequiredSubTasksHighCount { get; set; }
    public int RequiredSubTasksMediumCount { get; set; }
    public int RequiredSubTasksLowCount { get; set; }

    public int ImportantSubTasksHighCount { get; set; }
    public int ImportantSubTasksMediumCount { get; set; }
    public int ImportantSubTasksLowCount { get; set; }

    public int ExtendedSubTasksHighCount { get; set; }
    public int ExtendedSubTasksMediumCount { get; set; }
    public int ExtendedSubTasksLowCount { get; set; }

    // Workload list
    public List<MemberWorkloadDto> MemberWorkloads { get; set; } = new();

    // Column stats list
    public List<ColumnStatusDto> ColumnStatusStats { get; set; } = new();
}

public record GetProjectOverviewQuery(Guid ProjectId) : IRequest<ProjectOverviewDto?>;

public class GetProjectOverviewQueryHandler : IRequestHandler<GetProjectOverviewQuery, ProjectOverviewDto?>
{
    private readonly IPMDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;

    public GetProjectOverviewQueryHandler(IPMDbContext dbContext, ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
    }

    public async Task<ProjectOverviewDto?> Handle(GetProjectOverviewQuery request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("Bạn chưa đăng nhập.");

        var project = await _dbContext.Projects
            .AsNoTracking()
            .Include(p => p.Team)
            .FirstOrDefaultAsync(p => p.Id == request.ProjectId, cancellationToken);

        if (project == null) return null;

        // Authorization check
        if (!project.IsPublic)
        {
            if (!project.TeamId.HasValue)
            {
                throw new UnauthorizedAccessException("Bạn không có quyền xem thông tin dự án này.");
            }

            var isMember = await _dbContext.TeamMembers.AnyAsync(tm => tm.TeamId == project.TeamId.Value && tm.UserId == currentUserId, cancellationToken);
            if (!isMember)
                throw new UnauthorizedAccessException("Bạn không có quyền xem thông tin dự án này.");
        }

        // Fetch all board columns for this project
        var columns = await _dbContext.BoardColumns
            .AsNoTracking()
            .Where(c => c.ProjectId == request.ProjectId)
            .Select(c => new { c.Id, c.Name, c.Position, c.IsDone })
            .ToListAsync(cancellationToken);

        var doneColumnIds = columns.Where(c => c.IsDone).Select(c => c.Id).ToList();

        // Fetch the active sprint of the project
        var activeSprint = await _dbContext.Sprints
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.ProjectId == request.ProjectId && s.Status == SprintStatus.Active, cancellationToken);

        List<PM.Domain.Entities.TaskItem> tasks;
        if (activeSprint != null)
        {
            // Fetch tasks belonging to the active sprint
            tasks = await _dbContext.TaskItems
                .AsNoTracking()
                .Include(t => t.SubTasks)
                .Where(t => t.BoardColumn != null && 
                             t.BoardColumn.ProjectId == request.ProjectId && 
                             t.DeletedAt == null &&
                             t.SprintId == activeSprint.Id)
                .ToListAsync(cancellationToken);
        }
        else
        {
            tasks = new List<PM.Domain.Entities.TaskItem>();
        }

        var now = DateTime.UtcNow;
        var sevenDaysAgo = now.AddDays(-7);
        var sevenDaysFromNow = now.AddDays(7);

        // Compute metrics
        var completedTasks = tasks.Where(t => doneColumnIds.Contains(t.BoardColumnId) && (t.CompletedAt ?? t.UpdatedAt) >= sevenDaysAgo).ToList();
        var newTasks = tasks.Where(t => t.CreatedAt >= sevenDaysAgo).ToList();
        var upcomingDueTasks = tasks.Where(t => !doneColumnIds.Contains(t.BoardColumnId) && t.DueDate != null && t.DueDate >= now && t.DueDate <= sevenDaysFromNow).ToList();

        int completedCount = completedTasks.Count;
        int newCount = newTasks.Count;
        int upcomingDueCount = upcomingDueTasks.Count;

        int completedTasksSubTasksTotal = completedTasks.SelectMany(t => t.SubTasks).Count(s => s.DeletedAt == null);
        int completedTasksSubTasksDone = completedTasks.SelectMany(t => t.SubTasks).Count(s => s.DeletedAt == null && s.IsCompleted);

        int newTasksSubTasksTotal = newTasks.SelectMany(t => t.SubTasks).Count(s => s.DeletedAt == null);
        int newTasksSubTasksDone = newTasks.SelectMany(t => t.SubTasks).Count(s => s.DeletedAt == null && s.IsCompleted);

        int upcomingDueTasksSubTasksTotal = upcomingDueTasks.SelectMany(t => t.SubTasks).Count(s => s.DeletedAt == null);
        int upcomingDueTasksSubTasksDone = upcomingDueTasks.SelectMany(t => t.SubTasks).Count(s => s.DeletedAt == null && s.IsCompleted);

        // Subtask Status Counts & Priority Breakdown inside Parent Priorities
        int todoSubTasksCount = 0;
        int inProgressSubTasksCount = 0;
        int doneSubTasksCount = 0;

        int reqHigh = 0, reqMed = 0, reqLow = 0;
        int impHigh = 0, impMed = 0, impLow = 0;
        int extHigh = 0, extMed = 0, extLow = 0;

        foreach (var task in tasks)
        {
            var col = columns.FirstOrDefault(c => c.Id == task.BoardColumnId);
            if (col == null) continue;

            var colNameLower = col.Name.ToLower();
            bool isTodoColumn = colNameLower.Contains("todo") || colNameLower.Contains("cần làm") || colNameLower.Contains("to do") || col.Position == 1;

            foreach (var st in task.SubTasks.Where(s => s.DeletedAt == null))
            {
                // Status counts
                if (st.IsCompleted)
                {
                    doneSubTasksCount++;
                }
                else if (isTodoColumn)
                {
                    todoSubTasksCount++;
                }
                else
                {
                    inProgressSubTasksCount++;
                }

                // Priority breakdown
                var stPrio = st.Priority;
                if (task.Priority == TaskPriority.Required)
                {
                    if (stPrio == SubTaskPriority.High) reqHigh++;
                    else if (stPrio == SubTaskPriority.Medium) reqMed++;
                    else reqLow++;
                }
                else if (task.Priority == TaskPriority.Important)
                {
                    if (stPrio == SubTaskPriority.High) impHigh++;
                    else if (stPrio == SubTaskPriority.Medium) impMed++;
                    else impLow++;
                }
                else if (task.Priority == TaskPriority.Extended)
                {
                    if (stPrio == SubTaskPriority.High) extHigh++;
                    else if (stPrio == SubTaskPriority.Medium) extMed++;
                    else extLow++;
                }
            }
        }

        // Compute member workloads
        var memberWorkloads = new List<MemberWorkloadDto>();
        int totalSubTasks = tasks.SelectMany(t => t.SubTasks).Count(st => st.DeletedAt == null);

        if (!project.TeamId.HasValue)
        {
            throw new InvalidOperationException("Dự án không hợp lệ.");
        }

        var teamMembers = await _dbContext.TeamMembers
            .AsNoTracking()
            .Include(tm => tm.User)
            .Where(tm => tm.TeamId == project.TeamId.Value)
            .ToListAsync(cancellationToken);

        foreach (var tm in teamMembers)
        {
            int assignedCount = tasks.SelectMany(t => t.SubTasks).Count(st => st.AssigneeUserId == tm.UserId && st.DeletedAt == null);
            int workloadPct = totalSubTasks > 0 ? (int)Math.Round((double)assignedCount / totalSubTasks * 100) : 0;

            memberWorkloads.Add(new MemberWorkloadDto
            {
                UserId = tm.UserId,
                DisplayName = tm.User?.DisplayName ?? "Unknown Member",
                Avatar = tm.User?.Avatar,
                Role = tm.Role == "Owner" || tm.Role == "leader" ? "Trưởng nhóm" : "Thành viên",
                AssignedTasksCount = assignedCount,
                WorkloadPercentage = workloadPct
            });
        }

        memberWorkloads = memberWorkloads.OrderByDescending(w => w.AssignedTasksCount).ToList();

        var columnStatusStats = columns
            .OrderBy(c => c.Position)
            .Select(c => new ColumnStatusDto
            {
                ColumnId = c.Id,
                ColumnName = c.Name,
                TasksCount = tasks.Count(t => t.BoardColumnId == c.Id),
                SubTasksCount = tasks.Where(t => t.BoardColumnId == c.Id).SelectMany(t => t.SubTasks).Count(st => st.DeletedAt == null),
                Position = c.Position,
                IsDone = c.IsDone
            })
            .ToList();

        return new ProjectOverviewDto
        {
            Id = project.Id,
            Name = project.Name,
            Description = project.Description,
            StartDate = project.StartDate,
            DueDate = project.DueDate,
            TeamId = project.TeamId,
            TeamName = project.Team?.Name,
            CreatedByUserId = project.CreatedByUserId,
            CreatedAt = project.CreatedAt,
            IsPublic = project.IsPublic,
            ShareToken = project.ShareToken,

            CompletedTasksCount = completedCount,
            NewTasksCount = newCount,
            UpcomingDueTasksCount = upcomingDueCount,

            CompletedTasksSubTasksTotal = completedTasksSubTasksTotal,
            CompletedTasksSubTasksDone = completedTasksSubTasksDone,
            NewTasksSubTasksTotal = newTasksSubTasksTotal,
            NewTasksSubTasksDone = newTasksSubTasksDone,
            UpcomingDueTasksSubTasksTotal = upcomingDueTasksSubTasksTotal,
            UpcomingDueTasksSubTasksDone = upcomingDueTasksSubTasksDone,

            TodoSubTasksCount = todoSubTasksCount,
            InProgressSubTasksCount = inProgressSubTasksCount,
            DoneSubTasksCount = doneSubTasksCount,

            RequiredSubTasksHighCount = reqHigh,
            RequiredSubTasksMediumCount = reqMed,
            RequiredSubTasksLowCount = reqLow,

            ImportantSubTasksHighCount = impHigh,
            ImportantSubTasksMediumCount = impMed,
            ImportantSubTasksLowCount = impLow,

            ExtendedSubTasksHighCount = extHigh,
            ExtendedSubTasksMediumCount = extMed,
            ExtendedSubTasksLowCount = extLow,

            MemberWorkloads = memberWorkloads,
            ColumnStatusStats = columnStatusStats
        };
    }
}
