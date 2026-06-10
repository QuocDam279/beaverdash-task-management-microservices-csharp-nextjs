using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PM.Domain.Entities;

namespace PM.Infrastructure.Data.Configurations;

public class SprintConfiguration : IEntityTypeConfiguration<Sprint>
{
    public void Configure(EntityTypeBuilder<Sprint> builder)
    {
        builder.ToTable("sprints");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.Id)
            .HasColumnName("id")
            .HasColumnType("uuid");

        builder.Property(s => s.ProjectId)
            .HasColumnName("project_id")
            .HasColumnType("uuid")
            .IsRequired();

        builder.Property(s => s.Name)
            .HasColumnName("name")
            .HasColumnType("varchar")
            .IsRequired();

        builder.Property(s => s.Goal)
            .HasColumnName("goal")
            .HasColumnType("text");

        builder.Property(s => s.Status)
            .HasColumnName("status")
            .HasColumnType("varchar")
            .HasConversion<string>()
            .IsRequired();

        builder.Property(s => s.StartDate)
            .HasColumnName("start_date")
            .HasColumnType("timestamp with time zone");

        builder.Property(s => s.EndDate)
            .HasColumnName("end_date")
            .HasColumnType("timestamp with time zone");

        builder.Property(s => s.CreatedAt)
            .HasColumnName("created_at")
            .HasColumnType("timestamp with time zone");

        builder.Property(s => s.UpdatedAt)
            .HasColumnName("updated_at")
            .HasColumnType("timestamp with time zone");

        builder.HasOne(s => s.Project)
            .WithMany(p => p.Sprints)
            .HasForeignKey(s => s.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(s => new { s.ProjectId, s.Status })
            .HasDatabaseName("ix_sprints_project_id_status");
    }
}
