using MediatR;
using System;
using System.Collections.Generic;

namespace PM.Application.Features.Sprints.Commands;

public record MoveTaskToSprintCommand(
    List<Guid> TaskIds,
    Guid? SprintId,
    Guid ProjectId
) : IRequest<bool>;
