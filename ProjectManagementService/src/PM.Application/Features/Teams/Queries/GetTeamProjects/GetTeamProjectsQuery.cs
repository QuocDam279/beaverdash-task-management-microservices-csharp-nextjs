using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Teams.Queries.GetTeamProjects;

public class ProjectDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public string? Status { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime CreatedAt { get; set; }
    
    // UI cần thông tin người tạo
    public string CreatedByDisplayName { get; set; } = string.Empty;
    public string? CreatedByAvatar { get; set; }
}

public record GetTeamProjectsQuery(Guid TeamId) : IRequest<List<ProjectDto>>;

public class GetTeamProjectsQueryHandler : IRequestHandler<GetTeamProjectsQuery, List<ProjectDto>>
{
    private readonly IPMDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;

    public GetTeamProjectsQueryHandler(IPMDbContext dbContext, ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
    }

    public async Task<List<ProjectDto>> Handle(GetTeamProjectsQuery request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("Bạn chưa đăng nhập.");

        var isMember = await _dbContext.TeamMembers.AnyAsync(tm => tm.TeamId == request.TeamId && tm.UserId == currentUserId, cancellationToken);
        if (!isMember)
        {
            throw new UnauthorizedAccessException("Bạn không phải là thành viên của Team này.");
        }

        var projects = await _dbContext.Projects
            .AsNoTracking()
            .Include(p => p.CreatedByUser) // Join để lấy thông tin User
            .Where(p => p.TeamId == request.TeamId)
            .OrderByDescending(p => p.CreatedAt) // Mới nhất lên trên
            .Select(p => new ProjectDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                Status = p.Status,
                StartDate = p.StartDate,
                DueDate = p.DueDate,
                CreatedAt = p.CreatedAt,
                CreatedByDisplayName = p.CreatedByUser != null ? p.CreatedByUser.DisplayName : string.Empty,
                CreatedByAvatar = p.CreatedByUser != null ? p.CreatedByUser.Avatar : null
            })
            .ToListAsync(cancellationToken);

        return projects;
    }
}
