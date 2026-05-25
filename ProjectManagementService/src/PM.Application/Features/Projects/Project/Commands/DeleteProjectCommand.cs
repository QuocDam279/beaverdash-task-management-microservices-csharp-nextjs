using MediatR;
using System;

namespace PM.Application.Features.Projects.Project.Commands;

public class DeleteProjectCommand : IRequest<bool>
{
    public Guid ProjectId { get; set; }
}
