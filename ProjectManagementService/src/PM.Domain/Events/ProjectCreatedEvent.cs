using PM.Domain.Common;
using System;

namespace PM.Domain.Events;

public class ProjectCreatedEvent : IDomainEvent
{
    public Guid ProjectId { get; }
    public string ProjectName { get; }
    public Guid TeamId { get; }
    public Guid CreatedByUserId { get; }

    public ProjectCreatedEvent(Guid projectId, string projectName, Guid teamId, Guid createdByUserId)
    {
        ProjectId = projectId;
        ProjectName = projectName;
        TeamId = teamId;
        CreatedByUserId = createdByUserId;
    }
}
