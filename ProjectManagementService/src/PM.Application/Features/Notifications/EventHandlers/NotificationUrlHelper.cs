using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Notifications.EventHandlers;

public static class NotificationUrlHelper
{
    public static async Task<string> GetTaskUrlAsync(
        IPMDbContext dbContext,
        Guid projectId,
        Guid taskId,
        Guid recipientUserId,
        CancellationToken cancellationToken)
    {
        var project = await dbContext.Projects
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == projectId, cancellationToken);

        if (project != null && !string.IsNullOrEmpty(project.ShareToken))
        {
            var isMember = await dbContext.TeamMembers
                .AnyAsync(tm => tm.TeamId == project.TeamId && tm.UserId == recipientUserId, cancellationToken);
            if (!isMember)
            {
                return $"/shared/projects/{project.ShareToken}/board?taskId={taskId}";
            }
        }

        return $"/projects/{projectId}/board?taskId={taskId}";
    }

    public static async Task<string> GetProjectUrlAsync(
        IPMDbContext dbContext,
        Guid projectId,
        Guid recipientUserId,
        CancellationToken cancellationToken)
    {
        var project = await dbContext.Projects
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == projectId, cancellationToken);

        if (project != null && !string.IsNullOrEmpty(project.ShareToken))
        {
            var isMember = await dbContext.TeamMembers
                .AnyAsync(tm => tm.TeamId == project.TeamId && tm.UserId == recipientUserId, cancellationToken);
            if (!isMember)
            {
                return $"/shared/projects/{project.ShareToken}/board";
            }
        }

        return $"/projects/{projectId}/board";
    }
}
