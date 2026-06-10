using System;

namespace PM.Application.Features.Sprints.Queries.GetBacklog;

public class BacklogTaskDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = null!;
    public string? Priority { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? DueDate { get; set; }
    public Guid BoardColumnId { get; set; }
    public string ColumnName { get; set; } = null!;
    public int SubTasksCount { get; set; }
    public int CompletedSubTasksCount { get; set; }
}
