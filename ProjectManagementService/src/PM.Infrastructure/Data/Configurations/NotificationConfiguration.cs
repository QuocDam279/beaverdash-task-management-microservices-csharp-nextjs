using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PM.Domain.Entities;

namespace PM.Infrastructure.Data.Configurations;

public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder.ToTable("notifications");

        builder.HasKey(n => n.Id);

        builder.Property(n => n.Id)
            .HasColumnName("id")
            .HasColumnType("uuid");

        builder.Property(n => n.UserId)
            .HasColumnName("user_id")
            .HasColumnType("uuid")
            .IsRequired();

        builder.Property(n => n.ActorUserId)
            .HasColumnName("actor_user_id")
            .HasColumnType("uuid")
            .IsRequired();

        builder.Property(n => n.Type)
            .HasColumnName("type")
            .HasColumnType("varchar");

        builder.Property(n => n.Content)
            .HasColumnName("content")
            .HasColumnType("text");

        builder.Property(n => n.ActionUrl)
            .HasColumnName("action_url")
            .HasColumnType("varchar");

        builder.Property(n => n.IsRead)
            .HasColumnName("is_read")
            .HasColumnType("boolean")
            .HasDefaultValue(false);

        builder.Property(n => n.IsSentViaEmail)
            .HasColumnName("is_sent_via_email")
            .HasColumnType("boolean")
            .HasDefaultValue(false);

        builder.Property(n => n.EmailSentAt)
            .HasColumnName("email_sent_at")
            .HasColumnType("timestamp with time zone");

        builder.Property(n => n.CreatedAt)
            .HasColumnName("created_at")
            .HasColumnType("timestamp with time zone");

        builder.HasOne(n => n.User)
            .WithMany()
            .HasForeignKey(n => n.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(n => n.ActorUser)
            .WithMany()
            .HasForeignKey(n => n.ActorUserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
