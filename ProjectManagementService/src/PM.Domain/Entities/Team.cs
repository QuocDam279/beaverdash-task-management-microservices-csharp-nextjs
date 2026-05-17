namespace PM.Domain.Entities;

public class Team
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    
    public Guid OwnerUserId { get; set; }
    public User? OwnerUser { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public ICollection<TeamMember> Members { get; set; } = new List<TeamMember>();
    public ICollection<Project> Projects { get; set; } = new List<Project>();
}
