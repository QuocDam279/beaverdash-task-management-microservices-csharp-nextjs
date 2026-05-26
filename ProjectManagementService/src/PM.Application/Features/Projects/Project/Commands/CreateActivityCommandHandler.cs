using MediatR;
using PM.Application.Contracts;
using PM.Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Projects.Project.Commands;

public class CreateActivityCommandHandler : IRequestHandler<CreateActivityCommand, Unit>
{
    private readonly IPMDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;

    public CreateActivityCommandHandler(IPMDbContext dbContext, ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
    }

    public async Task<Unit> Handle(CreateActivityCommand request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("Bạn chưa đăng nhập.");

        var log = new ActivityLog
        {
            Id = Guid.NewGuid(),
            ProjectId = request.ProjectId,
            UserId = currentUserId,
            EntityType = request.EntityType,
            EntityId = request.EntityId,
            ActionType = request.ActionType,
            OldValue = request.OldValue,
            NewValue = request.NewValue,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.ActivityLogs.Add(log);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
