using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PM.Domain.Entities;

namespace PM.Infrastructure.Data.Configurations;

public class CommentConfiguration : IEntityTypeConfiguration<Comment>
{
    public void Configure(EntityTypeBuilder<Comment> builder)
    {
        builder.ToTable("comments");
        builder.HasKey(c => c.Id);
        
        builder.Property(c => c.Id).HasColumnName("id").HasColumnType("uuid");
        builder.Property(c => c.UserId).HasColumnName("user_id").HasColumnType("uuid").IsRequired();
        builder.Property(c => c.SubTaskId).HasColumnName("sub_task_id").HasColumnType("uuid").IsRequired();
        builder.Property(c => c.Content).HasColumnName("content").HasColumnType("text").IsRequired();
        builder.Property(c => c.CreatedAt).HasColumnName("created_at").HasColumnType("timestamp with time zone");
        builder.Property(c => c.UpdatedAt).HasColumnName("updated_at").HasColumnType("timestamp with time zone");

        builder.HasOne(c => c.User)
            .WithMany()
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(c => c.SubTask)
            .WithMany(s => s.Comments)
            .HasForeignKey(c => c.SubTaskId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasQueryFilter(c => c.SubTask.DeletedAt == null);
    }
}
