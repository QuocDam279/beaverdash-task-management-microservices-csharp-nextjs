namespace PM.Domain.Entities;

public class Notification
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }
    public User? User { get; set; }

    public Guid ActorUserId { get; set; }
    public User? ActorUser { get; set; }

    public string? Type { get; set; }
    public string? Content { get; set; }
    public string? ActionUrl { get; set; }

    public bool IsRead { get; set; }
    public bool IsSentViaEmail { get; set; }
    public DateTime? EmailSentAt { get; set; }

    public DateTime CreatedAt { get; set; }
}
