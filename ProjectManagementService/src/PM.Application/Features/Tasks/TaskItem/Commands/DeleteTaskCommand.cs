using MediatR;
using System;

namespace PM.Application.Features.Tasks.TaskItem.Commands;

public class DeleteTaskCommand : IRequest<bool>
{
    public Guid TaskId { get; set; }
}
