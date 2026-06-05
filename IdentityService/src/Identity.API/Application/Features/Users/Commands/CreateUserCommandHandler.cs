using System;
using System.Threading;
using System.Threading.Tasks;
using EventBus.Messages.Events;
using Identity.Domain.Entities;
using Identity.Application.Contracts;
using MassTransit;
using MediatR;

namespace Identity.Application.Features.Users.Commands;

public class CreateUserCommandHandler : IRequestHandler<CreateUserCommand, Guid>
{
    private readonly IUserRepository _userRepository;
    private readonly IPublishEndpoint _publishEndpoint;

    public CreateUserCommandHandler(IUserRepository userRepository, IPublishEndpoint publishEndpoint)
    {
        _userRepository = userRepository;
        _publishEndpoint = publishEndpoint;
    }

    public async Task<Guid> Handle(CreateUserCommand request, CancellationToken cancellationToken)
    {
        var user = new User
        {
            Id = Guid.NewGuid(),
            GoogleId = request.GoogleId,
            Email = request.Email.ToLowerInvariant(),
            DisplayName = request.DisplayName,
            Avatar = request.Avatar,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _userRepository.AddAsync(user, cancellationToken);
        await _userRepository.SaveChangesAsync(cancellationToken);

        var userCreatedEvent = new UserCreatedEvent
        {
            Id = user.Id,
            Email = user.Email,
            DisplayName = user.DisplayName,
            Avatar = user.Avatar
        };

        await _publishEndpoint.Publish(userCreatedEvent, cancellationToken);

        return user.Id;
    }
}

