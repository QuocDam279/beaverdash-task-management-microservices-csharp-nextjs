using System;

namespace PM.Application.Features.Projects.Project.Queries.GetProjectBoard;

public class TaskItemDto
{
    public Guid Id { get; set; }
    public Guid BoardColumnId { get; set; }
    public string Title { get; set; } = null!;
    public string? TaskType { get; set; }
    public string? Priority { get; set; }
    public int? SortOrder { get; set; }
    public Guid? AssigneeUserId { get; set; }
    public string? AssigneeAvatar { get; set; }
    public string? AssigneeName { get; set; }
    public DateTime? DueDate { get; set; }
}
