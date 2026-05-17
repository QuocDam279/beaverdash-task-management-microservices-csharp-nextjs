namespace PM.Domain.Entities;

public class ActivityLog
{
    public Guid Id { get; set; }
    
    public Guid ProjectId { get; set; }
    public Project? Project { get; set; }

    public Guid UserId { get; set; }
    public User? User { get; set; }

    public string? EntityType { get; set; }
    public Guid? EntityId { get; set; }
    public string? ActionType { get; set; }
    
    public string? OldValue { get; set; }
    public string? NewValue { get; set; }

    public DateTime CreatedAt { get; set; }
}
