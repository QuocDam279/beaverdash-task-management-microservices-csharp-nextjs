using PM.Domain.Common;
using System;
using System.Collections.Generic;

namespace PM.Domain.Events;

public class TeamMemberAddedEvent : IDomainEvent
{
    public Guid TeamId { get; set; }
    public string TeamName { get; set; }
    public Guid UserId { get; set; }
    public Guid NewMemberUserId { get; set; }
    public List<Guid> ProjectIds { get; set; }
    public List<Guid> MemberUserIds { get; set; }

    public TeamMemberAddedEvent(Guid teamId, string teamName, Guid userId, Guid newMemberUserId, List<Guid> projectIds, List<Guid> memberUserIds)
    {
        TeamId = teamId;
        TeamName = teamName;
        UserId = userId;
        NewMemberUserId = newMemberUserId;
        ProjectIds = projectIds;
        MemberUserIds = memberUserIds;
    }
}
