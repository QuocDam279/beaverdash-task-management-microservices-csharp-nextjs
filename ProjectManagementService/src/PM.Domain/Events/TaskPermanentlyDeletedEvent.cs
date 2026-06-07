using PM.Domain.Common;
using System;

namespace PM.Domain.Events;

public class TaskPermanentlyDeletedEvent : IDomainEvent
{
    public Guid ProjectId { get; set; }
    public Guid TaskId { get; set; }
    public string TaskTitle { get; set; }
    public Guid UserId { get; set; }

    public TaskPermanentlyDeletedEvent(Guid projectId, Guid taskId, string taskTitle, Guid userId)
    {
        ProjectId = projectId;
        TaskId = taskId;
        TaskTitle = taskTitle;
        UserId = userId;
    }
}
