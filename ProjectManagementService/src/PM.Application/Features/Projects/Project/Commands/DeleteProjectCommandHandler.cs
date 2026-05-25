using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Projects.Project.Commands;

public class DeleteProjectCommandHandler : IRequestHandler<DeleteProjectCommand, bool>
{
    private readonly IPMDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;

    public DeleteProjectCommandHandler(IPMDbContext dbContext, ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
    }

    public async Task<bool> Handle(DeleteProjectCommand request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("Bạn chưa đăng nhập.");

        var project = await _dbContext.Projects
            .FirstOrDefaultAsync(p => p.Id == request.ProjectId, cancellationToken);

        if (project == null)
            return false;

        // Authorization check
        if (project.TeamId.HasValue)
        {
            var requestingMember = await _dbContext.TeamMembers
                .FirstOrDefaultAsync(tm => tm.TeamId == project.TeamId.Value && tm.UserId == currentUserId, cancellationToken);

            if (requestingMember == null || requestingMember.Role != "leader")
            {
                throw new UnauthorizedAccessException("Chỉ có trưởng nhóm mới có quyền xóa dự án này.");
            }
        }
        else
        {
            if (project.CreatedByUserId != currentUserId)
            {
                throw new UnauthorizedAccessException("Bạn không có quyền xóa dự án này.");
            }
        }

        // Check if project has any tasks
        var hasTasks = await _dbContext.TaskItems
            .AnyAsync(t => _dbContext.BoardColumns
                .Where(bc => bc.ProjectId == request.ProjectId)
                .Select(bc => bc.Id)
                .Contains(t.BoardColumnId) && t.DeletedAt == null, cancellationToken);

        if (hasTasks)
        {
            throw new InvalidOperationException("Không thể xóa dự án vẫn còn công việc thuộc dự án này. Vui lòng xóa hết công việc trước.");
        }

        _dbContext.Projects.Remove(project);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return true;
    }
}
