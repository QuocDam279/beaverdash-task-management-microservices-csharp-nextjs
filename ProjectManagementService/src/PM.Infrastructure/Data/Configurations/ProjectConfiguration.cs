using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PM.Domain.Entities;
using PM.Domain.Enums;

namespace PM.Infrastructure.Data.Configurations;

public class ProjectConfiguration : IEntityTypeConfiguration<Project>
{
    public void Configure(EntityTypeBuilder<Project> builder)
    {
        builder.ToTable("projects");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.Id)
            .HasColumnName("id")
            .HasColumnType("uuid");

        builder.Property(p => p.TeamId)
            .HasColumnName("team_id")
            .HasColumnType("uuid")
            .IsRequired(false);

        builder.Property(p => p.Name)
            .HasColumnName("name")
            .HasColumnType("varchar")
            .IsRequired();

        builder.Property(p => p.Description)
            .HasColumnName("description")
            .HasColumnType("text");

        builder.Property(p => p.Status)
            .HasColumnName("status")
            .HasColumnType("varchar")
            .HasConversion<string>()
            .HasDefaultValue(ProjectStatus.NotStarted);

        builder.Property(p => p.Progress)
            .HasColumnName("progress")
            .HasColumnType("integer")
            .HasDefaultValue(0);

        builder.Property(p => p.StartDate)
            .HasColumnName("start_date")
            .HasColumnType("timestamp with time zone");

        builder.Property(p => p.DueDate)
            .HasColumnName("due_date")
            .HasColumnType("timestamp with time zone");

        builder.Property(p => p.IsPublic)
            .HasColumnName("is_public")
            .HasColumnType("boolean")
            .HasDefaultValue(false);

        builder.Property(p => p.ShareToken)
            .HasColumnName("share_token")
            .HasColumnType("varchar");

        builder.HasIndex(p => p.ShareToken)
            .IsUnique();

        builder.Property(p => p.CreatedByUserId)
            .HasColumnName("created_by_user_id")
            .HasColumnType("uuid")
            .IsRequired();

        builder.Property(p => p.CreatedAt)
            .HasColumnName("created_at")
            .HasColumnType("timestamp with time zone");

        builder.Property(p => p.UpdatedAt)
            .HasColumnName("updated_at")
            .HasColumnType("timestamp with time zone");

        builder.HasOne(p => p.Team)
            .WithMany(t => t.Projects)
            .HasForeignKey(p => p.TeamId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(p => p.CreatedByUser)
            .WithMany()
            .HasForeignKey(p => p.CreatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
