using PM.Domain.Common;
using System;

namespace PM.Domain.Entities;

public class ChatMessage : BaseEntity
{
    public Guid Id { get; set; }
    
    public Guid SenderId { get; set; }
    public User? Sender { get; set; }

    public Guid? ProjectId { get; set; }
    public Project? Project { get; set; }

    public Guid? TeamId { get; set; }
    public Team? Team { get; set; }

    public string Content { get; set; } = null!;
    
    public string? FileUrl { get; set; }
    public string? FileName { get; set; }
    public string? FileType { get; set; }
    public long? FileSize { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
