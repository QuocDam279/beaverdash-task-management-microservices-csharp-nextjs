using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;

namespace PM.Application.Features.Projects.Project.Commands;

public class CreateProjectCommandHandler : IRequestHandler<CreateProjectCommand, Guid>
{
    private readonly PM.Application.Contracts.IPMDbContext _dbContext;
    private readonly PM.Application.Contracts.ICurrentUserService _currentUserService;
    private readonly PM.Application.Contracts.IDocumentIntelligenceServiceClient _docIntelClient;

    public CreateProjectCommandHandler(
        PM.Application.Contracts.IPMDbContext dbContext,
        PM.Application.Contracts.ICurrentUserService currentUserService,
        PM.Application.Contracts.IDocumentIntelligenceServiceClient docIntelClient)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
        _docIntelClient = docIntelClient;
    }

    public async Task<Guid> Handle(CreateProjectCommand request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("Bạn chưa đăng nhập.");

        if (request.TeamId.HasValue)
        {
            var isMember = await _dbContext.TeamMembers.AnyAsync(tm => tm.TeamId == request.TeamId.Value && tm.UserId == currentUserId, cancellationToken);
            if (!isMember)
            {
                throw new UnauthorizedAccessException("Bạn không phải là thành viên của Team này.");
            }
        }

        var project = new PM.Domain.Entities.Project
        {
            Id = Guid.NewGuid(),
            TeamId = request.TeamId,
            Name = request.Name,
            Description = request.Description,
            Status = "To Do",
            IsPublic = request.IsPublic,
            CreatedByUserId = currentUserId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _dbContext.Set<PM.Domain.Entities.Project>().Add(project);
        await _dbContext.SaveChangesAsync(cancellationToken);

        // --- Đồng bộ sang DocumentIntelligence Service ---
        // 1. Đồng bộ thông tin dự án
        await _docIntelClient.SyncProjectAsync(project.Id, project.Name, project.Description, project.Status);

        // 2. Đồng bộ danh sách thành viên
        List<Guid> memberIds;
        if (request.TeamId.HasValue)
        {
            // Dự án Nhóm: lấy toàn bộ thành viên của team
            memberIds = await _dbContext.TeamMembers
                .Where(tm => tm.TeamId == request.TeamId.Value)
                .Select(tm => tm.UserId)
                .ToListAsync(cancellationToken);
        }
        else
        {
            // Dự án Cá nhân: chỉ có người tạo
            memberIds = new List<Guid> { currentUserId };
        }

        await _docIntelClient.SyncProjectMembersAsync(project.Id, memberIds);

        return project.Id;
    }
}
