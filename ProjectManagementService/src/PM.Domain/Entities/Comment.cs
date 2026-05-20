using PM.Domain.Common;
using System;
using System.Collections.Generic;

namespace PM.Domain.Entities;

public class Comment : BaseEntity
{
    public Guid Id { get; set; }
    
    public Guid UserId { get; set; }
    public User? User { get; set; }

    public Guid SubTaskId { get; set; }
    public SubTask? SubTask { get; set; }

    public string Content { get; set; } = null!;
    
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public ICollection<Attachment> Attachments { get; set; } = new List<Attachment>();
}
