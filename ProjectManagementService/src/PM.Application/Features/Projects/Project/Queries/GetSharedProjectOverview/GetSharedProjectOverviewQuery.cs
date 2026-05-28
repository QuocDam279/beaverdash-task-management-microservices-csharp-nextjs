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

    public GetSharedProjectOverviewQueryHandler(IPMDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<ProjectOverviewDto?> Handle(GetSharedProjectOverviewQuery request, CancellationToken cancellationToken)
    {
        var project = await _dbContext.Projects
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.ShareToken == request.ShareToken && p.IsPublic, cancellationToken);

        if (project == null) return null;

        // Fetch all board columns for this project
        var columns = await _dbContext.BoardColumns
            .AsNoTracking()
            .Where(c => c.ProjectId == project.Id)
            .Select(c => new { c.Id, c.Name, c.Position, c.IsDone })
            .ToListAsync(cancellationToken);

        var columnIds = columns.Select(c => c.Id).ToList();
        var doneColumnIds = columns.Where(c => c.IsDone).Select(c => c.Id).ToList();

        // Fetch all tasks in these columns (excluding deleted)
        var tasks = await _dbContext.TaskItems
            .AsNoTracking()
            .Include(t => t.SubTasks)
            .Where(t => columnIds.Contains(t.BoardColumnId) && t.DeletedAt == null)
            .ToListAsync(cancellationToken);

        var now = DateTime.UtcNow;
        var sevenDaysAgo = now.AddDays(-7);
        var sevenDaysFromNow = now.AddDays(7);

        // Compute metrics
        int totalTasks = tasks.Count;
        int completedCount = tasks.Count(t => doneColumnIds.Contains(t.BoardColumnId) && (t.CompletedAt ?? t.UpdatedAt) >= sevenDaysAgo);
        int newCount = tasks.Count(t => t.CreatedAt >= sevenDaysAgo);
        int upcomingDueCount = tasks.Count(t => !doneColumnIds.Contains(t.BoardColumnId) && t.DueDate != null && t.DueDate >= now && t.DueDate <= sevenDaysFromNow);

        // Status counts based on column names/positions
        int todoCount = 0;
        int inProgressCount = 0;
        int inReviewCount = 0;
        int doneCount = 0;

        foreach (var col in columns)
        {
            var colNameLower = col.Name.ToLower();
            var colTasksCount = tasks.Count(t => t.BoardColumnId == col.Id);

            if (col.IsDone)
            {
                doneCount += colTasksCount;
            }
            else if (colNameLower.Contains("todo") || colNameLower.Contains("cần làm") || colNameLower.Contains("to do"))
            {
                todoCount += colTasksCount;
            }
            else if (colNameLower.Contains("progress") || colNameLower.Contains("đang làm") || colNameLower.Contains("in progress"))
            {
                inProgressCount += colTasksCount;
            }
            else if (colNameLower.Contains("review") || colNameLower.Contains("đang duyệt") || colNameLower.Contains("in review"))
            {
                inReviewCount += colTasksCount;
            }
            else
            {
                // Fallback: Map by Position
                if (col.Position == 1) todoCount += colTasksCount;
                else if (col.Position == 2) inProgressCount += colTasksCount;
                else if (col.Position == 3) inReviewCount += colTasksCount;
                else doneCount += colTasksCount;
            }
        }

        var columnStatusCounts = columns.Select(col => new ColumnStatusCountDto
        {
            ColumnId = col.Id,
            ColumnName = col.Name,
            TaskCount = tasks.Count(t => t.BoardColumnId == col.Id),
            IsDone = col.IsDone,
            Position = col.Position
        }).OrderBy(c => c.Position).ToList();

        // Priority counts
        int requiredCount = tasks.Count(t => t.Priority == TaskPriority.Required);
        int importantCount = tasks.Count(t => t.Priority == TaskPriority.Important);
        int extendedCount = tasks.Count(t => t.Priority == TaskPriority.Extended);

        // Compute member workloads
        var memberWorkloads = new List<MemberWorkloadDto>();
        int totalSubTasks = tasks.SelectMany(t => t.SubTasks).Count(st => st.DeletedAt == null);

        if (project.TeamId.HasValue)
        {
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
        }
        else
        {
            var owner = await _dbContext.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == project.CreatedByUserId, cancellationToken);

            if (owner != null)
            {
                int assignedCount = tasks.SelectMany(t => t.SubTasks).Count(st => st.AssigneeUserId == owner.Id && st.DeletedAt == null);
                int workloadPct = totalSubTasks > 0 ? (int)Math.Round((double)assignedCount / totalSubTasks * 100) : 0;

                memberWorkloads.Add(new MemberWorkloadDto
                {
                    UserId = owner.Id,
                    DisplayName = owner.DisplayName,
                    Avatar = owner.Avatar,
                    Role = "Chủ sở hữu",
                    AssignedTasksCount = assignedCount,
                    WorkloadPercentage = workloadPct
                });
            }
        }

        memberWorkloads = memberWorkloads.OrderByDescending(w => w.AssignedTasksCount).ToList();

        return new ProjectOverviewDto
        {
            Id = project.Id,
            Name = project.Name,
            Description = project.Description,
            Status = project.Status.ToVietnameseString(),
            StartDate = project.StartDate,
            DueDate = project.DueDate,
            TeamId = project.TeamId,
            CreatedByUserId = project.CreatedByUserId,
            CreatedAt = project.CreatedAt,
            IsPublic = project.IsPublic,
            ShareToken = project.ShareToken,

            TotalTasksCount = totalTasks,
            CompletedTasksCount = completedCount,
            NewTasksCount = newCount,
            UpcomingDueTasksCount = upcomingDueCount,

            TodoTasksCount = todoCount,
            InProgressTasksCount = inProgressCount,
            InReviewTasksCount = inReviewCount,
            DoneTasksCount = doneCount,

            ColumnStatusCounts = columnStatusCounts,

            RequiredPriorityCount = requiredCount,
            ImportantPriorityCount = importantCount,
            ExtendedPriorityCount = extendedCount,

            MemberWorkloads = memberWorkloads
        };
    }
}
