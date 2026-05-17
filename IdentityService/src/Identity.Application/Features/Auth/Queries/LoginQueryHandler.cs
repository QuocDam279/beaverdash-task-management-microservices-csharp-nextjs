using System.Threading;
using System.Threading.Tasks;
using Identity.Application.Contracts;

using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Identity.Application.Features.Auth.Queries;

public class LoginQueryHandler : IRequestHandler<LoginQuery, string?>
{
    private readonly IIdentityDbContext _dbContext;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;

    public LoginQueryHandler(IIdentityDbContext dbContext, IJwtTokenGenerator jwtTokenGenerator)
    {
        _dbContext = dbContext;
        _jwtTokenGenerator = jwtTokenGenerator;
    }

    public async Task<string?> Handle(LoginQuery request, CancellationToken cancellationToken)
    {
        var user = await _dbContext.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email && u.GoogleId == request.GoogleId, cancellationToken);

        if (user == null)
        {
            return null;
        }

        return _jwtTokenGenerator.GenerateToken(user);
    }
}

