using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Tasks.TaskItem.Queries;

public class GetTaskDetailsQueryHandler : IRequestHandler<GetTaskDetailsQuery, TaskDetailsDto?>
{
    private readonly IPMDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;

    public GetTaskDetailsQueryHandler(IPMDbContext dbContext, ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
    }

    public async Task<TaskDetailsDto?> Handle(GetTaskDetailsQuery request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("Bạn chưa đăng nhập.");

        // Use direct projection with Select to bypass EF Core Include limitations with multiple filtered collections
        var taskDto = await _dbContext.TaskItems
            .AsNoTracking()
            .Where(t => t.Id == request.TaskId)
            .Select(t => new TaskDetailsDto
            {
                Id = t.Id,
                BoardColumnId = t.BoardColumnId,
                ProjectId = t.BoardColumn != null ? t.BoardColumn.ProjectId : Guid.Empty,
                ProjectName = t.BoardColumn != null && t.BoardColumn.Project != null ? t.BoardColumn.Project.Name : string.Empty,
                CreatedByUserId = t.CreatedByUserId,
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
                                UpdatedAt = c.UpdatedAt,
                                Attachments = c.Attachments
                                    .OrderBy(a => a.CreatedAt)
                                    .Select(a => new AttachmentDto
                                    {
                                        Id = a.Id,
                                        FileName = a.FileName,
                                        FileUrl = a.FileUrl,
                                        FileType = a.FileType,
                                        FileSizeBytes = a.FileSizeBytes,
                                        CreatedAt = a.CreatedAt
                                    }).ToList()
                            }).ToList()
                    }).ToList()
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (taskDto == null)
            return null;

        var project = await _dbContext.Projects
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == taskDto.ProjectId, cancellationToken);

        if (project == null)
            return null;

        taskDto.ProjectStartDate = project.StartDate;
        taskDto.ProjectDueDate = project.DueDate;
        taskDto.TeamId = project.TeamId;

        // Authorization check
        if (!project.IsPublic)
        {
            if (!project.TeamId.HasValue)
            {
                throw new UnauthorizedAccessException("Bạn không có quyền xem Task này.");
            }

            var isMember = await _dbContext.TeamMembers.AnyAsync(
                tm => tm.TeamId == project.TeamId.Value && tm.UserId == currentUserId, 
                cancellationToken
            );
            if (!isMember)
                throw new UnauthorizedAccessException("Bạn không có quyền xem Task này.");
        }

        return taskDto;
    }
}
