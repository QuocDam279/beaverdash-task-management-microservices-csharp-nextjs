using MediatR;
using System;

namespace PM.Application.Features.Tasks.TaskItem.Commands;

public class UpdateTaskDetailsDto
{
    public Guid? AssigneeUserId { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime? StartDate { get; set; }
    public string? Priority { get; set; }
    
    // Giả lập người thực hiện hành động
    public Guid RequestingUserId { get; set; }
}

public class UpdateTaskDetailsCommand : IRequest<bool>
{
    public Guid TaskId { get; set; }
    public Guid? AssigneeUserId { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime? StartDate { get; set; }
    public string? Priority { get; set; }
    public Guid RequestingUserId { get; set; }
}
