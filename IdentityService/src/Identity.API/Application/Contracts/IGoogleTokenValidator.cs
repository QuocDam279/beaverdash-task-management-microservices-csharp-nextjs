using System.Threading.Tasks;

namespace Identity.Application.Contracts;

public interface IGoogleTokenValidator
{
    Task<GoogleUserPayload?> ValidateAsync(string idToken);
}

public record GoogleUserPayload(string GoogleId, string Email, string DisplayName, string? Avatar);
