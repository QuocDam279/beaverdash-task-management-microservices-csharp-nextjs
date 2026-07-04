using Identity.Application.Contracts;
using Identity.Domain.Entities;
using MassTransit;
using MediatR;
using EventBus.Messages.Events;

namespace Identity.Application.Features.Auth.Commands;

public record GoogleLoginCommand(string IdToken) : IRequest<GoogleLoginResponse?>;

public record GoogleLoginResponse(string Token, GoogleLoginUserDto User);

public record GoogleLoginUserDto(Guid Id, string Email, string DisplayName, string? Avatar, DateTime CreatedAt);

public class GoogleLoginCommandHandler : IRequestHandler<GoogleLoginCommand, GoogleLoginResponse?>
{
    private readonly IUserRepository _userRepository;
    private readonly IGoogleTokenValidator _tokenValidator;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly IPublishEndpoint _publishEndpoint;

    public GoogleLoginCommandHandler(
        IUserRepository userRepository,
        IGoogleTokenValidator tokenValidator,
        IJwtTokenGenerator jwtTokenGenerator,
        IPublishEndpoint publishEndpoint)
    {
        _userRepository = userRepository;
        _tokenValidator = tokenValidator;
        _jwtTokenGenerator = jwtTokenGenerator;
        _publishEndpoint = publishEndpoint;
    }

    public async Task<GoogleLoginResponse?> Handle(GoogleLoginCommand request, CancellationToken cancellationToken)
    {
        var payload = await _tokenValidator.ValidateAsync(request.IdToken);
        if (payload == null) return null;

        // Find user by GoogleId or Email
        var user = await _userRepository.GetByGoogleIdOrEmailAsync(payload.GoogleId, payload.Email, cancellationToken);

        bool isNewUser = false;
        bool isModified = false;

        if (user == null)
        {
            user = new User
            {
                Id = Guid.CreateVersion7(),
                GoogleId = payload.GoogleId,
                Email = payload.Email.ToLowerInvariant(),
                DisplayName = payload.DisplayName,
                Avatar = payload.Avatar,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _userRepository.AddAsync(user, cancellationToken);
            isNewUser = true;
        }
        else
        {
            // Update details if changed (avoid overwriting existing DisplayName and Avatar with Google default values)
            if (string.IsNullOrEmpty(user.GoogleId) || user.GoogleId != payload.GoogleId)
            {
                user.GoogleId = payload.GoogleId;
                isModified = true;
            }
            if (string.IsNullOrEmpty(user.DisplayName))
            {
                user.DisplayName = payload.DisplayName;
                isModified = true;
            }
            if (string.IsNullOrEmpty(user.Avatar) && !string.IsNullOrEmpty(payload.Avatar))
            {
                user.Avatar = payload.Avatar;
                isModified = true;
            }

            if (isModified)
            {
                user.UpdatedAt = DateTime.UtcNow;
            }
        }

        await _userRepository.SaveChangesAsync(cancellationToken);

        // Publish events to RabbitMQ via MassTransit to sync with other services
        if (isNewUser)
        {
            var userCreatedEvent = new UserCreatedEvent
            {
                Id = user.Id,
                Email = user.Email,
                DisplayName = user.DisplayName,
                Avatar = user.Avatar
            };

            await _publishEndpoint.Publish(userCreatedEvent, cancellationToken);
        }
        else if (isModified)
        {
            var userUpdatedEvent = new UserUpdatedEvent
            {
                Id = user.Id,
                Email = user.Email,
                DisplayName = user.DisplayName,
                Avatar = user.Avatar
            };

            await _publishEndpoint.Publish(userUpdatedEvent, cancellationToken);
        }

        var localToken = _jwtTokenGenerator.GenerateToken(user);
        var userDto = new GoogleLoginUserDto(user.Id, user.Email, user.DisplayName, user.Avatar, user.CreatedAt);

        return new GoogleLoginResponse(localToken, userDto);
    }
}
