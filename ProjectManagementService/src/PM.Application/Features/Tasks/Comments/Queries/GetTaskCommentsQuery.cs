using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Tasks.Comments.Queries;

public class CommentDto
{
    public Guid Id { get; set; }
    public Guid TaskId { get; set; }
    public Guid UserId { get; set; }
    public string Content { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    // Thông tin hiển thị của người bình luận
    public string DisplayName { get; set; } = null!;
    public string? Avatar { get; set; }
}

public record GetTaskCommentsQuery(Guid TaskId) : IRequest<List<CommentDto>>;

public class GetTaskCommentsQueryHandler : IRequestHandler<GetTaskCommentsQuery, List<CommentDto>>
{
    private readonly IPMDbContext _dbContext;

    public GetTaskCommentsQueryHandler(IPMDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<CommentDto>> Handle(GetTaskCommentsQuery request, CancellationToken cancellationToken)
    {
        // Truy vấn danh sách comments, sắp xếp từ cũ nhất đến mới nhất theo thứ tự thời gian
        var comments = await _dbContext.Comments
            .AsNoTracking()
            .Include(c => c.User)
            .Where(c => c.TaskId == request.TaskId)
            .OrderBy(c => c.CreatedAt)
            .Select(c => new CommentDto
            {
                Id = c.Id,
                TaskId = c.TaskId,
                UserId = c.UserId,
                Content = c.Content,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt,
                DisplayName = c.User != null ? c.User.DisplayName : "Unknown User",
                Avatar = c.User != null ? c.User.Avatar : null
            })
            .ToListAsync(cancellationToken);

        return comments;
    }
}
