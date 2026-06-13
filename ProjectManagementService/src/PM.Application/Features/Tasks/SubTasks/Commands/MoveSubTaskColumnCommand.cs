using MediatR;
using System;

namespace PM.Application.Features.Tasks.SubTasks.Commands;

public class MoveSubTaskColumnCommand : IRequest<bool>
{
    public Guid SubTaskId { get; set; }
    public Guid BoardColumnId { get; set; }
}
