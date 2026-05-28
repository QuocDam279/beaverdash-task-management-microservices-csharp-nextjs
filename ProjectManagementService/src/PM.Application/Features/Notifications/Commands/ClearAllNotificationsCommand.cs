using MediatR;

namespace PM.Application.Features.Notifications.Commands;

public record ClearAllNotificationsCommand : IRequest<bool>;
