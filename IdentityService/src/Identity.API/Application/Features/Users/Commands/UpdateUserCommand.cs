using System;
using MediatR;

namespace Identity.Application.Features.Users.Commands;

public record UpdateUserCommand(
    Guid Id,
    string Email,
    string DisplayName,
    string? Avatar) : IRequest<bool>;
