using PM.Domain.Common;
using System;

namespace PM.Domain.Events;

public class CommentAddedEvent : IDomainEvent
{
    public Guid TaskId { get; set; }
    public Guid CommentId { get; set; }
    public Guid UserId { get; set; }
    public string Content { get; set; }

    public CommentAddedEvent(Guid taskId, Guid commentId, Guid userId, string content)
    {
        TaskId = taskId;
        CommentId = commentId;
        UserId = userId;
        Content = content;
    }
}
