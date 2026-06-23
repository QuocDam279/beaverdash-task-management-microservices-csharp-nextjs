using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Projects.Project.Queries.GetProjectBoard;

public record GetProjectBoardQuery(Guid ProjectId, Guid? SprintId = null) : IRequest<ProjectBoardDto?>;

public class GetProjectBoardQueryHandler : IRequestHandler<GetProjectBoardQuery, ProjectBoardDto?>
{
    private readonly IPMDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;

    public GetProjectBoardQueryHandler(IPMDbContext dbContext, ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
    }

    public async Task<ProjectBoardDto?> Handle(GetProjectBoardQuery request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("Bạn chưa đăng nhập.");

        // 1. Lấy thông tin cơ bản của Project để check quyền
        var projectInfo = await _dbContext.Projects
            .AsNoTracking()
            .Select(p => new { p.Id, p.Name, p.Description, p.TeamId, p.IsPublic })
            .FirstOrDefaultAsync(p => p.Id == request.ProjectId, cancellationToken);

        if (projectInfo == null)
            return null;

        // 2. Kiểm tra phân quyền: dự án bắt buộc phải thuộc nhóm (nếu không công khai)
        if (!projectInfo.IsPublic)
        {
            if (!projectInfo.TeamId.HasValue)
            {
                throw new UnauthorizedAccessException("Bạn không có quyền xem Project này.");
            }

            var isMember = await _dbContext.TeamMembers.AnyAsync(tm => tm.TeamId == projectInfo.TeamId.Value && tm.UserId == currentUserId, cancellationToken);
            if (!isMember)
                throw new UnauthorizedAccessException("Bạn không có quyền xem Project này.");
        }

        // 2.5. Xác định Sprint lọc
        var activeSprint = await _dbContext.Sprints
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.ProjectId == request.ProjectId && s.Status == PM.Domain.Enums.SprintStatus.Active, cancellationToken);
        
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

        // 2.7. Lấy danh sách tất cả các Sprint trong dự án để hiển thị ở Dropdown bộ lọc
        var allSprints = await _dbContext.Sprints
            .AsNoTracking()
            .Where(s => s.ProjectId == request.ProjectId)
            .OrderByDescending(s => s.Status == PM.Domain.Enums.SprintStatus.Active)
            .ThenByDescending(s => s.Status == PM.Domain.Enums.SprintStatus.Future)
            .ThenByDescending(s => s.CreatedAt)
            .Select(s => new SprintLookupDto
            {
                Id = s.Id,
                Name = s.Name,
                Status = s.Status.ToString()
            })
            .ToListAsync(cancellationToken);

        // 3. Thực hiện truy vấn Board Columns và Task Items trực tiếp qua Database Projection Select
        var columns = await _dbContext.BoardColumns
            .AsNoTracking()
            .Where(c => c.ProjectId == request.ProjectId)
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
                    .Where(t => filterByNullSprint ? t.SprintId == null : t.SprintId == targetSprintId)
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
