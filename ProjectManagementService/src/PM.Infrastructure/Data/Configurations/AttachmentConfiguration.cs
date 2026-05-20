using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PM.Domain.Entities;

namespace PM.Infrastructure.Data.Configurations;

public class AttachmentConfiguration : IEntityTypeConfiguration<Attachment>
{
    public void Configure(EntityTypeBuilder<Attachment> builder)
    {
        builder.ToTable("attachments");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.Id)
            .HasColumnName("id")
            .HasColumnType("uuid");

        builder.Property(a => a.CommentId)
            .HasColumnName("comment_id")
            .HasColumnType("uuid")
            .IsRequired();

        builder.Property(a => a.FileName)
            .HasColumnName("file_name")
            .HasColumnType("varchar")
            .IsRequired();

        builder.Property(a => a.FileUrl)
            .HasColumnName("file_url")
            .HasColumnType("varchar")
            .IsRequired();

        builder.Property(a => a.FileType)
            .HasColumnName("file_type")
            .HasColumnType("varchar");

        builder.Property(a => a.FileSizeBytes)
            .HasColumnName("file_size_bytes")
            .HasColumnType("bigint");

        builder.Property(a => a.CreatedAt)
            .HasColumnName("created_at")
            .HasColumnType("timestamp with time zone");

        builder.HasOne(a => a.Comment)
            .WithMany(c => c.Attachments)
            .HasForeignKey(a => a.CommentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasQueryFilter(a => a.Comment.SubTask.DeletedAt == null);
    }
}
