using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Tasks.Comments.Queries;

public class AttachmentDto
{
    public Guid Id { get; set; }
    public string FileName { get; set; } = null!;
    public string FileUrl { get; set; } = null!;
    public string? FileType { get; set; }
    public long? FileSizeBytes { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CommentDto
{
    public Guid Id { get; set; }
    public Guid SubTaskId { get; set; }
    public Guid UserId { get; set; }
    public string Content { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    // Thông tin hiển thị của người bình luận
    public string DisplayName { get; set; } = null!;
    public string? Avatar { get; set; }

    public List<AttachmentDto> Attachments { get; set; } = new();
}

public record GetTaskCommentsQuery(Guid SubTaskId) : IRequest<List<CommentDto>>;

public class GetTaskCommentsQueryHandler : IRequestHandler<GetTaskCommentsQuery, List<CommentDto>>
{
    private readonly IPMDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;

    public GetTaskCommentsQueryHandler(IPMDbContext dbContext, ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
    }

    public async Task<List<CommentDto>> Handle(GetTaskCommentsQuery request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException();

        // 1. Kiểm tra quyền truy cập SubTask
        var subTask = await _dbContext.SubTasks
            .Include(s => s.Task)
                .ThenInclude(t => t!.BoardColumn)
                    .ThenInclude(c => c!.Project)
            .FirstOrDefaultAsync(s => s.Id == request.SubTaskId, cancellationToken);

        if (subTask == null)
            return new List<CommentDto>();

        if (!subTask.Task!.BoardColumn!.Project!.TeamId.HasValue)
        {
            throw new UnauthorizedAccessException("Bạn không có quyền xem bình luận trong Project này.");
        }

        var isMember = await _dbContext.TeamMembers.AnyAsync(tm => tm.TeamId == subTask.Task.BoardColumn.Project.TeamId.Value && tm.UserId == currentUserId, cancellationToken);
        if (!isMember)
            throw new UnauthorizedAccessException("Bạn không có quyền xem bình luận trong Project này.");
        // Truy vấn danh sách comments, sắp xếp từ cũ nhất đến mới nhất theo thứ tự thời gian
        var comments = await _dbContext.Comments
            .AsNoTracking()
            .Include(c => c.User)
            .Where(c => c.SubTaskId == request.SubTaskId)
            .OrderBy(c => c.CreatedAt)
            .Select(c => new CommentDto
            {
                Id = c.Id,
                SubTaskId = c.SubTaskId,
                UserId = c.UserId,
                Content = c.Content,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt,
                DisplayName = c.User != null ? c.User.DisplayName : "Unknown User",
                Avatar = c.User != null ? c.User.Avatar : null,
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
            })
            .ToListAsync(cancellationToken);

        return comments;
    }
}
