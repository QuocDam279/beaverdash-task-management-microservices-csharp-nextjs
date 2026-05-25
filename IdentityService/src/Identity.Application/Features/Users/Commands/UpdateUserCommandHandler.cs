using System;
using System.Threading;
using System.Threading.Tasks;
using EventBus.Messages.Events;
using Identity.Domain.Entities;
using Identity.Application.Contracts;
using MassTransit;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Identity.Application.Features.Users.Commands;

public class UpdateUserCommandHandler : IRequestHandler<UpdateUserCommand, bool>
{
    private readonly IIdentityDbContext _dbContext;
    private readonly IPublishEndpoint _publishEndpoint;

    public UpdateUserCommandHandler(IIdentityDbContext dbContext, IPublishEndpoint publishEndpoint)
    {
        _dbContext = dbContext;
        _publishEndpoint = publishEndpoint;
    }

    public async Task<bool> Handle(UpdateUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _dbContext.Users
            .FirstOrDefaultAsync(u => u.Id == request.Id, cancellationToken);

        if (user == null)
            return false;

        user.Email = request.Email;
        user.DisplayName = request.DisplayName;
        user.Avatar = request.Avatar;
        user.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);

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
