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
        // 1. Lấy thông tin cơ bản của Project qua ShareToken
        var projectInfo = await _dbContext.Projects
            .AsNoTracking()
            .Select(p => new { p.Id, p.Name, p.Description, p.ShareToken, p.IsPublic })
            .FirstOrDefaultAsync(p => p.ShareToken == request.ShareToken && p.IsPublic, cancellationToken);

        if (projectInfo == null)
            return null;

        // 2. Thực hiện truy vấn Board Columns và Task Items trực tiếp qua Database Projection Select
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
                    .Where(t => t.DeletedAt == null)
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
            BoardColumns = columns
        };
    }
}
