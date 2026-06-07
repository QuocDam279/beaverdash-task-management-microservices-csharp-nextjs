using PM.Domain.Common;
using System;

namespace PM.Domain.Events;

public class ProjectDocumentDeletedEvent : IDomainEvent
{
    public Guid ProjectId { get; set; }
    public Guid DocumentId { get; set; }
    public string FileName { get; set; }
    public Guid UserId { get; set; }

    public ProjectDocumentDeletedEvent(Guid projectId, Guid documentId, string fileName, Guid userId)
    {
        ProjectId = projectId;
        DocumentId = documentId;
        FileName = fileName;
        UserId = userId;
    }
}
