using Microsoft.AspNetCore.SignalR;
using PM.API.Hubs;
using PM.Application.Contracts;
using System.Threading.Tasks;

namespace PM.API.Services;

public class SignalRNotificationService : INotificationService
{
    private readonly IHubContext<NotificationHub> _hubContext;

    public SignalRNotificationService(IHubContext<NotificationHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task SendNotificationToUserAsync(string userId, object notificationData)
    {
        await _hubContext.Clients.User(userId).SendAsync("ReceiveNotification", notificationData);
    }
}
