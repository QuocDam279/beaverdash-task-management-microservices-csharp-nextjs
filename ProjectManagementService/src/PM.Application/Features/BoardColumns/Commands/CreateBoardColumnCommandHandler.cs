using MediatR;
using PM.Application.Contracts;
using PM.Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.BoardColumns.Commands;

public class CreateBoardColumnCommandHandler : IRequestHandler<CreateBoardColumnCommand, Guid>
{
    private readonly IPMDbContext _dbContext;

    public CreateBoardColumnCommandHandler(IPMDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Guid> Handle(CreateBoardColumnCommand request, CancellationToken cancellationToken)
    {
        var boardColumn = new BoardColumn
        {
            Id = Guid.NewGuid(),
            ProjectId = request.ProjectId,
            Name = request.Name,
            Position = request.Position,
            WipLimit = request.WipLimit,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _dbContext.BoardColumns.Add(boardColumn);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return boardColumn.Id;
    }
}
