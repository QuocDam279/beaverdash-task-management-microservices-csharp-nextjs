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
    private readonly IIdentityDbContext _dbContext;
    private readonly IPublishEndpoint _publishEndpoint;

    public CreateUserCommandHandler(IIdentityDbContext dbContext, IPublishEndpoint publishEndpoint)
    {
        _dbContext = dbContext;
        _publishEndpoint = publishEndpoint;
    }

    public async Task<Guid> Handle(CreateUserCommand request, CancellationToken cancellationToken)
    {
        var user = new User
        {
            Id = Guid.NewGuid(),
            GoogleId = request.GoogleId,
            Email = request.Email,
            DisplayName = request.DisplayName,
            Avatar = request.Avatar,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _dbContext.Users.Add(user);
        await _dbContext.SaveChangesAsync(cancellationToken);

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

