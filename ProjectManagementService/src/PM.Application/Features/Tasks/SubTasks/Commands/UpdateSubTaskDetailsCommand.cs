using MediatR;
using System;

namespace PM.Application.Features.Tasks.SubTasks.Commands;

public class UpdateSubTaskDetailsDto
{
    public string Title { get; set; } = null!;
    public Guid? AssigneeUserId { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? DueDate { get; set; }
    public bool IsCompleted { get; set; }
}

public class UpdateSubTaskDetailsCommand : IRequest<bool>
{
    public Guid SubTaskId { get; set; }
    public string Title { get; set; } = null!;
    public Guid? AssigneeUserId { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? DueDate { get; set; }
    public bool IsCompleted { get; set; }
}
