using PM.Domain.Common;
using System;

namespace PM.Domain.Events;

public class SubTaskCompletedEvent : IDomainEvent
{
    public Guid ProjectId { get; }
    public Guid SubTaskId { get; }
    public Guid TaskId { get; }
    public string TaskTitle { get; }
    public string SubTaskTitle { get; }
    public Guid CompletedByUserId { get; }
    public Guid TaskCreatorUserId { get; }
    public Guid? AssigneeUserId { get; }

    public SubTaskCompletedEvent(
        Guid projectId,
        Guid subTaskId,
        Guid taskId,
        string taskTitle,
        string subTaskTitle,
        Guid completedByUserId,
        Guid taskCreatorUserId,
        Guid? assigneeUserId)
    {
        ProjectId = projectId;
        SubTaskId = subTaskId;
        TaskId = taskId;
        TaskTitle = taskTitle;
        SubTaskTitle = subTaskTitle;
        CompletedByUserId = completedByUserId;
        TaskCreatorUserId = taskCreatorUserId;
        AssigneeUserId = assigneeUserId;
    }
}
