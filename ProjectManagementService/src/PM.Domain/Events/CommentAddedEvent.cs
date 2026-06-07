using PM.Domain.Common;
using System;

namespace PM.Domain.Events;

public class CommentAddedEvent : IDomainEvent
{
    public Guid ProjectId { get; set; }
    public Guid TaskId { get; set; }
    public string TaskTitle { get; set; }
    public Guid SubTaskId { get; set; }
    public string SubTaskTitle { get; set; }
    public Guid? AssigneeUserId { get; set; }
    public Guid CommentId { get; set; }
    public Guid UserId { get; set; }
    public string Content { get; set; }

    public CommentAddedEvent(Guid projectId, Guid taskId, string taskTitle, Guid subTaskId, string subTaskTitle, Guid? assigneeUserId, Guid commentId, Guid userId, string content)
    {
        ProjectId = projectId;
        TaskId = taskId;
        TaskTitle = taskTitle;
        SubTaskId = subTaskId;
        SubTaskTitle = subTaskTitle;
        AssigneeUserId = assigneeUserId;
        CommentId = commentId;
        UserId = userId;
        Content = content;
    }
}
