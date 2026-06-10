using PM.Domain.Common;

namespace PM.Domain.Entities;

public class Project : BaseEntity
{
    public Guid Id { get; set; }
    
    public Guid? TeamId { get; set; }
    public Team? Team { get; set; }

    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public int Progress { get; set; }
    
    public DateTime? StartDate { get; set; }
    public DateTime? DueDate { get; set; }
    
    public bool IsPublic { get; set; }
    public string? ShareToken { get; set; }
    
    public Guid CreatedByUserId { get; set; }
    public User? CreatedByUser { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public ICollection<BoardColumn> BoardColumns { get; set; } = new List<BoardColumn>();
    public ICollection<Sprint> Sprints { get; set; } = new List<Sprint>();
    public ICollection<ProjectDocument> ProjectDocuments { get; set; } = new List<ProjectDocument>();
}
