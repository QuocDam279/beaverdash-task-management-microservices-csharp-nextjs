using MediatR;
using System;

namespace PM.Application.Features.Tasks.TaskItem.Commands;

public record CreateTaskCommand(
    Guid BoardColumnId,
    string Title,
    string? Description,
    string? Priority,
    Guid? AssigneeUserId,
    DateTime? DueDate,
    DateTime? StartDate,
    double? SortOrder) : IRequest<Guid>;
