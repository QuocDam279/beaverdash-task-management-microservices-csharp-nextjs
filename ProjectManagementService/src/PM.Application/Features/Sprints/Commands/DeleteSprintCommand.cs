using MediatR;
using System;

namespace PM.Application.Features.Sprints.Commands;

public record DeleteSprintCommand(Guid SprintId) : IRequest<bool>;
