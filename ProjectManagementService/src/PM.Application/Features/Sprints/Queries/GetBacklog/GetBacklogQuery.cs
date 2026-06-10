using MediatR;
using PM.Application.Contracts;
using PM.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Sprints.Queries.GetBacklog;

public record GetBacklogQuery(Guid ProjectId) : IRequest<BacklogDto>;

public class GetBacklogQueryHandler : IRequestHandler<GetBacklogQuery, BacklogDto>
{
    private readonly IPMDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;

    public GetBacklogQueryHandler(IPMDbContext dbContext, ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
    }

    public async Task<BacklogDto> Handle(GetBacklogQuery request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("Bạn chưa đăng nhập.");

        // 1. Kiểm tra Project tồn tại và quyền truy cập
        var projectInfo = await _dbContext.Projects
            .AsNoTracking()
            .Select(p => new { p.Id, p.TeamId, p.IsPublic })
            .FirstOrDefaultAsync(p => p.Id == request.ProjectId, cancellationToken);

        if (projectInfo == null)
            throw new InvalidOperationException("Project không tồn tại.");

        if (!projectInfo.IsPublic)
        {
            if (!projectInfo.TeamId.HasValue)
            {
                throw new UnauthorizedAccessException("Bạn không có quyền xem Backlog của Project này.");
            }

            var isMember = await _dbContext.TeamMembers.AnyAsync(
                tm => tm.TeamId == projectInfo.TeamId.Value && tm.UserId == currentUserId, 
                cancellationToken);

            if (!isMember)
                throw new UnauthorizedAccessException("Bạn không có quyền xem Backlog của Project này.");
        }

        // 2. Lấy danh sách Sprints (Future + Active)
        var sprints = await _dbContext.Sprints
            .AsNoTracking()
            .Where(s => s.ProjectId == request.ProjectId && s.Status != SprintStatus.Closed)
            .OrderByDescending(s => s.Status == SprintStatus.Active)
            .ThenBy(s => s.CreatedAt)
            .Select(s => new SprintDto
            {
                Id = s.Id,
                ProjectId = s.ProjectId,
                Name = s.Name,
                Goal = s.Goal,
                Status = s.Status.ToString(),
                StartDate = s.StartDate,
                EndDate = s.EndDate,
                CreatedAt = s.CreatedAt,
                TaskCount = s.TaskItems.Count(),
                CompletedTaskCount = s.TaskItems.Count(t => t.BoardColumn != null && t.BoardColumn.IsDone),
                Tasks = s.TaskItems
                    .OrderBy(t => t.SortOrder)
                    .Select(t => new BacklogTaskDto
                    {
                        Id = t.Id,
                        Title = t.Title,
                        Priority = t.Priority != null ? t.Priority.ToString() : null,
                        StartDate = t.StartDate,
                        DueDate = t.DueDate,
                        BoardColumnId = t.BoardColumnId,
                        ColumnName = t.BoardColumn != null ? t.BoardColumn.Name : "",
                        SubTasksCount = t.SubTasks.Count(st => st.DeletedAt == null),
                        CompletedSubTasksCount = t.SubTasks.Count(st => st.IsCompleted && st.DeletedAt == null)
                    }).ToList()
            })
            .ToListAsync(cancellationToken);

        // 3. Lấy danh sách Tasks trong Product Backlog (SprintId == null)
        var backlogTasks = await _dbContext.TaskItems
            .AsNoTracking()
            .Where(t => t.BoardColumn != null && t.BoardColumn.ProjectId == request.ProjectId && t.SprintId == null)
            .OrderBy(t => t.SortOrder)
            .Select(t => new BacklogTaskDto
            {
                Id = t.Id,
                Title = t.Title,
                Priority = t.Priority != null ? t.Priority.ToString() : null,
                StartDate = t.StartDate,
                DueDate = t.DueDate,
                BoardColumnId = t.BoardColumnId,
                ColumnName = t.BoardColumn != null ? t.BoardColumn.Name : "",
                SubTasksCount = t.SubTasks.Count(st => st.DeletedAt == null),
                CompletedSubTasksCount = t.SubTasks.Count(st => st.IsCompleted && st.DeletedAt == null)
            })
            .ToListAsync(cancellationToken);

        return new BacklogDto
        {
            Sprints = sprints,
            BacklogTasks = backlogTasks
        };
    }
}
