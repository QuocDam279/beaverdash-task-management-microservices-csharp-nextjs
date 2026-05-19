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
    private readonly IPMDbContext _dbContext;

    public AddCommentCommandHandler(IPMDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Guid> Handle(AddCommentCommand request, CancellationToken cancellationToken)
    {
        // 1. Kiểm tra task có tồn tại không
        var taskExists = await _dbContext.TaskItems
            .AnyAsync(t => t.Id == request.TaskId, cancellationToken);

        if (!taskExists)
            throw new InvalidOperationException("Task không tồn tại.");

        // 2. Tạo Comment thuần text (bỏ qua Attachment)
        var comment = new Comment
        {
            Id = Guid.NewGuid(),
            TaskId = request.TaskId,
            UserId = request.UserId, // Được lấy từ RequestingUserId truyền xuống
            Content = request.Content,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // Kích hoạt Domain Event ngầm
        comment.AddDomainEvent(new PM.Domain.Events.CommentAddedEvent(
            comment.TaskId, comment.Id, comment.UserId, comment.Content
        ));

        _dbContext.Comments.Add(comment);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return comment.Id;
    }
}
