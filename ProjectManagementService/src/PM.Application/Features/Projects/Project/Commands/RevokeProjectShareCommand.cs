using MediatR;
using System;

namespace PM.Application.Features.Projects.Project.Commands;

public record RevokeProjectShareCommand(Guid ProjectId, string RecipientEmail) : IRequest<bool>;
