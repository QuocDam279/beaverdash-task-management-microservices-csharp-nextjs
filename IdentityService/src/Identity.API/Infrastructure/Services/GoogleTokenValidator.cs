using System;
using System.Threading.Tasks;
using Google.Apis.Auth;
using Identity.Application.Contracts;

namespace Identity.Infrastructure.Services;

public class GoogleTokenValidator : IGoogleTokenValidator
{
    private readonly string? _clientId;

    public GoogleTokenValidator()
    {
        _clientId = Environment.GetEnvironmentVariable("GOOGLE_CLIENT_ID");
    }

    public async Task<GoogleUserPayload?> ValidateAsync(string idToken)
    {
        try
        {
            if (string.IsNullOrEmpty(idToken))
            {
                return null;
            }

            var settings = new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = !string.IsNullOrEmpty(_clientId) ? new[] { _clientId } : null
            };

            var payload = await GoogleJsonWebSignature.ValidateAsync(idToken, settings);
            if (payload == null) return null;

            return new GoogleUserPayload(
                payload.Subject, // GoogleId
                payload.Email,
                payload.Name,
                payload.Picture
            );
        }
        catch (Exception)
        {
            // Token is invalid or validation failed
            return null;
        }
    }
}
