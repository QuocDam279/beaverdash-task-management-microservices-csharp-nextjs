namespace PM.Domain.Entities;

public class BoardColumn
{
    public Guid Id { get; set; }
    
    public Guid ProjectId { get; set; }
    public Project? Project { get; set; }

    public string Name { get; set; } = null!;
    public int Position { get; set; }
    public int? WipLimit { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public ICollection<TaskItem> TaskItems { get; set; } = new List<TaskItem>();
}
