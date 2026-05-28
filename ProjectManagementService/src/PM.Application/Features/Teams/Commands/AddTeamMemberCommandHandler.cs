using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using PM.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Teams.Commands;

public class AddTeamMemberCommandHandler : IRequestHandler<AddTeamMemberCommand, bool>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IPMDbContext _dbContext;
    private readonly IAIAssistantServiceClient _aiAssistantClient;
    private readonly INotificationService _notificationService;

    public AddTeamMemberCommandHandler(
        IPMDbContext dbContext,
        ICurrentUserService currentUserService,
        IAIAssistantServiceClient aiAssistantClient,
        INotificationService notificationService)
    {
        _currentUserService = currentUserService;
        _dbContext = dbContext;
        _aiAssistantClient = aiAssistantClient;
        _notificationService = notificationService;
    }

    public async Task<bool> Handle(AddTeamMemberCommand request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserService.UserId ?? throw new System.UnauthorizedAccessException();
        // 1. Kiểm tra Team có tồn tại không
        var team = await _dbContext.Teams
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == request.TeamId, cancellationToken);

        if (team == null)
            throw new InvalidOperationException("Team không tồn tại.");

        // 2. Kiểm tra quyền: Người gọi API có phải là leader của team này không?
        var requestingMember = await _dbContext.TeamMembers
            .AsNoTracking()
            .FirstOrDefaultAsync(tm => tm.TeamId == request.TeamId && tm.UserId == currentUserId, cancellationToken);

        if (requestingMember == null || requestingMember.Role != "leader")
            throw new UnauthorizedAccessException("Chỉ có leader mới có quyền thêm thành viên vào team.");

        // 3. Kiểm tra user đã ở trong team chưa
        var existingMember = await _dbContext.TeamMembers
            .AsNoTracking()
            .FirstOrDefaultAsync(tm => tm.TeamId == request.TeamId && tm.UserId == request.UserId, cancellationToken);

        if (existingMember != null)
            throw new InvalidOperationException("User này đã là thành viên của team.");

        // 4. Thêm thành viên mới với quyền mặc định là "member"
        var newMember = new TeamMember
        {
            TeamId = request.TeamId,
            UserId = request.UserId,
            Role = "member",
            JoinedAt = DateTime.UtcNow
        };

        _dbContext.TeamMembers.Add(newMember);
        await _dbContext.SaveChangesAsync(cancellationToken);

        // Tạo thông báo cá nhân cho thành viên được mời
        try
        {
            var notification = new Notification
            {
                Id = Guid.NewGuid(),
                UserId = request.UserId,
                ActorUserId = currentUserId,
                Type = "team_invited",
                Content = $"Bạn đã được thêm vào nhóm '{team.Name}'.",
                ActionUrl = $"/teams/{team.Id}",
                IsRead = false,
                IsSentViaEmail = false,
                CreatedAt = DateTime.UtcNow
            };
            _dbContext.Notifications.Add(notification);
            await _dbContext.SaveChangesAsync(cancellationToken);

            var actorUser = await _dbContext.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == currentUserId, cancellationToken);

            // Phát thông báo qua SignalR
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
                    ActorDisplayName = actorUser?.DisplayName ?? "Unknown User",
                    ActorAvatar = actorUser?.Avatar
                }
            );
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error creating/sending team invitation notification: {ex.Message}");
        }

        // 5. Đồng bộ thành viên dự án sang AIAssistant Service
        // Lấy tất cả dự án thuộc team này
        var projectIds = await _dbContext.Set<PM.Domain.Entities.Project>()
            .Where(p => p.TeamId == request.TeamId)
            .Select(p => p.Id)
            .ToListAsync(cancellationToken);

        // Lấy danh sách thành viên mới nhất của team (bao gồm người vừa thêm)
        var memberIds = await _dbContext.TeamMembers
            .Where(tm => tm.TeamId == request.TeamId)
            .Select(tm => tm.UserId)
            .ToListAsync(cancellationToken);

        // Đồng bộ cho từng dự án
        foreach (var projectId in projectIds)
        {
            await _aiAssistantClient.SyncProjectMembersAsync(projectId, memberIds);
        }

        return true;
    }
}
