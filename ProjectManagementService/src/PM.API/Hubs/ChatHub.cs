using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using PM.Domain.Entities;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace PM.API.Hubs;

public class ChatHub : Hub
{
    private readonly IPMDbContext _dbContext;
    private readonly IHubContext<NotificationHub> _notificationHubContext;

    public ChatHub(IPMDbContext dbContext, IHubContext<NotificationHub> notificationHubContext)
    {
        _dbContext = dbContext;
        _notificationHubContext = notificationHubContext;
    }

    public async Task JoinRoom(string roomType, Guid roomId)
    {
        var connectionUserId = Context.UserIdentifier;
        if (string.IsNullOrEmpty(connectionUserId) || !Guid.TryParse(connectionUserId, out var userId))
        {
            throw new HubException("Bạn chưa đăng nhập hoặc token không hợp lệ.");
        }

        // Validate access
        bool hasAccess = await VerifyUserAccess(roomType, roomId, userId);
        if (!hasAccess)
        {
            throw new HubException("Bạn không có quyền truy cập cuộc trò chuyện này.");
        }

        var groupName = $"{roomType.ToLower()}_{roomId}";
        await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
        Console.WriteLine($"[ChatHub] User {userId} joined room {groupName}");
    }

    public async Task SendMessage(string roomType, Guid roomId, string content, string? fileUrl = null, string? fileName = null, string? fileType = null, long? fileSize = null)
    {
        var connectionUserId = Context.UserIdentifier;
        if (string.IsNullOrEmpty(connectionUserId) || !Guid.TryParse(connectionUserId, out var userId))
        {
            throw new HubException("Bạn chưa đăng nhập.");
        }

        if (string.IsNullOrWhiteSpace(content) && string.IsNullOrEmpty(fileUrl))
        {
            throw new HubException("Nội dung tin nhắn không được để trống.");
        }

        // Validate access
        bool hasAccess = await VerifyUserAccess(roomType, roomId, userId);
        if (!hasAccess)
        {
            throw new HubException("Bạn không có quyền gửi tin nhắn vào cuộc trò chuyện này.");
        }

        // Save to Database
        var chatMessage = new ChatMessage
        {
            Id = Guid.CreateVersion7(),
            SenderId = userId,
            Content = (content ?? string.Empty).Trim(),
            FileUrl = fileUrl,
            FileName = fileName,
            FileType = fileType,
            FileSize = fileSize,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        if (roomType.Equals("project", StringComparison.OrdinalIgnoreCase))
        {
            chatMessage.ProjectId = roomId;
        }
        else if (roomType.Equals("team", StringComparison.OrdinalIgnoreCase))
        {
            chatMessage.TeamId = roomId;
        }
        else
        {
            throw new HubException("Loại phòng trò chuyện không hợp lệ.");
        }

        _dbContext.ChatMessages.Add(chatMessage);
        await _dbContext.SaveChangesAsync();

        // Get sender profile details
        var sender = await _dbContext.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == userId);

        // Broadcast message to group
        var groupName = $"{roomType.ToLower()}_{roomId}";
        await Clients.Group(groupName).SendAsync("ReceiveMessage", new
        {
            Id = chatMessage.Id,
            SenderId = chatMessage.SenderId,
            SenderDisplayName = sender?.DisplayName ?? "Thành viên",
            SenderAvatar = sender?.Avatar,
            SenderEmail = sender?.Email ?? string.Empty,
            Content = chatMessage.Content,
            FileUrl = chatMessage.FileUrl,
            FileName = chatMessage.FileName,
            FileType = chatMessage.FileType,
            FileSize = chatMessage.FileSize,
            CreatedAt = chatMessage.CreatedAt,
            ProjectId = chatMessage.ProjectId,
            TeamId = chatMessage.TeamId
        });

        // Notify other team members globally via NotificationHub
        if (roomType.Equals("project", StringComparison.OrdinalIgnoreCase))
        {
            var project = await _dbContext.Projects.AsNoTracking().FirstOrDefaultAsync(p => p.Id == roomId);
            if (project != null && project.TeamId.HasValue)
            {
                var memberIds = await _dbContext.TeamMembers
                    .Where(tm => tm.TeamId == project.TeamId.Value && tm.UserId != userId)
                    .Select(tm => tm.UserId.ToString())
                    .ToListAsync();

                if (memberIds.Any())
                {
                    await _notificationHubContext.Clients.Users(memberIds).SendAsync("ReceiveGlobalChatNotification", new
                    {
                        ProjectId = project.Id,
                        CreatedAt = chatMessage.CreatedAt
                    });
                }
            }
        }
    }

    public async Task DeleteMessage(string roomType, Guid roomId, Guid messageId)
    {
        var connectionUserId = Context.UserIdentifier;
        if (string.IsNullOrEmpty(connectionUserId) || !Guid.TryParse(connectionUserId, out var userId))
        {
            throw new HubException("Bạn chưa đăng nhập.");
        }

        var message = await _dbContext.ChatMessages
            .FirstOrDefaultAsync(m => m.Id == messageId);

        if (message == null)
        {
            throw new HubException("Tin nhắn không tồn tại.");
        }

        // Only sender can delete their message
        if (message.SenderId != userId)
        {
            throw new HubException("Bạn không có quyền xóa tin nhắn này.");
        }

        // Safety checks
        if (roomType.Equals("project", StringComparison.OrdinalIgnoreCase) && message.ProjectId != roomId)
            throw new HubException("Yêu cầu không hợp lệ.");
        if (roomType.Equals("team", StringComparison.OrdinalIgnoreCase) && message.TeamId != roomId)
            throw new HubException("Yêu cầu không hợp lệ.");

        _dbContext.ChatMessages.Remove(message);
        await _dbContext.SaveChangesAsync();

        var groupName = $"{roomType.ToLower()}_{roomId}";
        await Clients.Group(groupName).SendAsync("MessageDeleted", messageId);
    }

    private async Task<bool> VerifyUserAccess(string roomType, Guid roomId, Guid userId)
    {
        if (roomType.Equals("project", StringComparison.OrdinalIgnoreCase))
        {
            var project = await _dbContext.Projects
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.Id == roomId);

            if (project == null) return false;

            if (project.CreatedByUserId == userId) return true;

            if (project.TeamId.HasValue)
            {
                return await _dbContext.TeamMembers
                    .AnyAsync(tm => tm.TeamId == project.TeamId.Value && tm.UserId == userId);
            }

            return project.IsPublic;
        }
        else if (roomType.Equals("team", StringComparison.OrdinalIgnoreCase))
        {
            var team = await _dbContext.Teams
                .AsNoTracking()
                .Include(t => t.Members)
                .FirstOrDefaultAsync(t => t.Id == roomId);

            if (team == null) return false;

            return team.OwnerUserId == userId || team.Members.Any(m => m.UserId == userId);
        }

        return false;
    }
}
