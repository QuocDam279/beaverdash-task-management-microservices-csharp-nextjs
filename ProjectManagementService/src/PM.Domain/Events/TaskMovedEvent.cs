using PM.Domain.Common;
using System;

namespace PM.Domain.Events;

public class TaskMovedEvent : IDomainEvent
{
    public Guid ProjectId { get; set; }
    public Guid TaskId { get; set; }
    public string TaskTitle { get; set; }
    public Guid UserId { get; set; }
    public Guid OldColumnId { get; set; }
    public string OldColumnName { get; set; }
    public Guid NewColumnId { get; set; }
    public string NewColumnName { get; set; }

    public TaskMovedEvent(Guid projectId, Guid taskId, string taskTitle, Guid userId, Guid oldColumnId, string oldColumnName, Guid newColumnId, string newColumnName)
    {
        ProjectId = projectId;
        TaskId = taskId;
        TaskTitle = taskTitle;
        UserId = userId;
        OldColumnId = oldColumnId;
        OldColumnName = oldColumnName;
        NewColumnId = newColumnId;
        NewColumnName = newColumnName;
    }
}
