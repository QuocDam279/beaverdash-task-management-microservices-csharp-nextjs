using System;

namespace PM.Domain.Entities;

public class NotificationTracking
{
    public Guid Id { get; set; }
    public string NotificationType { get; set; } = null!;
    public Guid EntityId { get; set; }
    public string EntityType { get; set; } = null!;
    public int DaysRemainingOrOverdue { get; set; }
    public Guid UserId { get; set; }
    public User? User { get; set; }
    public DateTime SentAtUtc { get; set; }
}
