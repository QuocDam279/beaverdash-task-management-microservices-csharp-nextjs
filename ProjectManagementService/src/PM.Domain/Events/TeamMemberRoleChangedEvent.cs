using PM.Domain.Common;
using System;

namespace PM.Domain.Events;

public class TeamMemberRoleChangedEvent : IDomainEvent
{
    public Guid TeamId { get; }
    public string TeamName { get; }
    public Guid UserId { get; }
    public string OldRole { get; }
    public string NewRole { get; }
    public Guid UpdatedByUserId { get; }

    public TeamMemberRoleChangedEvent(Guid teamId, string teamName, Guid userId, string oldRole, string newRole, Guid updatedByUserId)
    {
        TeamId = teamId;
        TeamName = teamName;
        UserId = userId;
        OldRole = oldRole;
        NewRole = newRole;
        UpdatedByUserId = updatedByUserId;
    }
}
