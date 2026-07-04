using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PM.Domain.Entities;

namespace PM.Infrastructure.Data.Configurations;

public class NotificationTrackingConfiguration : IEntityTypeConfiguration<NotificationTracking>
{
    public void Configure(EntityTypeBuilder<NotificationTracking> builder)
    {
        builder.ToTable("notification_trackings");

        builder.HasKey(nt => nt.Id);

        builder.Property(nt => nt.Id)
            .HasColumnName("id")
            .HasColumnType("uuid");

        builder.Property(nt => nt.NotificationType)
            .HasColumnName("notification_type")
            .HasColumnType("varchar")
            .IsRequired();

        builder.Property(nt => nt.EntityId)
            .HasColumnName("entity_id")
            .HasColumnType("uuid")
            .IsRequired();

        builder.Property(nt => nt.EntityType)
            .HasColumnName("entity_type")
            .HasColumnType("varchar")
            .IsRequired();

        builder.Property(nt => nt.DaysRemainingOrOverdue)
            .HasColumnName("days_remaining_or_overdue")
            .HasColumnType("integer")
            .IsRequired();

        builder.Property(nt => nt.UserId)
            .HasColumnName("user_id")
            .HasColumnType("uuid")
            .IsRequired();

        builder.Property(nt => nt.SentAtUtc)
            .HasColumnName("sent_at_utc")
            .HasColumnType("timestamp with time zone")
            .IsRequired();

        builder.HasOne(nt => nt.User)
            .WithMany()
            .HasForeignKey(nt => nt.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Index for fast check: EntityId + NotificationType + DaysRemainingOrOverdue + UserId
        builder.HasIndex(nt => new { nt.EntityId, nt.NotificationType, nt.DaysRemainingOrOverdue, nt.UserId })
            .HasDatabaseName("ix_notification_trackings_lookup");
    }
}
