using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using PM.Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Tasks.Comments.Commands;

public class AddCommentCommandHandler : IRequestHandler<AddCommentCommand, Guid>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IPMDbContext _dbContext;

    public AddCommentCommandHandler(IPMDbContext dbContext, ICurrentUserService currentUserService)
    {
        _currentUserService = currentUserService;
        _dbContext = dbContext;
    }

    public async Task<Guid> Handle(AddCommentCommand request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException();

        var subTask = await _dbContext.SubTasks
            .Include(s => s.Task)
                .ThenInclude(t => t!.BoardColumn)
                    .ThenInclude(c => c!.Project)
            .FirstOrDefaultAsync(s => s.Id == request.SubTaskId, cancellationToken);

        if (subTask == null)
            throw new InvalidOperationException("SubTask không tồn tại.");

        if (subTask.Task!.BoardColumn!.Project!.TeamId.HasValue)
        {
            var isMember = await _dbContext.TeamMembers.AnyAsync(tm => tm.TeamId == subTask.Task.BoardColumn.Project.TeamId.Value && tm.UserId == currentUserId, cancellationToken);
            if (!isMember)
                throw new UnauthorizedAccessException("Bạn không có quyền bình luận trong Project này.");
        }
        
        // 2. Tạo Comment thuần text (bỏ qua Attachment)
        var comment = new Comment
        {
            Id = Guid.NewGuid(),
            SubTaskId = request.SubTaskId,
            UserId = currentUserId,
            Content = request.Content,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // Kích hoạt Domain Event ngầm
        comment.AddDomainEvent(new PM.Domain.Events.CommentAddedEvent(
            comment.SubTaskId, comment.Id, comment.UserId, comment.Content
        ));

        _dbContext.Comments.Add(comment);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return comment.Id;
    }
}
