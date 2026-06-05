using Identity.Domain.Entities;

namespace Identity.Application.Contracts;

public interface IJwtTokenGenerator
{
    string GenerateToken(User user);
}
