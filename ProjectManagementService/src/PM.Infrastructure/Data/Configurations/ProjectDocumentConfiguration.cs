using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PM.Domain.Entities;

namespace PM.Infrastructure.Data.Configurations;

public class ProjectDocumentConfiguration : IEntityTypeConfiguration<ProjectDocument>
{
    public void Configure(EntityTypeBuilder<ProjectDocument> builder)
    {
        builder.ToTable("project_documents");

        builder.HasKey(pd => pd.Id);

        builder.Property(pd => pd.Id)
            .HasColumnName("id")
            .HasColumnType("uuid");

        builder.Property(pd => pd.ProjectId)
            .HasColumnName("project_id")
            .HasColumnType("uuid")
            .IsRequired();

        builder.Property(pd => pd.FileName)
            .HasColumnName("file_name")
            .HasColumnType("varchar")
            .IsRequired();

        builder.Property(pd => pd.FileUrl)
            .HasColumnName("file_url")
            .HasColumnType("varchar")
            .IsRequired();

        builder.Property(pd => pd.FileType)
            .HasColumnName("file_type")
            .HasColumnType("varchar");

        builder.Property(pd => pd.FileSizeBytes)
            .HasColumnName("file_size_bytes")
            .HasColumnType("bigint");

        builder.Property(pd => pd.UploadedByUserId)
            .HasColumnName("uploaded_by_user_id")
            .HasColumnType("uuid")
            .IsRequired();

        builder.Property(pd => pd.CreatedAt)
            .HasColumnName("created_at")
            .HasColumnType("timestamp with time zone");

        // Relationships
        builder.HasOne(pd => pd.Project)
            .WithMany(p => p.ProjectDocuments)
            .HasForeignKey(pd => pd.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(pd => pd.UploadedByUser)
            .WithMany()
            .HasForeignKey(pd => pd.UploadedByUserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
