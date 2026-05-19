using PM.Domain.Common;
using System;

namespace PM.Domain.Events;

public class TaskCreatedEvent : IDomainEvent
{
    public Guid TaskId { get; set; }
    public Guid UserId { get; set; } // Người tạo task
    public string Title { get; set; } = null!; // Tên task

    public TaskCreatedEvent(Guid taskId, Guid userId, string title)
    {
        TaskId = taskId;
        UserId = userId;
        Title = title;
    }
}
