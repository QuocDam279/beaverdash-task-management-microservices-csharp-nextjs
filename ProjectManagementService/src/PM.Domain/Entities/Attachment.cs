namespace PM.Domain.Entities;

public class Attachment
{
    public Guid Id { get; set; }

    public Guid CommentId { get; set; }
    public Comment? Comment { get; set; }

    public string FileName { get; set; } = null!;
    public string FileUrl { get; set; } = null!;
    public string? FileType { get; set; }
    public long? FileSizeBytes { get; set; }

    public DateTime CreatedAt { get; set; }
}
