using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Notifications.Commands;

public class MarkNotificationAsReadCommandHandler : IRequestHandler<MarkNotificationAsReadCommand, bool>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IPMDbContext _dbContext;

    public MarkNotificationAsReadCommandHandler(IPMDbContext dbContext, ICurrentUserService currentUserService)
    {
        _currentUserService = currentUserService;
        _dbContext = dbContext;
    }

    public async Task<bool> Handle(MarkNotificationAsReadCommand request, CancellationToken cancellationToken)
    {
        // 1. Kiểm tra thông báo có tồn tại không
        var notification = await _dbContext.Notifications
            .FirstOrDefaultAsync(n => n.Id == request.NotificationId, cancellationToken);

        if (notification == null)
            return false; // Trả về false để Controller mapping sang 404 Not Found

        // 2. Kiểm tra bảo mật: Không được phép đọc thông báo của người khác
        if (notification.UserId != (_currentUserService.UserId ?? throw new System.UnauthorizedAccessException()))
            throw new UnauthorizedAccessException("Forbidden: Bạn không có quyền thao tác trên thông báo này.");

        // 3. Đánh dấu đã đọc
        notification.IsRead = true;
        
        await _dbContext.SaveChangesAsync(cancellationToken);

        return true;
    }
}
