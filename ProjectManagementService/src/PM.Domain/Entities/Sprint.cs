using PM.Domain.Common;
using PM.Domain.Enums;

namespace PM.Domain.Entities;

public class Sprint : BaseEntity
{
    public Guid Id { get; set; }

    public Guid ProjectId { get; set; }
    public Project? Project { get; set; }

    public string Name { get; set; } = null!;
    public string? Goal { get; set; }

    public SprintStatus Status { get; set; }

    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public ICollection<TaskItem> TaskItems { get; set; } = new List<TaskItem>();
}
