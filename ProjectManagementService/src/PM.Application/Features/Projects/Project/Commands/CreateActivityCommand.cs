using MediatR;
using System;

namespace PM.Application.Features.Projects.Project.Commands;

public record CreateActivityCommand(
    Guid ProjectId,
    string? EntityType,
    Guid? EntityId,
    string? ActionType,
    string? OldValue,
    string? NewValue) : IRequest<Unit>;
