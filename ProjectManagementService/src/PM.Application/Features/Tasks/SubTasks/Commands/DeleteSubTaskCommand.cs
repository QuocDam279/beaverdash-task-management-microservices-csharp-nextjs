using MediatR;
using System;

namespace PM.Application.Features.Tasks.SubTasks.Commands;

public class DeleteSubTaskCommand : IRequest<bool>
{
    public Guid SubTaskId { get; set; }
}
