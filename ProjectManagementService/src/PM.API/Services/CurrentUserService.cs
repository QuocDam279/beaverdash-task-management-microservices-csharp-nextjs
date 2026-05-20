using PM.Application.Contracts;

namespace PM.API.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid? UserId
    {
        get
        {
            var headerValue = _httpContextAccessor.HttpContext?.Request?.Headers["X-User-Id"].FirstOrDefault();
            if (Guid.TryParse(headerValue, out var userId))
            {
                return userId;
            }
            return null;
        }
    }
}
