using Microsoft.AspNetCore.SignalR;
using System.Linq;

namespace PM.API.Services;

public class CustomUserIdProvider : IUserIdProvider
{
    public string? GetUserId(HubConnectionContext connection)
    {
        var httpContext = connection.GetHttpContext();
        if (httpContext != null)
        {
            // Read user ID passed by ApiGateway in X-User-Id header
            var userId = httpContext.Request.Headers["X-User-Id"].FirstOrDefault();
            if (!string.IsNullOrEmpty(userId))
            {
                return userId;
            }

            // Fallback for query string
            var queryUserId = httpContext.Request.Query["userId"].FirstOrDefault();
            if (!string.IsNullOrEmpty(queryUserId))
            {
                return queryUserId;
            }
        }
        return null;
    }
}
