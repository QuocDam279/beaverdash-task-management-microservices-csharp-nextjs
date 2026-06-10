using MediatR;
using System;

namespace PM.Application.Features.Sprints.Commands;

public enum UncompletedTaskAction
{
    MoveToBacklog,
    MoveToNextSprint
}

public record CloseSprintCommand(
    Guid SprintId,
    UncompletedTaskAction Action,
    Guid? MoveToSprintId
) : IRequest<bool>;
