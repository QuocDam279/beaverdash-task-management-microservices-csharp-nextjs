using MediatR;

namespace Identity.Application.Features.Auth.Queries;

public record LoginQuery(string Email, string GoogleId) : IRequest<string?>;
