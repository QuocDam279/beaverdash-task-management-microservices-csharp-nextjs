using MediatR;
using System;

namespace PM.Application.Features.Projects.Project.Commands;

public record CreateProjectCommand(
    Guid? TeamId,
    string Name,
    string? Description,
    Guid CreatedByUserId,
    bool IsPublic = false) : IRequest<Guid>;
