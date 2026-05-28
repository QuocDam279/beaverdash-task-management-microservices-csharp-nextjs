using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Tasks.TaskItem.Queries;

public record GetSharedTaskDetailsQuery(Guid TaskId, string ShareToken) : IRequest<TaskDetailsDto?>;

public class GetSharedTaskDetailsQueryHandler : IRequestHandler<GetSharedTaskDetailsQuery, TaskDetailsDto?>
{
    private readonly IPMDbContext _dbContext;

    public GetSharedTaskDetailsQueryHandler(IPMDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<TaskDetailsDto?> Handle(GetSharedTaskDetailsQuery request, CancellationToken cancellationToken)
    {
        // Use direct projection with Select to bypass EF Core Include limitations with multiple filtered collections
        var taskDto = await _dbContext.TaskItems
            .AsNoTracking()
            .Where(t => t.Id == request.TaskId && t.DeletedAt == null)
            .Select(t => new TaskDetailsDto
            {
                Id = t.Id,
                BoardColumnId = t.BoardColumnId,
                ProjectId = t.BoardColumn != null ? t.BoardColumn.ProjectId : Guid.Empty,
                ProjectName = t.BoardColumn != null && t.BoardColumn.Project != null ? t.BoardColumn.Project.Name : string.Empty,
                Title = t.Title,
                Description = t.Description,
                Priority = t.Priority != null ? t.Priority.ToString() : null,
                DueDate = t.DueDate,
                StartDate = t.StartDate,
                SortOrder = t.SortOrder,
                CreatedByName = t.CreatedByUser != null ? t.CreatedByUser.DisplayName : null,
                CreatedByAvatar = t.CreatedByUser != null ? t.CreatedByUser.Avatar : null,
                CreatedAt = t.CreatedAt,
                UpdatedAt = t.UpdatedAt,
                SubTasks = t.SubTasks
                    .Where(st => st.DeletedAt == null)
                    .OrderBy(st => st.SortOrder)
                    .Select(st => new SubTaskDto
                    {
                        Id = st.Id,
                        TaskId = st.TaskId,
                        Title = st.Title,
                        IsCompleted = st.IsCompleted,
                        DueDate = st.DueDate,
                        SortOrder = st.SortOrder,
                        AssigneeUserId = st.AssigneeUserId,
                        AssigneeName = st.AssigneeUser != null ? st.AssigneeUser.DisplayName : null,
                        AssigneeAvatar = st.AssigneeUser != null ? st.AssigneeUser.Avatar : null,
                        Priority = st.Priority != null ? st.Priority.ToString() : null,
                        CreatedAt = st.CreatedAt,
                        UpdatedAt = st.UpdatedAt,
                        Comments = st.Comments
                            .OrderBy(c => c.CreatedAt)
                            .Select(c => new CommentDto
                            {
                                Id = c.Id,
                                UserId = c.UserId,
                                UserName = c.User != null ? c.User.DisplayName : "User",
                                UserAvatar = c.User != null ? c.User.Avatar : null,
                                SubTaskId = c.SubTaskId,
                                Content = c.Content,
                                CreatedAt = c.CreatedAt,
                                UpdatedAt = c.UpdatedAt
                            }).ToList()
                    }).ToList()
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (taskDto == null)
            return null;

        var project = await _dbContext.Projects
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == taskDto.ProjectId, cancellationToken);

        if (project == null || project.ShareToken != request.ShareToken || !project.IsPublic)
            return null;

        taskDto.ProjectStartDate = project.StartDate;
        taskDto.ProjectDueDate = project.DueDate;

        return taskDto;
    }
}
