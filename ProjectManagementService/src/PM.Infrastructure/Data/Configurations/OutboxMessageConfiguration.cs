using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PM.Domain.Entities;

namespace PM.Infrastructure.Data.Configurations;

public class OutboxMessageConfiguration : IEntityTypeConfiguration<OutboxMessage>
{
    public void Configure(EntityTypeBuilder<OutboxMessage> builder)
    {
        builder.ToTable("outbox_messages");

        builder.HasKey(m => m.Id);

        builder.Property(m => m.Id)
            .HasColumnName("id")
            .HasColumnType("uuid");

        builder.Property(m => m.Type)
            .HasColumnName("type")
            .HasColumnType("varchar(255)")
            .IsRequired();

        builder.Property(m => m.Content)
            .HasColumnName("content")
            .HasColumnType("text")
            .IsRequired();

        builder.Property(m => m.OccurredOnUtc)
            .HasColumnName("occurred_on_utc")
            .HasColumnType("timestamp with time zone")
            .IsRequired();

        builder.Property(m => m.ProcessedOnUtc)
            .HasColumnName("processed_on_utc")
            .HasColumnType("timestamp with time zone")
            .IsRequired(false);

        builder.Property(m => m.Error)
            .HasColumnName("error")
            .HasColumnType("text")
            .IsRequired(false);

        builder.Property(m => m.RetryCount)
            .HasColumnName("retry_count")
            .HasColumnType("integer")
            .HasDefaultValue(0);

        builder.HasIndex(m => m.ProcessedOnUtc)
            .HasFilter("processed_on_utc IS NULL")
            .HasDatabaseName("ix_outbox_messages_unprocessed");
    }
}
