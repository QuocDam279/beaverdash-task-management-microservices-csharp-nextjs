using MediatR;
using PM.Application.Contracts;
using PM.Application.Features.Sprints.Queries.GetBacklog;
using PM.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Sprints.Queries.GetSprintById;

public record GetSprintByIdQuery(Guid SprintId) : IRequest<SprintDetailDto?>;

public class GetSprintByIdQueryHandler : IRequestHandler<GetSprintByIdQuery, SprintDetailDto?>
{
    private readonly IPMDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;

    public GetSprintByIdQueryHandler(IPMDbContext dbContext, ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
    }

    public async Task<SprintDetailDto?> Handle(GetSprintByIdQuery request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("Bạn chưa đăng nhập.");

        // 1. Lấy Sprint cùng thông tin Project để check quyền
        var sprint = await _dbContext.Sprints
            .AsNoTracking()
            .Include(s => s.Project)
            .FirstOrDefaultAsync(s => s.Id == request.SprintId, cancellationToken);

        if (sprint == null)
            return null;

        var project = sprint.Project;
        if (project == null)
            throw new InvalidOperationException("Project của Sprint không tồn tại.");

        if (!project.IsPublic)
        {
            if (!project.TeamId.HasValue)
            {
                throw new UnauthorizedAccessException("Bạn không có quyền xem Sprint này.");
            }

            var isMember = await _dbContext.TeamMembers.AnyAsync(
                tm => tm.TeamId == project.TeamId.Value && tm.UserId == currentUserId, 
                cancellationToken);

            if (!isMember)
                throw new UnauthorizedAccessException("Bạn không có quyền xem Sprint này.");
        }

        // 2. Lấy chi tiết các Task thuộc Sprint này
        var tasks = await _dbContext.TaskItems
            .AsNoTracking()
            .Where(t => t.SprintId == request.SprintId)
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

        return new SprintDetailDto
        {
            Id = sprint.Id,
            ProjectId = sprint.ProjectId,
            Name = sprint.Name,
            Goal = sprint.Goal,
            Status = sprint.Status.ToString(),
            StartDate = sprint.StartDate,
            EndDate = sprint.EndDate,
            CreatedAt = sprint.CreatedAt,
            UpdatedAt = sprint.UpdatedAt,
            TaskCount = tasks.Count,
            CompletedTaskCount = tasks.Count(t => _dbContext.BoardColumns.Any(bc => bc.Id == t.BoardColumnId && bc.IsDone)),
            Tasks = tasks
        };
    }
}
