using PM.Domain.Common;

namespace PM.Domain.Events;

public class SprintStartedEvent : IDomainEvent
{
    public Guid ProjectId { get; }
    public Guid SprintId { get; }
    public string SprintName { get; }
    public Guid StartedByUserId { get; }

    public SprintStartedEvent(Guid projectId, Guid sprintId, string sprintName, Guid startedByUserId)
    {
        ProjectId = projectId;
        SprintId = sprintId;
        SprintName = sprintName;
        StartedByUserId = startedByUserId;
    }
}
