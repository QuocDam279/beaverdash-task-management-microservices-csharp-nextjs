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
    private readonly INotificationService _notificationService;

    public ChatHub(IPMDbContext dbContext, IHubContext<NotificationHub> notificationHubContext, INotificationService notificationService)
    {
        _dbContext = dbContext;
        _notificationHubContext = notificationHubContext;
        _notificationService = notificationService;
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

        // Check for mentions
        var roomUsers = new List<User>();
        string roomName = "";

        if (roomType.Equals("project", StringComparison.OrdinalIgnoreCase))
        {
            var project = await _dbContext.Projects.AsNoTracking().FirstOrDefaultAsync(p => p.Id == roomId);
            if (project != null)
            {
                roomName = project.Name;
                var candidateUserIds = new HashSet<Guid>();
                candidateUserIds.Add(project.CreatedByUserId);

                if (project.TeamId.HasValue)
                {
                    var teamMemberIds = await _dbContext.TeamMembers
                        .Where(tm => tm.TeamId == project.TeamId.Value)
                        .Select(tm => tm.UserId)
                        .ToListAsync();
                    foreach (var id in teamMemberIds) candidateUserIds.Add(id);
                }

                var sharedEmails = await _dbContext.ProjectShares
                    .Where(ps => ps.ProjectId == roomId)
                    .Select(ps => ps.RecipientEmail.ToLower())
                    .ToListAsync();

                if (sharedEmails.Any())
                {
                    var sharedUserIds = await _dbContext.Users
                        .Where(u => sharedEmails.Contains(u.Email.ToLower()))
                        .Select(u => u.Id)
                        .ToListAsync();
                    foreach (var id in sharedUserIds) candidateUserIds.Add(id);
                }

                candidateUserIds.Remove(userId);

                if (candidateUserIds.Any())
                {
                    roomUsers = await _dbContext.Users
                        .AsNoTracking()
                        .Where(u => candidateUserIds.Contains(u.Id))
                        .ToListAsync();
                }
            }
        }
        else if (roomType.Equals("team", StringComparison.OrdinalIgnoreCase))
        {
            var team = await _dbContext.Teams.AsNoTracking().FirstOrDefaultAsync(t => t.Id == roomId);
            if (team != null)
            {
                roomName = team.Name;
                var candidateUserIds = new HashSet<Guid>();
                candidateUserIds.Add(team.OwnerUserId);

                var teamMemberIds = await _dbContext.TeamMembers
                    .Where(tm => tm.TeamId == roomId)
                    .Select(tm => tm.UserId)
                    .ToListAsync();
                foreach (var id in teamMemberIds) candidateUserIds.Add(id);

                candidateUserIds.Remove(userId);

                if (candidateUserIds.Any())
                {
                    roomUsers = await _dbContext.Users
                        .AsNoTracking()
                        .Where(u => candidateUserIds.Contains(u.Id))
                        .ToListAsync();
                }
            }
        }

        var mentionedUsers = new List<User>();
        var messageContent = chatMessage.Content ?? string.Empty;
        bool isMentionAll = IsUserMentioned(messageContent, "all");

        if (isMentionAll)
        {
            mentionedUsers = roomUsers;
        }
        else if (roomUsers.Any())
        {
            var sortedUsers = roomUsers.OrderByDescending(u => u.DisplayName?.Length ?? 0).ToList();
            var tempContent = messageContent;
            foreach (var userItem in sortedUsers)
            {
                bool isMentioned = false;
                if (!string.IsNullOrWhiteSpace(userItem.DisplayName))
                {
                    if (IsUserMentioned(tempContent, userItem.DisplayName))
                    {
                        isMentioned = true;
                        tempContent = ReplaceMention(tempContent, userItem.DisplayName);
                    }
                }

                if (!isMentioned && !string.IsNullOrWhiteSpace(userItem.Email))
                {
                    if (IsUserMentioned(tempContent, userItem.Email))
                    {
                        isMentioned = true;
                        tempContent = ReplaceMention(tempContent, userItem.Email);
                    }
                }

                if (isMentioned)
                {
                    mentionedUsers.Add(userItem);
                }
            }
        }

        if (mentionedUsers.Any())
        {
            var senderDisplayName = sender?.DisplayName ?? "Một đồng nghiệp";
            var senderAvatar = sender?.Avatar;
            var actionUrl = roomType.Equals("project", StringComparison.OrdinalIgnoreCase)
                ? $"/projects/{roomId}/chat"
                : $"/teams/{roomId}";

            var truncatedContent = messageContent.Length > 50
                ? messageContent.Substring(0, 47) + "..."
                : messageContent;

            var notificationContent = roomType.Equals("project", StringComparison.OrdinalIgnoreCase)
                ? $"{senderDisplayName} đã nhắc đến bạn trong cuộc trò chuyện của dự án '{roomName}': \"{truncatedContent}\""
                : $"{senderDisplayName} đã nhắc đến bạn trong cuộc trò chuyện của nhóm '{roomName}': \"{truncatedContent}\"";

            var newNotifications = new List<Notification>();
            foreach (var mentionedUser in mentionedUsers)
            {
                var notification = new Notification
                {
                    Id = Guid.CreateVersion7(),
                    UserId = mentionedUser.Id,
                    ActorUserId = userId,
                    Type = "chat_mention",
                    Content = notificationContent,
                    ActionUrl = actionUrl,
                    IsRead = false,
                    IsSentViaEmail = false,
                    CreatedAt = DateTime.UtcNow
                };

                _dbContext.Notifications.Add(notification);
                newNotifications.Add(notification);
            }

            await _dbContext.SaveChangesAsync();

            // Send Real-time notification and trigger email in background
            foreach (var notification in newNotifications)
            {
                try
                {
                    await _notificationService.SendNotificationToUserAsync(
                        notification.UserId.ToString(),
                        new
                        {
                            Id = notification.Id,
                            Type = notification.Type,
                            Content = notification.Content,
                            ActionUrl = notification.ActionUrl,
                            CreatedAt = notification.CreatedAt,
                            ActorUserId = notification.ActorUserId,
                            ActorDisplayName = senderDisplayName,
                            ActorAvatar = senderAvatar
                        }
                    );
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error sending SignalR chat mention notification: {ex.Message}");
                }
            }
        }

        // Notify other team members globally via NotificationHub (to light up unread chat badge)
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

    private bool IsUserMentioned(string content, string tag)
    {
        if (string.IsNullOrWhiteSpace(content) || string.IsNullOrWhiteSpace(tag))
            return false;

        var tagToFind = "@" + tag;
        int index = 0;
        while ((index = content.IndexOf(tagToFind, index, StringComparison.OrdinalIgnoreCase)) != -1)
        {
            if (index == 0 || char.IsWhiteSpace(content[index - 1]))
            {
                int endOfTag = index + tagToFind.Length;
                if (endOfTag == content.Length || char.IsWhiteSpace(content[endOfTag]) || char.IsPunctuation(content[endOfTag]))
                {
                    return true;
                }
            }
            index += tagToFind.Length;
        }
        return false;
    }

    private string ReplaceMention(string content, string tag)
    {
        var tagToFind = "@" + tag;
        int index = 0;
        while ((index = content.IndexOf(tagToFind, index, StringComparison.OrdinalIgnoreCase)) != -1)
        {
            if (index == 0 || char.IsWhiteSpace(content[index - 1]))
            {
                int endOfTag = index + tagToFind.Length;
                if (endOfTag == content.Length || char.IsWhiteSpace(content[endOfTag]) || char.IsPunctuation(content[endOfTag]))
                {
                    content = content.Remove(index, tagToFind.Length).Insert(index, new string(' ', tagToFind.Length));
                }
            }
            index += tagToFind.Length;
        }
        return content;
    }
}
