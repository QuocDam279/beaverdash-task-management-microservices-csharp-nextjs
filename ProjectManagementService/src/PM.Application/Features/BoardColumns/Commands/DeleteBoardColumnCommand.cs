using MediatR;
using System;

namespace PM.Application.Features.BoardColumns.Commands;

public class DeleteBoardColumnDto
{
    public Guid? MoveTasksToColumnId { get; set; }
}

public class DeleteBoardColumnCommand : IRequest<bool>
{
    public Guid BoardColumnId { get; set; }
    public Guid? MoveTasksToColumnId { get; set; }
}
