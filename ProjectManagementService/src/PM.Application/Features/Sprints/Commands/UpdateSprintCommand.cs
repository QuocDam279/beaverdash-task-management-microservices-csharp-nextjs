using MediatR;
using System;

namespace PM.Application.Features.Sprints.Commands;

public record UpdateSprintCommand(
    Guid SprintId,
    string Name,
    string? Goal,
    DateTime? StartDate,
    DateTime? EndDate
) : IRequest<bool>;
