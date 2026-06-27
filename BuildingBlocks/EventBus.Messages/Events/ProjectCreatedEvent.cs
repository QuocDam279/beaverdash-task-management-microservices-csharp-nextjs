using System;

namespace EventBus.Messages.Events;

public record ProjectCreatedEvent : IntegrationBaseEvent
{
    public Guid ProjectId { get; init; }
    public string Name { get; init; } = null!;
    public string? Description { get; init; }
    public string? Status { get; init; }
}
