using System;
using System.Collections.Generic;

namespace EventBus.Messages.Events;

public record ProjectMembersSyncedEvent : IntegrationBaseEvent
{
    public Guid ProjectId { get; init; }
    public List<Guid> MemberUserIds { get; init; } = new();
}
