using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Projects.Project.Queries;

public class SharedProjectDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public int Progress { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? DueDate { get; set; }
    public string ShareToken { get; set; } = null!;
    
    public string OwnerName { get; set; } = null!;
    public string? OwnerAvatar { get; set; }
    public DateTime SharedAt { get; set; }
}

public record GetProjectsSharedWithMeQuery : IRequest<List<SharedProjectDto>>;

public class GetProjectsSharedWithMeQueryHandler : IRequestHandler<GetProjectsSharedWithMeQuery, List<SharedProjectDto>>
{
    private readonly IPMDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;

    public GetProjectsSharedWithMeQueryHandler(
        IPMDbContext dbContext,
        ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
    }

    public async Task<List<SharedProjectDto>> Handle(GetProjectsSharedWithMeQuery request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("Bạn chưa đăng nhập.");

        // Get user's email
        var currentUser = await _dbContext.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == currentUserId, cancellationToken);

        if (currentUser == null)
            throw new UnauthorizedAccessException("Người dùng không tồn tại.");

        var userEmail = currentUser.Email.Trim().ToLower();

        // Query shared projects where the share is active and project has link sharing enabled (IsPublic is true)
        var sharedProjects = await _dbContext.ProjectShares
            .AsNoTracking()
            .Include(ps => ps.Project)
                .ThenInclude(p => p!.CreatedByUser)
            .Where(ps => ps.RecipientEmail == userEmail && ps.Project != null && ps.Project.IsPublic && !string.IsNullOrEmpty(ps.Project.ShareToken))
            .OrderByDescending(ps => ps.CreatedAt)
            .Select(ps => new SharedProjectDto
            {
                Id = ps.Project!.Id,
                Name = ps.Project.Name,
                Description = ps.Project.Description,
                Progress = ps.Project.Progress,
                StartDate = ps.Project.StartDate,
                DueDate = ps.Project.DueDate,
                ShareToken = ps.Project.ShareToken!,
                OwnerName = ps.Project.CreatedByUser != null ? ps.Project.CreatedByUser.DisplayName : "Người dùng Beaverdash",
                OwnerAvatar = ps.Project.CreatedByUser != null ? ps.Project.CreatedByUser.Avatar : null,
                SharedAt = ps.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return sharedProjects;
    }
}
