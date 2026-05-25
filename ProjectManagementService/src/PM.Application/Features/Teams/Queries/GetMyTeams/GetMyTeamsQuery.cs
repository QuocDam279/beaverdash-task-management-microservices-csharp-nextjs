using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Teams.Queries.GetMyTeams;

public class TeamMemberSummaryDto
{
    public Guid UserId { get; set; }
    public string DisplayName { get; set; } = null!;
    public string? Avatar { get; set; }
}

public class TeamSummaryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public Guid OwnerUserId { get; set; }
    public DateTime CreatedAt { get; set; }
    
    public int MembersCount { get; set; }
    public int ProjectsCount { get; set; }
    public string CurrentUserRole { get; set; } = null!;
    public List<TeamMemberSummaryDto> Members { get; set; } = new();
}

public record GetMyTeamsQuery : IRequest<List<TeamSummaryDto>>;

public class GetMyTeamsQueryHandler : IRequestHandler<GetMyTeamsQuery, List<TeamSummaryDto>>
{
    private readonly IPMDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;

    public GetMyTeamsQueryHandler(IPMDbContext dbContext, ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
    }

    public async Task<List<TeamSummaryDto>> Handle(GetMyTeamsQuery request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("Bạn chưa đăng nhập.");

        // Fetch all teams where the current user is a member
        var teams = await _dbContext.Teams
            .AsNoTracking()
            .Where(t => t.Members.Any(m => m.UserId == currentUserId))
            .Include(t => t.Projects)
            .Include(t => t.Members)
                .ThenInclude(m => m.User)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync(cancellationToken);

        return teams.Select(t => new TeamSummaryDto
        {
            Id = t.Id,
            Name = t.Name,
            Description = t.Description,
            OwnerUserId = t.OwnerUserId,
            CreatedAt = t.CreatedAt,
            MembersCount = t.Members.Count,
            ProjectsCount = t.Projects.Count,
            CurrentUserRole = t.Members.FirstOrDefault(m => m.UserId == currentUserId)?.Role ?? "member",
            Members = t.Members.Take(5).Select(m => new TeamMemberSummaryDto
            {
                UserId = m.UserId,
                DisplayName = m.User?.DisplayName ?? string.Empty,
                Avatar = m.User?.Avatar
            }).ToList()
        }).ToList();
    }
}
