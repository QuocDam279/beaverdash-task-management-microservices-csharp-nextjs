using PM.Domain.Common;
using System;

namespace PM.Domain.Events;

public class TaskCreatedEvent : IDomainEvent
{
    public Guid ProjectId { get; set; }
    public Guid TaskId { get; set; }
    public Guid UserId { get; set; }
    public string Title { get; set; }

    public TaskCreatedEvent(Guid projectId, Guid taskId, Guid userId, string title)
    {
        ProjectId = projectId;
        TaskId = taskId;
        UserId = userId;
        Title = title;
    }
}
