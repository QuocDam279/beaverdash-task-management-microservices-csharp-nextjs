using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Projects.Project.Commands;

public class RevokeProjectShareCommandHandler : IRequestHandler<RevokeProjectShareCommand, bool>
{
    private readonly IPMDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;

    public RevokeProjectShareCommandHandler(
        IPMDbContext dbContext,
        ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
    }

    public async Task<bool> Handle(RevokeProjectShareCommand request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("Bạn chưa đăng nhập.");

        var project = await _dbContext.Projects
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == request.ProjectId, cancellationToken);

        if (project == null)
            throw new KeyNotFoundException("Dự án không tồn tại.");

        if (!project.TeamId.HasValue)
            throw new InvalidOperationException("Dự án không hợp lệ.");

        // Check if current user is the team leader
        var requestingMember = await _dbContext.TeamMembers
            .FirstOrDefaultAsync(tm => tm.TeamId == project.TeamId.Value && tm.UserId == currentUserId, cancellationToken);

        if (requestingMember == null || requestingMember.Role != "leader")
            throw new UnauthorizedAccessException("Chỉ có trưởng nhóm mới có quyền thu hồi chia sẻ của dự án này.");

        var email = request.RecipientEmail.Trim().ToLower();
        var share = await _dbContext.ProjectShares
            .FirstOrDefaultAsync(ps => ps.ProjectId == project.Id && ps.RecipientEmail == email, cancellationToken);

        if (share == null)
            return false;

        _dbContext.ProjectShares.Remove(share);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return true;
    }
}
