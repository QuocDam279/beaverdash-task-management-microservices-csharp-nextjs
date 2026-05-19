using System.Threading.Tasks;

namespace PM.Application.Contracts;

public interface INotificationService
{
    Task SendNotificationToUserAsync(string userId, object notificationData);
}
