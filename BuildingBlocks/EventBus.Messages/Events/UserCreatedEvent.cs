using System;

namespace EventBus.Messages.Events;

public record UserCreatedEvent : IntegrationBaseEvent
{
    public string Email { get; init; } = null!;
    public string DisplayName { get; init; } = null!;
    public string? Avatar { get; init; }
}
