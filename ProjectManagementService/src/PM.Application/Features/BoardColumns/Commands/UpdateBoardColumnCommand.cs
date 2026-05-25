using MediatR;
using System;

namespace PM.Application.Features.BoardColumns.Commands;

public class UpdateBoardColumnDto
{
    public string Name { get; set; } = null!;
    public int Position { get; set; }
    public int? WipLimit { get; set; }
    public bool IsDone { get; set; }
}

public class UpdateBoardColumnCommand : IRequest<bool>
{
    public Guid BoardColumnId { get; set; }
    public string Name { get; set; } = null!;
    public int Position { get; set; }
    public int? WipLimit { get; set; }
    public bool IsDone { get; set; }
}
