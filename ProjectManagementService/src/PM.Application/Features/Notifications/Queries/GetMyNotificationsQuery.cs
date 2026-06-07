using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Notifications.Queries;

public class NotificationDto
{
    public Guid Id { get; set; }
    public string? Type { get; set; }
    public string? Content { get; set; }
    public string? ActionUrl { get; set; }
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }

    // Thông tin người gây ra sự kiện (Actor User)
    public Guid ActorUserId { get; set; }
    public string ActorDisplayName { get; set; } = null!;
    public string? ActorAvatar { get; set; }
}

public record GetMyNotificationsQuery() : IRequest<List<NotificationDto>>;

public class GetMyNotificationsQueryHandler : IRequestHandler<GetMyNotificationsQuery, List<NotificationDto>>
{
    private readonly IPMDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;

    public GetMyNotificationsQueryHandler(IPMDbContext dbContext, ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
    }

    public async Task<List<NotificationDto>> Handle(GetMyNotificationsQuery request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException();
        var notifications = await _dbContext.Notifications
            .AsNoTracking()
            .Where(n => n.UserId == currentUserId) // Lọc thông báo của mình
            .OrderByDescending(n => n.CreatedAt) // Sắp xếp giảm dần (mới nhất lên trên)
            .Take(50) // Giới hạn lấy tối đa 50 cái
            .Select(n => new NotificationDto
            {
                Id = n.Id,
                Type = n.Type,
                Content = n.Content,
                ActionUrl = n.ActionUrl,
                IsRead = n.IsRead,
                CreatedAt = n.CreatedAt,
                ActorUserId = n.ActorUserId,
                ActorDisplayName = n.ActorUser != null ? n.ActorUser.DisplayName : "Unknown User",
                ActorAvatar = n.ActorUser != null ? n.ActorUser.Avatar : null
            })
            .ToListAsync(cancellationToken);

        return notifications;
    }
}
