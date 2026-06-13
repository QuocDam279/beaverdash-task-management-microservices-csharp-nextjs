using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Projects.Project.Queries.GetMyProjects;

public class MyProjectDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public Guid? TeamId { get; set; }
    public Guid CreatedByUserId { get; set; }
    public DateTime? LastChatMessageCreatedAt { get; set; }
}

public record GetMyProjectsQuery : IRequest<List<MyProjectDto>>;

public class GetMyProjectsQueryHandler : IRequestHandler<GetMyProjectsQuery, List<MyProjectDto>>
{
    private readonly IPMDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;

    public GetMyProjectsQueryHandler(IPMDbContext dbContext, ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
    }

    public async Task<List<MyProjectDto>> Handle(GetMyProjectsQuery request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("Bạn chưa đăng nhập.");

        // Lấy tất cả TeamId mà user này tham gia
        var myTeamIds = await _dbContext.TeamMembers
            .AsNoTracking()
            .Where(tm => tm.UserId == currentUserId)
            .Select(tm => tm.TeamId)
            .ToListAsync(cancellationToken);

        // Lấy các dự án thuộc về team mà user tham gia
        var projects = await _dbContext.Projects
            .AsNoTracking()
            .Where(p => p.TeamId.HasValue && myTeamIds.Contains(p.TeamId.Value))
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new MyProjectDto
            {
                Id = p.Id,
                Name = p.Name,
                TeamId = p.TeamId,
                CreatedByUserId = p.CreatedByUserId,
                LastChatMessageCreatedAt = _dbContext.ChatMessages
                    .Where(cm => cm.ProjectId == p.Id)
                    .OrderByDescending(cm => cm.CreatedAt)
                    .Select(cm => (DateTime?)cm.CreatedAt)
                    .FirstOrDefault()
            })
            .ToListAsync(cancellationToken);

        return projects;
    }
}
