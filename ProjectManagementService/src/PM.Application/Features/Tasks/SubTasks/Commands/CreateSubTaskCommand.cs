using MediatR;
using System;

namespace PM.Application.Features.Tasks.SubTasks.Commands;

public record CreateSubTaskCommand(
    Guid TaskId,
    string Title,
    Guid? AssigneeUserId,
    DateTime? StartDate,
    DateTime? DueDate,
    int? SortOrder) : IRequest<Guid>;
