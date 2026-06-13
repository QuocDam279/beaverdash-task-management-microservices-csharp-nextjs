using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PM.Domain.Entities;

namespace PM.Infrastructure.Data.Configurations;

public class ChatMessageConfiguration : IEntityTypeConfiguration<ChatMessage>
{
    public void Configure(EntityTypeBuilder<ChatMessage> builder)
    {
        builder.ToTable("chat_messages");
        builder.HasKey(c => c.Id);

        builder.Property(c => c.Id).HasColumnName("id").HasColumnType("uuid");
        builder.Property(c => c.SenderId).HasColumnName("sender_id").HasColumnType("uuid").IsRequired();
        builder.Property(c => c.ProjectId).HasColumnName("project_id").HasColumnType("uuid");
        builder.Property(c => c.TeamId).HasColumnName("team_id").HasColumnType("uuid");
        builder.Property(c => c.Content).HasColumnName("content").HasColumnType("text").IsRequired();
        builder.Property(c => c.FileUrl).HasColumnName("file_url").HasColumnType("text");
        builder.Property(c => c.FileName).HasColumnName("file_name").HasColumnType("text");
        builder.Property(c => c.FileType).HasColumnName("file_type").HasColumnType("text");
        builder.Property(c => c.FileSize).HasColumnName("file_size").HasColumnType("bigint");
        builder.Property(c => c.CreatedAt).HasColumnName("created_at").HasColumnType("timestamp with time zone");
        builder.Property(c => c.UpdatedAt).HasColumnName("updated_at").HasColumnType("timestamp with time zone");

        builder.HasOne(c => c.Sender)
            .WithMany()
            .HasForeignKey(c => c.SenderId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(c => c.Project)
            .WithMany()
            .HasForeignKey(c => c.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(c => c.Team)
            .WithMany()
            .HasForeignKey(c => c.TeamId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes for performance when loading history
        builder.HasIndex(c => new { c.ProjectId, c.CreatedAt });
        builder.HasIndex(c => new { c.TeamId, c.CreatedAt });
    }
}
