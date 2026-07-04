using PM.Domain.Common;
using System;

namespace PM.Domain.Events;

public class TeamMemberRemovedEvent : IDomainEvent
{
    public Guid TeamId { get; }
    public string TeamName { get; }
    public Guid RemovedUserId { get; }
    public Guid RemovedByUserId { get; }

    public TeamMemberRemovedEvent(Guid teamId, string teamName, Guid removedUserId, Guid removedByUserId)
    {
        TeamId = teamId;
        TeamName = teamName;
        RemovedUserId = removedUserId;
        RemovedByUserId = removedByUserId;
    }
}
