using PM.Domain.Common;
using System;
using System.Collections.Generic;

namespace PM.Domain.Entities;

public class SubTask : BaseEntity
{
    public Guid Id { get; set; }
    
    public Guid TaskId { get; set; }
    public TaskItem? Task { get; set; }
    
    public Guid? AssigneeUserId { get; set; }
    public User? AssigneeUser { get; set; }
    
    public string Title { get; set; } = null!;
    
    public bool IsCompleted { get; set; } = false;
    
    public DateTime? StartDate { get; set; }
    public DateTime? DueDate { get; set; }
    
    public int? SortOrder { get; set; }
    
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public DateTime? DeletedAt { get; set; }

    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
}
