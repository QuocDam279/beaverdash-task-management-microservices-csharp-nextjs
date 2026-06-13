using PM.Domain.Common;
using System;

namespace PM.Domain.Entities;

public class ProjectShare : BaseEntity
{
    public Guid Id { get; set; }
    
    public Guid ProjectId { get; set; }
    public Project? Project { get; set; }

    public string RecipientEmail { get; set; } = null!;
    
    public Guid SharedByUserId { get; set; }
    public User? SharedByUser { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
