namespace PM.Domain.Entities;

public class Project
{
    public Guid Id { get; set; }
    
    public Guid? TeamId { get; set; }
    public Team? Team { get; set; }

    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public string? Status { get; set; }
    
    public DateTime? StartDate { get; set; }
    public DateTime? DueDate { get; set; }
    
    public bool IsPublic { get; set; }
    public string? ShareToken { get; set; }
    
    public Guid CreatedByUserId { get; set; }
    public User? CreatedByUser { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
