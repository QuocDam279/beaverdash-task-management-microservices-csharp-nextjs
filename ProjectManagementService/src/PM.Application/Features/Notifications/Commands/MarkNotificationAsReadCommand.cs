using MediatR;
using System;

namespace PM.Application.Features.Notifications.Commands;

public class MarkNotificationAsReadDto
{
    // Giả lập ID của người thực hiện API (lấy từ JWT token trong thực tế)
}

public class MarkNotificationAsReadCommand : IRequest<bool>
{
    public Guid NotificationId { get; set; }
}
