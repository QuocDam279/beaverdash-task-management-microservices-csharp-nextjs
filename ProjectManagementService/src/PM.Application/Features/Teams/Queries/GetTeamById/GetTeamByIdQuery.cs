using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Teams.Queries.GetTeamById;

public class TeamMemberDto
{
    public Guid UserId { get; set; }
    public string Role { get; set; } = null!;
    public DateTime JoinedAt { get; set; }
    
    // User details mapped from User entity
    public string Email { get; set; } = null!;
    public string DisplayName { get; set; } = null!;
    public string? Avatar { get; set; }
}

public class TeamDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public Guid OwnerUserId { get; set; }
    public DateTime CreatedAt { get; set; }
    
    public List<TeamMemberDto> Members { get; set; } = new();
}

public record GetTeamByIdQuery(Guid TeamId, Guid RequestingUserId) : IRequest<TeamDto?>;

public class GetTeamByIdQueryHandler : IRequestHandler<GetTeamByIdQuery, TeamDto?>
{
    private readonly IPMDbContext _dbContext;

    public GetTeamByIdQueryHandler(IPMDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<TeamDto?> Handle(GetTeamByIdQuery request, CancellationToken cancellationToken)
    {
        var team = await _dbContext.Teams
            .AsNoTracking()
            .Include(t => t.Members)
                .ThenInclude(m => m.User)
            .FirstOrDefaultAsync(t => t.Id == request.TeamId, cancellationToken);

        if (team == null)
            return null;

        // Bổ sung kiểm tra Data-level Authorization: User phải nằm trong danh sách thành viên
        bool isMember = team.Members.Any(m => m.UserId == request.RequestingUserId);
        if (!isMember)
            throw new UnauthorizedAccessException("Forbidden: Bạn không phải là thành viên của nhóm này nên không thể xem thông tin.");

        return new TeamDto
        {
            Id = team.Id,
            Name = team.Name,
            Description = team.Description,
            OwnerUserId = team.OwnerUserId,
            CreatedAt = team.CreatedAt,
            Members = team.Members.Select(m => new TeamMemberDto
            {
                UserId = m.UserId,
                Role = m.Role,
                JoinedAt = m.JoinedAt,
                Email = m.User?.Email ?? string.Empty,
                DisplayName = m.User?.DisplayName ?? string.Empty,
                Avatar = m.User?.Avatar
            }).ToList()
        };
    }
}
