using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Projects.Project.Queries.GetProjectBoard;

public record GetProjectBoardQuery(Guid ProjectId) : IRequest<ProjectBoardDto?>;

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

        var project = await _dbContext.Projects
            .AsNoTracking()
            .Include(p => p.BoardColumns.OrderBy(c => c.Position))
                .ThenInclude(c => c.TaskItems.OrderBy(t => t.SortOrder))
                    .ThenInclude(t => t.AssigneeUser)
            .FirstOrDefaultAsync(p => p.Id == request.ProjectId, cancellationToken);

        if (project == null)
            return null;

        if (project.TeamId.HasValue && !project.IsPublic)
        {
            var isMember = await _dbContext.TeamMembers.AnyAsync(tm => tm.TeamId == project.TeamId.Value && tm.UserId == currentUserId, cancellationToken);
            if (!isMember)
                throw new UnauthorizedAccessException("Bạn không có quyền xem Project này.");
        }
        else if (!project.TeamId.HasValue && !project.IsPublic && project.CreatedByUserId != currentUserId)
        {
            throw new UnauthorizedAccessException("Bạn không có quyền xem Project này.");
        }

        return new ProjectBoardDto
        {
            Id = project.Id,
            Name = project.Name,
            Description = project.Description,
            BoardColumns = project.BoardColumns.Select(c => new BoardColumnDto
            {
                Id = c.Id,
                ProjectId = c.ProjectId,
                Name = c.Name,
                Position = c.Position,
                WipLimit = c.WipLimit,
                TaskItems = c.TaskItems.Select(t => new TaskItemDto
                {
                    Id = t.Id,
                    BoardColumnId = t.BoardColumnId,
                    Title = t.Title,
                    Priority = t.Priority,
                    SortOrder = t.SortOrder,
                    AssigneeUserId = t.AssigneeUserId,
                    AssigneeAvatar = t.AssigneeUser?.Avatar,
                    AssigneeName = t.AssigneeUser?.DisplayName,
                    DueDate = t.DueDate
                }).ToList()
            }).ToList()
        };
    }
}
