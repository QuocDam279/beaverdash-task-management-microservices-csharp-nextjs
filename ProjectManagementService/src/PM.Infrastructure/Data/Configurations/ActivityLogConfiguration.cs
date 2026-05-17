using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PM.Domain.Entities;

namespace PM.Infrastructure.Data.Configurations;

public class ActivityLogConfiguration : IEntityTypeConfiguration<ActivityLog>
{
    public void Configure(EntityTypeBuilder<ActivityLog> builder)
    {
        builder.ToTable("activity_log");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.Id)
            .HasColumnName("id")
            .HasColumnType("uuid");

        builder.Property(a => a.ProjectId)
            .HasColumnName("project_id")
            .HasColumnType("uuid")
            .IsRequired();

        builder.Property(a => a.UserId)
            .HasColumnName("user_id")
            .HasColumnType("uuid")
            .IsRequired();

        builder.Property(a => a.EntityType)
            .HasColumnName("entity_type")
            .HasColumnType("varchar");

        builder.Property(a => a.EntityId)
            .HasColumnName("entity_id")
            .HasColumnType("uuid");

        builder.Property(a => a.ActionType)
            .HasColumnName("action_type")
            .HasColumnType("varchar");

        builder.Property(a => a.OldValue)
            .HasColumnName("old_value")
            .HasColumnType("jsonb");

        builder.Property(a => a.NewValue)
            .HasColumnName("new_value")
            .HasColumnType("jsonb");

        builder.Property(a => a.CreatedAt)
            .HasColumnName("created_at")
            .HasColumnType("timestamp with time zone");

        builder.HasOne(a => a.Project)
            .WithMany()
            .HasForeignKey(a => a.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(a => a.User)
            .WithMany()
            .HasForeignKey(a => a.UserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
