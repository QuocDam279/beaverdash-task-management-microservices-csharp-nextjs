using MediatR;
using PM.Application.Contracts;
using PM.Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Teams.Commands;

public class CreateTeamCommandHandler : IRequestHandler<CreateTeamCommand, Guid>
{
    private readonly IPMDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;

    public CreateTeamCommandHandler(IPMDbContext dbContext, ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
    }

    public async Task<Guid> Handle(CreateTeamCommand request, CancellationToken cancellationToken)
    {
        var teamId = Guid.NewGuid();
        var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("Bạn chưa đăng nhập.");

        // 1. Khởi tạo Team
        var team = new Team
        {
            Id = teamId,
            Name = request.Name,
            Description = request.Description,
            OwnerUserId = currentUserId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // 2. Tự động thêm người tạo vào danh sách thành viên với role "leader"
        var leaderMember = new TeamMember
        {
            TeamId = teamId,
            UserId = currentUserId,
            Role = "leader",
            JoinedAt = DateTime.UtcNow
        };

        _dbContext.Teams.Add(team);
        _dbContext.TeamMembers.Add(leaderMember);

        await _dbContext.SaveChangesAsync(cancellationToken);

        return teamId;
    }
}
