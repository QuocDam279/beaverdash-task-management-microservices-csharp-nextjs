using PM.Domain.Common;
using System;

namespace PM.Domain.Events;

public class SubTaskCreatedEvent : IDomainEvent
{
    public Guid ProjectId { get; set; }
    public Guid SubTaskId { get; set; }
    public Guid TaskId { get; set; }
    public string TaskTitle { get; set; }
    public string SubTaskTitle { get; set; }
    public Guid UserId { get; set; }
    public Guid? AssigneeUserId { get; set; }

    public SubTaskCreatedEvent(Guid projectId, Guid subTaskId, Guid taskId, string taskTitle, string subTaskTitle, Guid userId, Guid? assigneeUserId)
    {
        ProjectId = projectId;
        SubTaskId = subTaskId;
        TaskId = taskId;
        TaskTitle = taskTitle;
        SubTaskTitle = subTaskTitle;
        UserId = userId;
        AssigneeUserId = assigneeUserId;
    }
}
