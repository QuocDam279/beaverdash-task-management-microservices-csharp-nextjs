using System;
using System.Collections.Generic;

namespace PM.Application.Features.Projects.Project.Queries.GetProjectBoard;

public class SubTaskBoardDto
{
    public Guid Id { get; set; }
    public Guid TaskId { get; set; }
    public string Title { get; set; } = null!;
    public bool IsCompleted { get; set; }
    public Guid? AssigneeUserId { get; set; }
    public string? AssigneeAvatar { get; set; }
    public string? AssigneeName { get; set; }
}

public class TaskItemDto
{
    public Guid Id { get; set; }
    public Guid BoardColumnId { get; set; }
    public string Title { get; set; } = null!;
    public string? Priority { get; set; }
    public double? SortOrder { get; set; }
    public Guid? AssigneeUserId { get; set; }
    public string? AssigneeAvatar { get; set; }
    public string? AssigneeName { get; set; }
    public string? Description { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? DueDate { get; set; }
    public int SubTasksCount { get; set; }
    public int CompletedSubTasksCount { get; set; }
    public int CommentsCount { get; set; }
    public List<SubTaskBoardDto> SubTasks { get; set; } = new();
}
