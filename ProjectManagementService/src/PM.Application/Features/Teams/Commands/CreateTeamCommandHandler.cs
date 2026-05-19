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

    public CreateTeamCommandHandler(IPMDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Guid> Handle(CreateTeamCommand request, CancellationToken cancellationToken)
    {
        var teamId = Guid.NewGuid();

        // 1. Khởi tạo Team
        var team = new Team
        {
            Id = teamId,
            Name = request.Name,
            Description = request.Description,
            OwnerUserId = request.CreatedByUserId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // 2. Tự động thêm người tạo vào danh sách thành viên với role "leader"
        var leaderMember = new TeamMember
        {
            TeamId = teamId,
            UserId = request.CreatedByUserId,
            Role = "leader",
            JoinedAt = DateTime.UtcNow
        };

        _dbContext.Teams.Add(team);
        _dbContext.TeamMembers.Add(leaderMember);

        await _dbContext.SaveChangesAsync(cancellationToken);

        return teamId;
    }
}
