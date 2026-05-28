using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using PM.Application.Features.Projects.Project.Queries.GetProjectBoard;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Projects.Project.Queries.GetSharedProjectBoard;

public record GetSharedProjectBoardQuery(string ShareToken) : IRequest<ProjectBoardDto?>;

public class GetSharedProjectBoardQueryHandler : IRequestHandler<GetSharedProjectBoardQuery, ProjectBoardDto?>
{
    private readonly IPMDbContext _dbContext;

    public GetSharedProjectBoardQueryHandler(IPMDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<ProjectBoardDto?> Handle(GetSharedProjectBoardQuery request, CancellationToken cancellationToken)
    {
        var project = await _dbContext.Projects
            .AsNoTracking()
            .Include(p => p.BoardColumns.OrderBy(c => c.Position))
                .ThenInclude(c => c.TaskItems.OrderBy(t => t.SortOrder))
            .Include(p => p.BoardColumns.OrderBy(c => c.Position))
                .ThenInclude(c => c.TaskItems.OrderBy(t => t.SortOrder))
                    .ThenInclude(t => t.SubTasks)
                        .ThenInclude(st => st.AssigneeUser)
            .FirstOrDefaultAsync(p => p.ShareToken == request.ShareToken && p.IsPublic, cancellationToken);

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
                IsDone = c.IsDone,
                TaskItems = c.TaskItems.Where(t => t.DeletedAt == null).Select(t => new TaskItemDto
                {
                    Id = t.Id,
                    BoardColumnId = t.BoardColumnId,
                    Title = t.Title,
                    Priority = t.Priority?.ToString(),
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
                        AssigneeUserId = st.AssigneeUserId,
                        AssigneeAvatar = st.AssigneeUser != null ? st.AssigneeUser.Avatar : null,
                        AssigneeName = st.AssigneeUser != null ? st.AssigneeUser.DisplayName : null,
                        Priority = st.Priority != null ? st.Priority.ToString() : null
                    }).ToList()
                }).ToList()
            }).ToList()
        };
    }
}
