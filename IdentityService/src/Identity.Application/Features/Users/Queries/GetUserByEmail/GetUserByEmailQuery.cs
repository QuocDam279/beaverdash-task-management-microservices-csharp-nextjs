using MediatR;
using Microsoft.EntityFrameworkCore;
using Identity.Application.Contracts;
using System.Threading;
using System.Threading.Tasks;
using System;

namespace Identity.Application.Features.Users.Queries.GetUserByEmail;

public record UserDto(Guid Id, string Email, string DisplayName, string? Avatar, DateTime CreatedAt);

public record GetUserByEmailQuery(string Email) : IRequest<UserDto?>;

public class GetUserByEmailQueryHandler : IRequestHandler<GetUserByEmailQuery, UserDto?>
{
    private readonly IIdentityDbContext _dbContext;

    public GetUserByEmailQueryHandler(IIdentityDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<UserDto?> Handle(GetUserByEmailQuery request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(request.Email)) return null;

        var user = await _dbContext.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower(), cancellationToken);

        if (user == null) return null;

        return new UserDto(user.Id, user.Email, user.DisplayName, user.Avatar, user.CreatedAt);
    }
}
