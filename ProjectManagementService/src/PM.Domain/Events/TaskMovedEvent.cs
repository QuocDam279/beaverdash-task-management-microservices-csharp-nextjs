using PM.Domain.Common;
using System;

namespace PM.Domain.Events;

public class TaskMovedEvent : IDomainEvent
{
    public Guid TaskId { get; set; }
    public Guid UserId { get; set; }
    public Guid OldColumnId { get; set; }
    public Guid NewColumnId { get; set; }

    public TaskMovedEvent(Guid taskId, Guid userId, Guid oldColumnId, Guid newColumnId)
    {
        TaskId = taskId;
        UserId = userId;
        OldColumnId = oldColumnId;
        NewColumnId = newColumnId;
    }
}
