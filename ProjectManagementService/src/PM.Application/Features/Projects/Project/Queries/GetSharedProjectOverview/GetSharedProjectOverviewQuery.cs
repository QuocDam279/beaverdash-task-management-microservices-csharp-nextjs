using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using PM.Domain.Enums;
using PM.Application.Features.Projects.Project.Queries.GetProjectOverview;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Projects.Project.Queries.GetSharedProjectOverview;

public record GetSharedProjectOverviewQuery(string ShareToken) : IRequest<ProjectOverviewDto?>;

public class GetSharedProjectOverviewQueryHandler : IRequestHandler<GetSharedProjectOverviewQuery, ProjectOverviewDto?>
{
    private readonly IPMDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;

    public GetSharedProjectOverviewQueryHandler(IPMDbContext dbContext, ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
    }

    public async Task<ProjectOverviewDto?> Handle(GetSharedProjectOverviewQuery request, CancellationToken cancellationToken)
    {
        var project = await SharedProjectAccessHelper.GetSharedProjectAndVerifyAccessAsync(
            _dbContext,
            _currentUserService,
            request.ShareToken,
            cancellationToken);

        if (project == null) return null;

        // Fetch all board columns for this project
        var columns = await _dbContext.BoardColumns
            .AsNoTracking()
            .Where(c => c.ProjectId == project.Id)
            .Select(c => new { c.Id, c.Name, c.Position, c.IsDone })
            .ToListAsync(cancellationToken);

        var doneColumnIds = columns.Where(c => c.IsDone).Select(c => c.Id).ToList();

        // Fetch the active sprint of the project
        var activeSprint = await _dbContext.Sprints
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.ProjectId == project.Id && s.Status == SprintStatus.Active, cancellationToken);

        List<PM.Domain.Entities.TaskItem> tasks;
        if (activeSprint != null)
        {
            // Fetch tasks belonging to the active sprint
            tasks = await _dbContext.TaskItems
                .AsNoTracking()
                .Include(t => t.SubTasks)
                .Where(t => t.BoardColumn != null && 
                             t.BoardColumn.ProjectId == project.Id && 
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
