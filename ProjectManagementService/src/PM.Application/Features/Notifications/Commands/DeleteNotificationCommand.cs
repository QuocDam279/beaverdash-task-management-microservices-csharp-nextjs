using MediatR;
using System;

namespace PM.Application.Features.Notifications.Commands;

public record DeleteNotificationCommand : IRequest<bool>
{
    public Guid NotificationId { get; init; }
}
