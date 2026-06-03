using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using PM.API.Hubs;
using PM.Application.Contracts;
using System;
using System.Threading.Tasks;

namespace PM.API.Services;

public class SignalRNotificationService : INotificationService
{
    private readonly IHubContext<NotificationHub> _hubContext;
    private readonly IServiceProvider _serviceProvider;

    public SignalRNotificationService(IHubContext<NotificationHub> hubContext, IServiceProvider serviceProvider)
    {
        _hubContext = hubContext;
        _serviceProvider = serviceProvider;
    }

    public async Task SendNotificationToUserAsync(string userId, object notificationData)
    {
        // 1. Gửi thông báo real-time qua SignalR (in-app)
        await _hubContext.Clients.User(userId).SendAsync("ReceiveNotification", notificationData);

        // 2. Gửi thông báo qua email (chạy nền, không chặn luồng chính)
        _ = Task.Run(async () =>
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var dbContext = scope.ServiceProvider.GetRequiredService<IPMDbContext>();
                var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();

                // Lấy Guid từ userId
                if (!Guid.TryParse(userId, out var userGuid))
                    return;

                // Truy vấn thông tin người dùng để lấy email
                var user = await dbContext.Users
                    .AsNoTracking()
                    .FirstOrDefaultAsync(u => u.Id == userGuid);

                if (user == null || string.IsNullOrWhiteSpace(user.Email))
                {
                    Console.WriteLine($"[EmailNotification] User {userId} not found or has no email. Skipping email.");
                    return;
                }

                // Sử dụng JSON serialization để lấy dữ liệu từ notificationData an toàn, tránh lỗi reflection trên anonymous types khác assembly
                var json = System.Text.Json.JsonSerializer.Serialize(notificationData);
                using var jsonDoc = System.Text.Json.JsonDocument.Parse(json);
                var root = jsonDoc.RootElement;

                var content = root.TryGetProperty("Content", out var pContent) ? pContent.GetString() ?? "Bạn có thông báo mới." : "Bạn có thông báo mới.";
                var type = root.TryGetProperty("Type", out var pType) ? pType.GetString() ?? "notification" : "notification";
                var actionUrl = root.TryGetProperty("ActionUrl", out var pActionUrl) ? pActionUrl.GetString() ?? "" : "";
                var actorDisplayName = root.TryGetProperty("ActorDisplayName", out var pActor) ? pActor.GetString() ?? "Một đồng nghiệp" : "Một đồng nghiệp";
                
                Guid? notificationId = null;
                if (root.TryGetProperty("Id", out var pId) && pId.ValueKind == System.Text.Json.JsonValueKind.String)
                {
                    if (Guid.TryParse(pId.GetString(), out var parsedId))
                    {
                        notificationId = parsedId;
                    }
                }

                // Tạo link đầy đủ tới frontend
                var frontendBaseUrl = Environment.GetEnvironmentVariable("FRONTEND_BASE_URL") ?? "http://localhost:3000";
                var fullActionUrl = !string.IsNullOrEmpty(actionUrl) ? $"{frontendBaseUrl}{actionUrl}" : frontendBaseUrl;

                // Tạo tiêu đề email dựa trên loại thông báo
                var subject = type switch
                {
                    "subtask_assigned" => "Bạn được giao một công việc con mới - Beaverdash",
                    "subtask_comment" => "Có bình luận mới trên công việc con của bạn - Beaverdash",
                    "team_invited" => "Bạn được mời vào nhóm mới - Beaverdash",
                    _ => "Thông báo mới từ Beaverdash"
                };

                // Tạo label loại thông báo
                var typeLabel = type switch
                {
                    "subtask_assigned" => "Giao công việc",
                    "subtask_comment" => "Bình luận mới",
                    "team_invited" => "Mời tham gia nhóm",
                    _ => "Thông báo"
                };

                // Lấy URL logo từ environment
                var logoUrl = Environment.GetEnvironmentVariable("EMAIL_LOGO_URL") ?? "";

                var emailBody = BuildEmailTemplate(
                    recipientName: user.DisplayName,
                    notificationContent: content,
                    actionUrl: fullActionUrl,
                    actorName: actorDisplayName,
                    typeLabel: typeLabel,
                    logoUrl: logoUrl
                );

                await emailService.SendEmailAsync(user.Email, subject, emailBody, isHtml: true);

                // Cập nhật trạng thái đã gửi email trong database
                if (notificationId.HasValue)
                {
                    var notification = await dbContext.Notifications
                        .FirstOrDefaultAsync(n => n.Id == notificationId.Value);

                    if (notification != null)
                    {
                        notification.IsSentViaEmail = true;
                        notification.EmailSentAt = DateTime.UtcNow;
                        await dbContext.SaveChangesAsync();
                    }
                }

                Console.WriteLine($"[EmailNotification] Email sent successfully to {user.Email} for notification type '{type}'.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[EmailNotification] Failed to send email for user {userId}: {ex.Message}");
            }
        });
    }

    private static string BuildEmailTemplate(
        string recipientName,
        string notificationContent,
        string actionUrl,
        string actorName,
        string typeLabel,
        string logoUrl)
    {
        // Build logo HTML: use image if URL is configured, otherwise use styled text fallback
        var logoHtml = !string.IsNullOrWhiteSpace(logoUrl)
            ? $@"<img src=""{System.Net.WebUtility.HtmlEncode(logoUrl)}"" alt=""Beaverdash Logo"" width=""36"" height=""36"" style=""display: block; border: 0; border-radius: 6px;"" />"
            : @"<div style=""width: 36px; height: 36px; background: linear-gradient(135deg, #1868db 0%, #0747a6 100%); border-radius: 6px; text-align: center; line-height: 36px; font-size: 20px;"">🦫</div>";

        return $@"
<!DOCTYPE html>
<html lang=""vi"">
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>Thông báo từ Beaverdash</title>
</head>
<body style=""margin: 0; padding: 0; background-color: #f4f5f7; font-family: 'Atlassian Sans', ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; -webkit-font-smoothing: antialiased;"">
    <table role=""presentation"" width=""100%"" cellspacing=""0"" cellpadding=""0"" style=""background-color: #f4f5f7; padding: 48px 0;"">
        <tr>
            <td align=""center"">
                <!-- Outer Card -->
                <table role=""presentation"" width=""580"" cellspacing=""0"" cellpadding=""0"" style=""background-color: #ffffff; border-radius: 8px; border: 1px solid #dfe1e6; box-shadow: 0 4px 12px rgba(9, 30, 66, 0.08); overflow: hidden;"">
                    <!-- Brand Top Bar (Atlassian Blue Accent) -->
                    <tr>
                        <td height=""4"" style=""background-color: #1868db; line-height: 4px; font-size: 1px;"">&nbsp;</td>
                    </tr>
                    
                    <!-- Header with Logo -->
                    <tr>
                        <td style=""padding: 32px 40px 24px 40px; text-align: left; border-bottom: 1px solid #f4f5f7;"">
                            <table role=""presentation"" cellspacing=""0"" cellpadding=""0"" style=""width: 100%;"">
                                <tr>
                                    <td style=""vertical-align: middle; width: 40px;"">
                                        {logoHtml}
                                    </td>
                                    <td style=""vertical-align: middle; padding-left: 12px;"">
                                        <span style=""font-size: 18px; font-weight: 600; color: #292a2e; letter-spacing: -0.2px;"">Beaverdash</span>
                                    </td>
                                    <td style=""text-align: right; vertical-align: middle;"">
                                        <span style=""font-size: 12px; color: #505258; font-weight: 500; background-color: #dfe1e6; padding: 4px 10px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px;"">{System.Net.WebUtility.HtmlEncode(typeLabel)}</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Content Body -->
                    <tr>
                        <td style=""padding: 32px 40px 40px 40px;"">
                            <!-- Welcome -->
                            <p style=""margin: 0 0 18px 0; font-size: 15px; font-weight: 500; color: #292a2e;"">
                                Xin chào <span style=""font-weight: 600; color: #292a2e;"">{System.Net.WebUtility.HtmlEncode(recipientName)}</span>,
                            </p>

                            <!-- Description -->
                            <p style=""margin: 0 0 24px 0; font-size: 14px; color: #505258; line-height: 1.5;"">
                                Bạn có hoạt động mới cần xử lý trên hệ thống:
                            </p>

                            <!-- Notification Bubble (Atlassian Style Card) -->
                            <table role=""presentation"" width=""100%"" cellspacing=""0"" cellpadding=""0"" style=""background-color: #fafbfc; border: 1px solid #dfe1e6; border-radius: 6px; border-left: 4px solid #1868db;"">
                                <tr>
                                    <td style=""padding: 20px 24px;"">
                                        <!-- Actor info -->
                                        <table role=""presentation"" cellspacing=""0"" cellpadding=""0"" style=""margin-bottom: 12px;"">
                                            <tr>
                                                <td style=""font-size: 13px; color: #505258;"">
                                                    Tác nhân: <strong style=""color: #292a2e;"">{System.Net.WebUtility.HtmlEncode(actorName)}</strong>
                                                </td>
                                            </tr>
                                        </table>
                                        <!-- Content text -->
                                        <p style=""margin: 0; font-size: 14px; color: #292a2e; line-height: 1.6; font-weight: 500;"">
                                            {System.Net.WebUtility.HtmlEncode(notificationContent)}
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- CTA Button -->
                            <table role=""presentation"" width=""100%"" cellspacing=""0"" cellpadding=""0"" style=""margin-top: 32px;"">
                                <tr>
                                    <td align=""left"">
                                        <a href=""{System.Net.WebUtility.HtmlEncode(actionUrl)}"" style=""display: inline-block; background-color: #1868db; color: #ffffff !important; text-decoration: none; padding: 10px 20px; border-radius: 4px; font-size: 14px; font-weight: 600;"" target=""_blank"">
                                            Xem chi tiết công việc
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style=""background-color: #fafbfc; padding: 24px 40px; border-top: 1px solid #dfe1e6; font-size: 12px; color: #6b6e76; line-height: 1.5;"">
                            <p style=""margin: 0 0 6px 0;"">Đây là email tự động từ hệ thống quản lý dự án <strong>Beaverdash</strong>.</p>
                            <p style=""margin: 0;"">Bạn nhận được thư này do được chỉ định hoặc có liên quan trong công việc.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";
    }
}
