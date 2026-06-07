using PM.Domain.Common;
using System;

namespace PM.Domain.Entities;

public class ProjectDocument : BaseEntity
{
    public Guid Id { get; set; }

    public Guid ProjectId { get; set; }
    public Project? Project { get; set; }

    public string FileName { get; set; } = null!;
    public string FileUrl { get; set; } = null!;
    public string? FileType { get; set; }
    public long? FileSizeBytes { get; set; }

    public Guid UploadedByUserId { get; set; }
    public User? UploadedByUser { get; set; }

    public DateTime CreatedAt { get; set; }
}
