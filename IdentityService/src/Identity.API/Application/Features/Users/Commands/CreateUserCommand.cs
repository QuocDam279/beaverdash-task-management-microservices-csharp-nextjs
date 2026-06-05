using System;
using MediatR;

namespace Identity.Application.Features.Users.Commands;

public record CreateUserCommand(
    string GoogleId,
    string Email,
    string DisplayName,
    string? Avatar) : IRequest<Guid>;
