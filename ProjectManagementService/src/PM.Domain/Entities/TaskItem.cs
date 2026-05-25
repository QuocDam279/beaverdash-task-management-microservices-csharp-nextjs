using PM.Domain.Common;
using PM.Domain.Enums;
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
    
    public string? Description { get; set; }
    public TaskPriority? Priority { get; set; }
    
    public DateTime? DueDate { get; set; }
    public DateTime? StartDate { get; set; }
    
    public double? SortOrder { get; set; }
    
    public Guid CreatedByUserId { get; set; }
    public User? CreatedByUser { get; set; }
    
    public DateTime? AssignedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime? DeletedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public ICollection<SubTask> SubTasks { get; set; } = new List<SubTask>();
}
