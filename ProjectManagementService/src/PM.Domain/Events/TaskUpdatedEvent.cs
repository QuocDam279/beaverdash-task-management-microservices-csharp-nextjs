using PM.Domain.Common;
using System;
using System.Collections.Generic;

namespace PM.Domain.Events;

public class TaskUpdatedEvent : IDomainEvent
{
    public Guid ProjectId { get; set; }
    public Guid TaskId { get; set; }
    public string TaskTitle { get; set; }
    public Guid UserId { get; set; }
    public List<FieldChange> ChangedFields { get; set; }

    public TaskUpdatedEvent(Guid projectId, Guid taskId, string taskTitle, Guid userId, List<FieldChange> changedFields)
    {
        ProjectId = projectId;
        TaskId = taskId;
        TaskTitle = taskTitle;
        UserId = userId;
        ChangedFields = changedFields;
    }
}
