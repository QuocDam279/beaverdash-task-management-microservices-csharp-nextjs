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

    public GetProjectBoardQueryHandler(IPMDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<ProjectBoardDto?> Handle(GetProjectBoardQuery request, CancellationToken cancellationToken)
    {
        var project = await _dbContext.Projects
            .AsNoTracking()
            .Include(p => p.BoardColumns.OrderBy(c => c.Position))
                .ThenInclude(c => c.TaskItems.OrderBy(t => t.SortOrder))
                    .ThenInclude(t => t.AssigneeUser)
            .FirstOrDefaultAsync(p => p.Id == request.ProjectId, cancellationToken);

        if (project == null)
            return null;

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
                    TaskType = t.TaskType,
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
