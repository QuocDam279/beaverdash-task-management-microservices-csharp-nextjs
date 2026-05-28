using MediatR;
using System;

namespace PM.Application.Features.Tasks.SubTasks.Commands;

public record CreateSubTaskCommand(
    Guid TaskId,
    string Title,
    Guid? AssigneeUserId,
    DateTime? DueDate,
    int? SortOrder,
    string? Priority) : IRequest<Guid>;
