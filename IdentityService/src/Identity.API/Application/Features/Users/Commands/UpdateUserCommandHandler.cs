using System;
using System.Threading;
using System.Threading.Tasks;
using EventBus.Messages.Events;
using Identity.Domain.Entities;
using Identity.Application.Contracts;
using MassTransit;
using MediatR;

namespace Identity.Application.Features.Users.Commands;

public class UpdateUserCommandHandler : IRequestHandler<UpdateUserCommand, bool>
{
    private readonly IUserRepository _userRepository;
    private readonly IPublishEndpoint _publishEndpoint;

    public UpdateUserCommandHandler(IUserRepository userRepository, IPublishEndpoint publishEndpoint)
    {
        _userRepository = userRepository;
        _publishEndpoint = publishEndpoint;
    }

    public async Task<bool> Handle(UpdateUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.Id, cancellationToken);

        if (user == null)
            return false;

        user.Email = request.Email.ToLowerInvariant();
        user.DisplayName = request.DisplayName;
        user.Avatar = request.Avatar;
        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.SaveChangesAsync(cancellationToken);

        var userUpdatedEvent = new UserUpdatedEvent
        {
            Id = user.Id,
            Email = user.Email,
            DisplayName = user.DisplayName,
            Avatar = user.Avatar
        };

        await _publishEndpoint.Publish(userUpdatedEvent, cancellationToken);

        return true;
    }
}
