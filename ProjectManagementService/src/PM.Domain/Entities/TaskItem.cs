using PM.Domain.Common;
using System;
using System.Collections.Generic;

namespace PM.Domain.Entities;

public class TaskItem : BaseEntity
{
    public Guid Id { get; set; }
    
    public Guid BoardColumnId { get; set; }
    public BoardColumn? BoardColumn { get; set; }
    
    public Guid? AssigneeUserId { get; set; }
    public User? AssigneeUser { get; set; }
    
    public string Title { get; set; } = null!;
    
    public Guid? ParentTaskId { get; set; }
    public TaskItem? ParentTask { get; set; }
    
    public string? TaskType { get; set; }
    public string? Description { get; set; }
    public string? Priority { get; set; }
    
    public DateTime? DueDate { get; set; }
    public DateTime? StartDate { get; set; }
    
    public int? SortOrder { get; set; }
    
    public Guid CreatedByUserId { get; set; }
    public User? CreatedByUser { get; set; }
    
    public DateTime? AssignedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
}
