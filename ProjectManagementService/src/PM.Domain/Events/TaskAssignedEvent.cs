using PM.Domain.Common;
using System;

namespace PM.Domain.Events;

public class TaskAssignedEvent : IDomainEvent
{
    public Guid TaskId { get; set; }
    public Guid ActorUserId { get; set; }
    public Guid AssigneeUserId { get; set; }

    public TaskAssignedEvent(Guid taskId, Guid actorUserId, Guid assigneeUserId)
    {
        TaskId = taskId;
        ActorUserId = actorUserId;
        AssigneeUserId = assigneeUserId;
    }
}
