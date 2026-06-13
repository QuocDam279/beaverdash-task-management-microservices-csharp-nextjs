using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Projects.Project.Queries;

public class ProjectShareDto
{
    public Guid Id { get; set; }
    public string RecipientEmail { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
}

public record GetProjectSharesQuery(Guid ProjectId) : IRequest<List<ProjectShareDto>>;

public class GetProjectSharesQueryHandler : IRequestHandler<GetProjectSharesQuery, List<ProjectShareDto>>
{
    private readonly IPMDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;

    public GetProjectSharesQueryHandler(
        IPMDbContext dbContext,
        ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
    }

    public async Task<List<ProjectShareDto>> Handle(GetProjectSharesQuery request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("Bạn chưa đăng nhập.");

        var project = await _dbContext.Projects
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == request.ProjectId, cancellationToken);

        if (project == null)
            throw new KeyNotFoundException("Dự án không tồn tại.");

        if (!project.TeamId.HasValue)
            throw new InvalidOperationException("Dự án không hợp lệ.");

        // Check if current user is a team member
        var requestingMember = await _dbContext.TeamMembers
            .FirstOrDefaultAsync(tm => tm.TeamId == project.TeamId.Value && tm.UserId == currentUserId, cancellationToken);

        if (requestingMember == null)
            throw new UnauthorizedAccessException("Bạn không có quyền truy cập thông tin chia sẻ của dự án này.");

        var shares = await _dbContext.ProjectShares
            .AsNoTracking()
            .Where(ps => ps.ProjectId == project.Id)
            .OrderByDescending(ps => ps.CreatedAt)
            .Select(ps => new ProjectShareDto
            {
                Id = ps.Id,
                RecipientEmail = ps.RecipientEmail,
                CreatedAt = ps.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return shares;
    }
}
