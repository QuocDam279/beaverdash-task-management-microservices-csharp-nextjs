using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Notifications.Commands;

public class ClearAllNotificationsCommandHandler : IRequestHandler<ClearAllNotificationsCommand, bool>
{
    private readonly IPMDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;

    public ClearAllNotificationsCommandHandler(IPMDbContext dbContext, ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
    }

    public async Task<bool> Handle(ClearAllNotificationsCommand request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("Bạn chưa đăng nhập.");

        await _dbContext.Notifications
            .Where(n => n.UserId == currentUserId)
            .ExecuteDeleteAsync(cancellationToken);

        return true;
    }
}
