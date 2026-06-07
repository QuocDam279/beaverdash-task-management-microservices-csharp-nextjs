using PM.Domain.Common;
using System;
using System.Collections.Generic;

namespace PM.Domain.Events;

public class ProjectUpdatedEvent : IDomainEvent
{
    public Guid ProjectId { get; set; }
    public string ProjectName { get; set; }
    public string? Description { get; set; }
    public Guid UserId { get; set; }
    public List<FieldChange> ChangedFields { get; set; }

    public ProjectUpdatedEvent(Guid projectId, string projectName, string? description, Guid userId, List<FieldChange> changedFields)
    {
        ProjectId = projectId;
        ProjectName = projectName;
        Description = description;
        UserId = userId;
        ChangedFields = changedFields;
    }
}
