using MediatR;
using System;

namespace PM.Application.Features.Teams.Commands;

public class CreateTeamCommand : IRequest<Guid>
{
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
}
