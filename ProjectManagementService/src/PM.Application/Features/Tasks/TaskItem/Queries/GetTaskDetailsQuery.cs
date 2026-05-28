using MediatR;
using System;
using System.Collections.Generic;

namespace PM.Application.Features.Tasks.TaskItem.Queries;

public class TaskDetailsDto
{
    public Guid Id { get; set; }
    public Guid BoardColumnId { get; set; }
    public Guid ProjectId { get; set; }
    public string ProjectName { get; set; } = null!;
    public Guid? TeamId { get; set; }
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public string? Priority { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? ProjectStartDate { get; set; }
    public DateTime? ProjectDueDate { get; set; }
    public double? SortOrder { get; set; }
    public string? CreatedByName { get; set; }
    public string? CreatedByAvatar { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<SubTaskDto> SubTasks { get; set; } = new();
}

public class SubTaskDto
{
    public Guid Id { get; set; }
    public Guid TaskId { get; set; }
    public string Title { get; set; } = null!;
    public bool IsCompleted { get; set; }
    public DateTime? DueDate { get; set; }
    public int? SortOrder { get; set; }
    public Guid? AssigneeUserId { get; set; }
    public string? AssigneeName { get; set; }
    public string? AssigneeAvatar { get; set; }
    public string? Priority { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<CommentDto> Comments { get; set; } = new();
}

public class CommentDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string UserName { get; set; } = null!;
    public string? UserAvatar { get; set; }
    public Guid SubTaskId { get; set; }
    public string Content { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public record GetTaskDetailsQuery(Guid TaskId) : IRequest<TaskDetailsDto?>;
