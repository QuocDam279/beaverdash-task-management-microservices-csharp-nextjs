using PM.Domain.Common;
using System;
using System.Collections.Generic;

namespace PM.Domain.Events;

public class SubTaskUpdatedEvent : IDomainEvent
{
    public Guid ProjectId { get; set; }
    public Guid SubTaskId { get; set; }
    public Guid TaskId { get; set; }
    public string TaskTitle { get; set; }
    public string SubTaskTitle { get; set; }
    public Guid UserId { get; set; }
    public List<FieldChange> ChangedFields { get; set; }

    public SubTaskUpdatedEvent(Guid projectId, Guid subTaskId, Guid taskId, string taskTitle, string subTaskTitle, Guid userId, List<FieldChange> changedFields)
    {
        ProjectId = projectId;
        SubTaskId = subTaskId;
        TaskId = taskId;
        TaskTitle = taskTitle;
        SubTaskTitle = subTaskTitle;
        UserId = userId;
        ChangedFields = changedFields;
    }
}
