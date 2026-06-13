using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Projects.Project.Queries;

public static class SharedProjectAccessHelper
{
    public static async Task<Domain.Entities.Project?> GetSharedProjectAndVerifyAccessAsync(
        IPMDbContext dbContext,
        ICurrentUserService currentUserService,
        string shareToken,
        CancellationToken cancellationToken)
    {
        var project = await dbContext.Projects
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.ShareToken == shareToken, cancellationToken);

        if (project == null || !project.IsPublic)
            return null;

        var currentUserId = currentUserService.UserId;
        if (!currentUserId.HasValue)
        {
            throw new UnauthorizedAccessException("Bạn chưa đăng nhập.");
        }

        bool hasAccess = false;
        if (project.TeamId.HasValue)
        {
            hasAccess = await dbContext.TeamMembers
                .AnyAsync(tm => tm.TeamId == project.TeamId.Value && tm.UserId == currentUserId.Value, cancellationToken);
        }

        if (!hasAccess)
        {
            var user = await dbContext.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == currentUserId.Value, cancellationToken);

            if (user != null)
            {
                hasAccess = await dbContext.ProjectShares
                    .AnyAsync(ps => ps.ProjectId == project.Id && ps.RecipientEmail.ToLower() == user.Email.ToLower(), cancellationToken);
            }
        }

        if (!hasAccess)
        {
            throw new UnauthorizedAccessException("Bạn không có quyền truy cập dự án này.");
        }

        return project;
    }
}
