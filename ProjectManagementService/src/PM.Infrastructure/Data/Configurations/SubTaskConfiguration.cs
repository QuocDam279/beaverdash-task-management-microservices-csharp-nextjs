using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PM.Domain.Entities;
using PM.Domain.Enums;

namespace PM.Infrastructure.Data.Configurations;

public class SubTaskConfiguration : IEntityTypeConfiguration<SubTask>
{
    public void Configure(EntityTypeBuilder<SubTask> builder)
    {
        builder.ToTable("sub_tasks");
        builder.HasKey(s => s.Id);

        builder.Property(s => s.Id).HasColumnName("id").HasColumnType("uuid");
        builder.Property(s => s.TaskId).HasColumnName("task_id").HasColumnType("uuid").IsRequired();
        builder.Property(s => s.AssigneeUserId).HasColumnName("assignee_user_id").HasColumnType("uuid").IsRequired(false);
        builder.Property(s => s.Title).HasColumnName("title").HasColumnType("varchar").IsRequired();
        builder.Property(s => s.IsCompleted).HasColumnName("is_completed").HasColumnType("boolean").HasDefaultValue(false);
        builder.Property(s => s.DueDate).HasColumnName("due_date").HasColumnType("timestamp with time zone");
        builder.Property(s => s.Priority)
            .HasColumnName("priority")
            .HasColumnType("varchar")
            .HasConversion<string>()
            .IsRequired(false);
        builder.Property(s => s.SortOrder).HasColumnName("sort_order").HasColumnType("integer");
        builder.Property(s => s.CreatedAt).HasColumnName("created_at").HasColumnType("timestamp with time zone");
        builder.Property(s => s.UpdatedAt).HasColumnName("updated_at").HasColumnType("timestamp with time zone");
        builder.Property(s => s.DeletedAt).HasColumnName("deleted_at").HasColumnType("timestamp with time zone").IsRequired(false);

        builder.HasOne(s => s.Task)
            .WithMany(t => t.SubTasks)
            .HasForeignKey(s => s.TaskId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(s => s.AssigneeUser)
            .WithMany()
            .HasForeignKey(s => s.AssigneeUserId)
            .OnDelete(DeleteBehavior.SetNull);
            
            
        builder.HasQueryFilter(x => x.DeletedAt == null);
    }
}
