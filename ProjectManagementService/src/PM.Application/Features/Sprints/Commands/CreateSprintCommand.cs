using MediatR;
using System;

namespace PM.Application.Features.Sprints.Commands;

public record CreateSprintCommand(
    Guid ProjectId,
    string Name,
    string? Goal,
    DateTime? StartDate,
    DateTime? EndDate
) : IRequest<Guid>;
