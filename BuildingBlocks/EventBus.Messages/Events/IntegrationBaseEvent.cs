using System;

namespace EventBus.Messages.Events;

public record IntegrationBaseEvent
{
    public Guid Id { get; init; }
    public DateTime CreationDate { get; init; }
}
