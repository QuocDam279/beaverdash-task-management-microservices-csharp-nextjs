using MediatR;
using System;

namespace PM.Application.Features.Sprints.Commands;

public record StartSprintCommand(Guid SprintId) : IRequest<bool>;
