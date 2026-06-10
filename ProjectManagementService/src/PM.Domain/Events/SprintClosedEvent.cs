using PM.Domain.Common;

namespace PM.Domain.Events;

public class SprintClosedEvent : IDomainEvent
{
    public Guid ProjectId { get; }
    public Guid SprintId { get; }
    public string SprintName { get; }
    public Guid ClosedByUserId { get; }
    public int CompletedTasksCount { get; }
    public int IncompleteTasksCount { get; }

    public SprintClosedEvent(
        Guid projectId,
        Guid sprintId,
        string sprintName,
        Guid closedByUserId,
        int completedTasksCount,
        int incompleteTasksCount)
    {
        ProjectId = projectId;
        SprintId = sprintId;
        SprintName = sprintName;
        ClosedByUserId = closedByUserId;
        CompletedTasksCount = completedTasksCount;
        IncompleteTasksCount = incompleteTasksCount;
    }
}
