using MediatR;
using PM.Application.Contracts;
using PM.Domain.Entities;
using System;
using Microsoft.EntityFrameworkCore;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.BoardColumns.Commands;

public class CreateBoardColumnCommandHandler : IRequestHandler<CreateBoardColumnCommand, Guid>
{
    private readonly IPMDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;

    public CreateBoardColumnCommandHandler(IPMDbContext dbContext, ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
    }

    public async Task<Guid> Handle(CreateBoardColumnCommand request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("Bạn chưa đăng nhập.");

        var project = await _dbContext.Projects
            .FirstOrDefaultAsync(p => p.Id == request.ProjectId, cancellationToken);

        if (project == null)
            throw new InvalidOperationException("Project không tồn tại.");

        if (!project.TeamId.HasValue)
        {
            throw new UnauthorizedAccessException("Bạn không có quyền thêm cột vào Project này.");
        }

        var isMember = await _dbContext.TeamMembers.AnyAsync(tm => tm.TeamId == project.TeamId.Value && tm.UserId == currentUserId, cancellationToken);
        if (!isMember)
            throw new UnauthorizedAccessException("Bạn không có quyền thêm cột vào Project này.");

        var boardColumn = new BoardColumn
        {
            Id = Guid.CreateVersion7(),
            ProjectId = request.ProjectId,
            Name = request.Name,
            Position = request.Position,
            WipLimit = request.WipLimit,
            IsDone = request.IsDone,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _dbContext.BoardColumns.Add(boardColumn);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return boardColumn.Id;
    }
}
