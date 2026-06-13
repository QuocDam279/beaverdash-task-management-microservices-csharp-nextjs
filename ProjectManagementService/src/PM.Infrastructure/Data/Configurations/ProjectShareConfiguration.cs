using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PM.Domain.Entities;

namespace PM.Infrastructure.Data.Configurations;

public class ProjectShareConfiguration : IEntityTypeConfiguration<ProjectShare>
{
    public void Configure(EntityTypeBuilder<ProjectShare> builder)
    {
        builder.ToTable("project_shares");

        builder.HasKey(ps => ps.Id);

        builder.Property(ps => ps.Id)
            .HasColumnName("id")
            .HasColumnType("uuid");

        builder.Property(ps => ps.ProjectId)
            .HasColumnName("project_id")
            .HasColumnType("uuid")
            .IsRequired();

        builder.Property(ps => ps.RecipientEmail)
            .HasColumnName("recipient_email")
            .HasColumnType("varchar")
            .IsRequired();

        builder.Property(ps => ps.SharedByUserId)
            .HasColumnName("shared_by_user_id")
            .HasColumnType("uuid")
            .IsRequired();

        builder.Property(ps => ps.CreatedAt)
            .HasColumnName("created_at")
            .HasColumnType("timestamp with time zone");

        builder.Property(ps => ps.UpdatedAt)
            .HasColumnName("updated_at")
            .HasColumnType("timestamp with time zone");

        builder.HasIndex(ps => ps.RecipientEmail);
        builder.HasIndex(ps => new { ps.ProjectId, ps.RecipientEmail }).IsUnique();

        builder.HasOne(ps => ps.Project)
            .WithMany()
            .HasForeignKey(ps => ps.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(ps => ps.SharedByUser)
            .WithMany()
            .HasForeignKey(ps => ps.SharedByUserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
