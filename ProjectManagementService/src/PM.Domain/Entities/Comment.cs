namespace PM.Domain.Entities;

public class Comment
{
    public Guid Id { get; set; }
    
    public Guid UserId { get; set; }
    public User? User { get; set; }

    public Guid TaskId { get; set; }
    public TaskItem? Task { get; set; }

    public string Content { get; set; } = null!;
    
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public ICollection<Attachment> Attachments { get; set; } = new List<Attachment>();
}
