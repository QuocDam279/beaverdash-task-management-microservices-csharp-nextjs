using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace PM.API.Hubs;

// Comment [Authorize] tạm thời để dễ test (tránh lỗi 401 khi test SignalR từ Postman nếu chưa setup token chuẩn)
// Tùy theo thiết kế, bạn có thể uncomment để bật bảo mật.
// [Authorize] 
public class NotificationHub : Hub
{
    // Để trống. SignalR sẽ tự động map Connection ID với UserId (từ ClaimTypes.NameIdentifier) khi kết nối.
}
