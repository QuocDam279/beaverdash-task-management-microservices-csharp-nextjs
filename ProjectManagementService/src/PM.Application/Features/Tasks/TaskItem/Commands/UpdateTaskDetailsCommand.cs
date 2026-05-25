using MediatR;
using System;

namespace PM.Application.Features.Tasks.TaskItem.Commands;

public class UpdateTaskDetailsDto
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public Guid? AssigneeUserId { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime? StartDate { get; set; }
    public string? Priority { get; set; }
}

public class UpdateTaskDetailsCommand : IRequest<bool>
{
    public Guid TaskId { get; set; }
    public string? Title { get; set; }
    public string? Description { get; set; }
    public Guid? AssigneeUserId { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime? StartDate { get; set; }
    public string? Priority { get; set; }
}
