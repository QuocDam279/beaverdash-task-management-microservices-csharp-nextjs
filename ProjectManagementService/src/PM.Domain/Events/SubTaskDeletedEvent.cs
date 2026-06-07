using PM.Domain.Common;
using System;

namespace PM.Domain.Events;

public class SubTaskDeletedEvent : IDomainEvent
{
    public Guid ProjectId { get; set; }
    public Guid SubTaskId { get; set; }
    public Guid TaskId { get; set; }
    public string TaskTitle { get; set; }
    public string SubTaskTitle { get; set; }
    public Guid UserId { get; set; }

    public SubTaskDeletedEvent(Guid projectId, Guid subTaskId, Guid taskId, string taskTitle, string subTaskTitle, Guid userId)
    {
        ProjectId = projectId;
        SubTaskId = subTaskId;
        TaskId = taskId;
        TaskTitle = taskTitle;
        SubTaskTitle = subTaskTitle;
        UserId = userId;
    }
}
