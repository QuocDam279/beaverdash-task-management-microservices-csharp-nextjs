using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using PM.Domain.Entities;
using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Projects.Project.Commands;

public class ShareProjectCommandHandler : IRequestHandler<ShareProjectCommand, bool>
{
    private readonly IPMDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;
    private readonly IEmailService _emailService;

    public ShareProjectCommandHandler(
        IPMDbContext dbContext,
        ICurrentUserService currentUserService,
        IEmailService emailService)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
        _emailService = emailService;
    }

    public async Task<bool> Handle(ShareProjectCommand request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("Bạn chưa đăng nhập.");

        var project = await _dbContext.Projects
            .FirstOrDefaultAsync(p => p.Id == request.ProjectId, cancellationToken);

        if (project == null)
            throw new KeyNotFoundException("Dự án không tồn tại.");

        if (!project.TeamId.HasValue)
            throw new InvalidOperationException("Dự án không hợp lệ.");

        // Check if the current user is the team leader
        var requestingMember = await _dbContext.TeamMembers
            .FirstOrDefaultAsync(tm => tm.TeamId == project.TeamId.Value && tm.UserId == currentUserId, cancellationToken);

        if (requestingMember == null || requestingMember.Role != "leader")
            throw new UnauthorizedAccessException("Chỉ có trưởng nhóm mới có quyền chia sẻ dự án này.");

        // 1. Ensure project has a share token and link sharing is enabled
        project.IsPublic = true;
        if (string.IsNullOrEmpty(project.ShareToken))
        {
            project.ShareToken = Guid.CreateVersion7().ToString("N");
        }
        project.UpdatedAt = DateTime.UtcNow;

        // 2. Save project share record
        var email = request.RecipientEmail.Trim().ToLower();
        var exists = await _dbContext.ProjectShares
            .AnyAsync(ps => ps.ProjectId == project.Id && ps.RecipientEmail == email, cancellationToken);

        if (!exists)
        {
            var share = new ProjectShare
            {
                Id = Guid.CreateVersion7(),
                ProjectId = project.Id,
                RecipientEmail = email,
                SharedByUserId = currentUserId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _dbContext.ProjectShares.Add(share);
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        // 3. Send email notification
        var senderUser = await _dbContext.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == currentUserId, cancellationToken);
        var senderName = senderUser?.DisplayName ?? "Một trưởng nhóm";

        var frontendBaseUrl = Environment.GetEnvironmentVariable("FRONTEND_BASE_URL") ?? "https://www.beaverdash.xyz";
        var logoUrl = Environment.GetEnvironmentVariable("EMAIL_LOGO_URL") ?? "";
        var actionUrl = $"{frontendBaseUrl}/shared/projects/{project.ShareToken}";

        var subject = $"Dự án \"{project.Name}\" đã được chia sẻ với bạn trên Beaverdash";
        
        var logoHtml = !string.IsNullOrWhiteSpace(logoUrl)
            ? $@"<img src=""{System.Net.WebUtility.HtmlEncode(logoUrl)}"" alt=""Beaverdash Logo"" width=""36"" height=""36"" style=""display: block; border: 0; border-radius: 6px;"" />"
            : @"<div style=""width: 36px; height: 36px; background: linear-gradient(135deg, #1868db 0%, #0747a6 100%); border-radius: 6px; text-align: center; line-height: 36px; font-size: 20px; color: #ffffff;"">🦫</div>";

        var emailBody = $@"
<!DOCTYPE html>
<html lang=""vi"">
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>Chia sẻ dự án Beaverdash</title>
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
                                        <span style=""font-size: 12px; color: #505258; font-weight: 500; background-color: #dfe1e6; padding: 4px 10px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px;"">Chia sẻ dự án</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Content Body -->
                    <tr>
                        <td style=""padding: 32px 40px 40px 40px;"">
                            <p style=""margin: 0 0 18px 0; font-size: 15px; font-weight: 500; color: #292a2e;"">
                                Xin chào,
                            </p>

                            <p style=""margin: 0 0 24px 0; font-size: 14px; color: #505258; line-height: 1.5;"">
                                <strong>{System.Net.WebUtility.HtmlEncode(senderName)}</strong> đã chia sẻ dự án sau đây với bạn:
                            </p>

                            <!-- Notification Bubble (Atlassian Style Card) -->
                            <table role=""presentation"" width=""100%"" cellspacing=""0"" cellpadding=""0"" style=""background-color: #fafbfc; border: 1px solid #dfe1e6; border-radius: 6px; border-left: 4px solid #1868db;"">
                                <tr>
                                    <td style=""padding: 20px 24px;"">
                                        <p style=""margin: 0 0 8px 0; font-size: 16px; color: #292a2e; font-weight: 600;"">
                                            {System.Net.WebUtility.HtmlEncode(project.Name)}
                                        </p>
                                        <p style=""margin: 0; font-size: 13px; color: #505258; line-height: 1.5;"">
                                            {System.Net.WebUtility.HtmlEncode(project.Description ?? "Không có mô tả.")}
                                        </p>
                                    </td>
                                </tr>
                              </table>

                              <p style=""margin: 24px 0 12px 0; font-size: 13px; color: #505258; line-height: 1.5;"">
                                  Bạn cần đăng nhập vào Beaverdash bằng tài khoản trùng khớp với email này để truy cập và xem chi tiết dự án.
                              </p>

                              <!-- CTA Button -->
                              <table role=""presentation"" width=""100%"" cellspacing=""0"" cellpadding=""0"" style=""margin-top: 24px;"">
                                  <tr>
                                      <td align=""left"">
                                          <a href=""{System.Net.WebUtility.HtmlEncode(actionUrl)}"" style=""display: inline-block; background-color: #1868db; color: #ffffff !important; text-decoration: none; padding: 10px 20px; border-radius: 4px; font-size: 14px; font-weight: 600;"" target=""_blank"">
                                              Truy cập dự án
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
                              <p style=""margin: 0;"">Vui lòng không trả lời trực tiếp email này.</p>
                          </td>
                      </tr>
                  </table>
              </td>
          </tr>
      </table>
  </body>
  </html>";

        try
        {
            await _emailService.SendEmailAsync(email, subject, emailBody, isHtml: true);
        }
        catch (Exception ex)
        {
            // Log warning but don't fail transaction if email sending fails (e.g. SMTP config missing)
            Console.WriteLine($"[ShareProject] Gửi email chia sẻ thất bại: {ex.Message}");
        }

        return true;
    }
}
