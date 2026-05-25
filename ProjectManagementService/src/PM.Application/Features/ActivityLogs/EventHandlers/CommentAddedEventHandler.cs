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
        // Để insert ActivityLog, chúng ta cần ProjectId. Ta sẽ truy ngược từ SubTaskId -> Task -> BoardColumn -> ProjectId
        var subtask = await _dbContext.SubTasks
            .Include(s => s.Task)
                .ThenInclude(t => t!.BoardColumn)
            .FirstOrDefaultAsync(s => s.Id == notification.TaskId, cancellationToken);

        if (subtask == null || subtask.Task == null || subtask.Task.BoardColumn == null)
            return;

        var newValueObj = new 
        { 
            content = notification.Content,
            subtask_title = subtask.Title,
            task_title = subtask.Task.Title,
            task_id = subtask.Task.Id
        };

        var activityLog = new ActivityLog
        {
            Id = Guid.NewGuid(),
            ProjectId = subtask.Task.BoardColumn.ProjectId,
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
