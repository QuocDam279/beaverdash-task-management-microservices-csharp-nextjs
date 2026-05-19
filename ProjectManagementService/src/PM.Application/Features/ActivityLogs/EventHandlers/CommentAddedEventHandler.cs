using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using PM.Domain.Entities;
using PM.Domain.Events;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.ActivityLogs.EventHandlers;

public class CommentAddedEventHandler : INotificationHandler<CommentAddedEvent>
{
    private readonly IPMDbContext _dbContext;

    public CommentAddedEventHandler(IPMDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task Handle(CommentAddedEvent notification, CancellationToken cancellationToken)
    {
        // Để insert ActivityLog, chúng ta cần ProjectId. Ta sẽ truy ngược từ TaskId -> BoardColumn -> ProjectId
        var task = await _dbContext.TaskItems
            .Include(t => t.BoardColumn)
            .FirstOrDefaultAsync(t => t.Id == notification.TaskId, cancellationToken);

        if (task == null || task.BoardColumn == null)
            return;

        var newValueObj = new { content = notification.Content };

        var activityLog = new ActivityLog
        {
            Id = Guid.NewGuid(),
            ProjectId = task.BoardColumn.ProjectId,
            UserId = notification.UserId,
            EntityType = "comment",
            EntityId = notification.CommentId,
            ActionType = "created",
            NewValue = System.Text.Json.JsonSerializer.Serialize(newValueObj),
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.ActivityLogs.Add(activityLog);
        
        // Vì event này được trigger TRƯỚC khi DbContext gọi base.SaveChangesAsync(), 
        // bản ghi ActivityLog này sẽ được lưu cùng lúc với Comment trong 1 Transaction.
        // Tuy nhiên, gọi _dbContext.SaveChangesAsync() ở đây vẫn hoàn toàn an toàn (vì chúng ta đã ClearDomainEvents ở DBContext để chống lặp vô tận).
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
