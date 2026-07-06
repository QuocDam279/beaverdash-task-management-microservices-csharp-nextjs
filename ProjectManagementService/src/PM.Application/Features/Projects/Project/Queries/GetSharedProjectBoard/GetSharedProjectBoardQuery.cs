using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using PM.Application.Features.Projects.Project.Queries.GetProjectBoard;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Projects.Project.Queries.GetSharedProjectBoard;

public record GetSharedProjectBoardQuery(string ShareToken, Guid? SprintId = null) : IRequest<ProjectBoardDto?>;

public class GetSharedProjectBoardQueryHandler : IRequestHandler<GetSharedProjectBoardQuery, ProjectBoardDto?>
{
    private readonly IPMDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;

    public GetSharedProjectBoardQueryHandler(IPMDbContext dbContext, ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
    }

    public async Task<ProjectBoardDto?> Handle(GetSharedProjectBoardQuery request, CancellationToken cancellationToken)
    {
        // 1. Lấy thông tin cơ bản của Project qua ShareToken
        var projectInfo = await SharedProjectAccessHelper.GetSharedProjectAndVerifyAccessAsync(
            _dbContext,
            _currentUserService,
            request.ShareToken,
            cancellationToken);

        if (projectInfo == null)
            return null;

        // 2. Xác định Sprint lọc
        var activeSprint = await _dbContext.Sprints
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.ProjectId == projectInfo.Id && s.Status == PM.Domain.Enums.SprintStatus.Active, cancellationToken);
        
        var activeSprintId = activeSprint?.Id;

        bool filterByNullSprint = false;
        Guid? targetSprintId = null;

        if (request.SprintId.HasValue)
        {
            if (request.SprintId.Value == Guid.Empty)
            {
                filterByNullSprint = true;
            }
            else
            {
                targetSprintId = request.SprintId.Value;
            }
        }
        else
        {
            if (activeSprintId.HasValue)
            {
                targetSprintId = activeSprintId.Value;
            }
            else
            {
                targetSprintId = Guid.Empty;
            }
        }

        // Lấy danh sách tất cả các Sprint trong dự án để hiển thị ở Dropdown bộ lọc
        var allSprints = await _dbContext.Sprints
            .AsNoTracking()
            .Where(s => s.ProjectId == projectInfo.Id)
            .OrderByDescending(s => s.Status == PM.Domain.Enums.SprintStatus.Active)
            .ThenByDescending(s => s.Status == PM.Domain.Enums.SprintStatus.Future)
            .ThenByDescending(s => s.CreatedAt)
            .Select(s => new SprintLookupDto
            {
                Id = s.Id,
                Name = s.Name,
                Status = s.Status.ToString(),
                Goal = s.Goal,
                StartDate = s.StartDate,
                EndDate = s.EndDate
            })
            .ToListAsync(cancellationToken);

        // 3. Thực hiện truy vấn Board Columns và Task Items trực tiếp qua Database Projection Select
        var columns = await _dbContext.BoardColumns
            .AsNoTracking()
            .Where(c => c.ProjectId == projectInfo.Id)
            .OrderBy(c => c.Position)
            .Select(c => new BoardColumnDto
            {
                Id = c.Id,
                ProjectId = c.ProjectId,
                Name = c.Name,
                Position = c.Position,
                WipLimit = c.WipLimit,
                IsDone = c.IsDone,
                TaskItems = c.TaskItems
                    .Where(t => t.DeletedAt == null && (filterByNullSprint ? t.SprintId == null : t.SprintId == targetSprintId))
                    .OrderBy(t => t.SortOrder)
                    .Select(t => new TaskItemDto
                    {
                        Id = t.Id,
                        BoardColumnId = t.BoardColumnId,
                        Title = t.Title,
                        Priority = t.Priority != null ? t.Priority.ToString() : null,
                        SortOrder = t.SortOrder,
                        Description = t.Description,
                        StartDate = t.StartDate,
                        DueDate = t.DueDate,
                        SubTasksCount = t.SubTasks.Count(st => st.DeletedAt == null),
                        CompletedSubTasksCount = t.SubTasks.Count(st => st.IsCompleted && st.DeletedAt == null),
                        CommentsCount = t.SubTasks.Where(st => st.DeletedAt == null).SelectMany(st => st.Comments).Count(),
                        SubTasks = t.SubTasks.Where(st => st.DeletedAt == null).Select(st => new SubTaskBoardDto
                        {
                            Id = st.Id,
                            TaskId = st.TaskId,
                            Title = st.Title,
                            IsCompleted = st.IsCompleted,
                            DueDate = st.DueDate,
                            AssigneeUserId = st.AssigneeUserId,
                            AssigneeAvatar = st.AssigneeUser != null ? st.AssigneeUser.Avatar : null,
                            AssigneeName = st.AssigneeUser != null ? st.AssigneeUser.DisplayName : null,
                            Priority = st.Priority != null ? st.Priority.ToString() : null
                        }).ToList()
                    }).ToList()
            }).ToListAsync(cancellationToken);

        return new ProjectBoardDto
        {
            Id = projectInfo.Id,
            Name = projectInfo.Name,
            Description = projectInfo.Description,
            BoardColumns = columns,
            ActiveSprintId = activeSprintId,
            ActiveSprintName = activeSprint?.Name,
            ActiveSprintEndDate = activeSprint?.EndDate,
            Sprints = allSprints
        };
    }
}
