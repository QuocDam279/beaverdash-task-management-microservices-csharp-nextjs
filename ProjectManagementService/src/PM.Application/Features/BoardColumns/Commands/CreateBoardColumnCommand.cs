using MediatR;
using System;

namespace PM.Application.Features.BoardColumns.Commands;

public record CreateBoardColumnCommand(
    Guid ProjectId,
    string Name,
    int Position = 0,
    int? WipLimit = null) : IRequest<Guid>;
