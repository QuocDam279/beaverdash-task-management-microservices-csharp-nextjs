using MediatR;
using System;

namespace PM.Application.Features.Tasks.TaskItem.Commands;

public record CreateTaskCommand(
    Guid BoardColumnId,
    string Title,
    string? Description,
    string? TaskType,
    string? Priority,
    Guid? AssigneeUserId,
    Guid? ParentTaskId,
    DateTime? DueDate,
    DateTime? StartDate,
    int? SortOrder,
    Guid CreatedByUserId) : IRequest<Guid>;
