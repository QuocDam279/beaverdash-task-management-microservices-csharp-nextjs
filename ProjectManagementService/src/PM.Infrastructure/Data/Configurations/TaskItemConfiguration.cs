using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PM.Domain.Entities;
using PM.Domain.Enums;

namespace PM.Infrastructure.Data.Configurations;

public class TaskItemConfiguration : IEntityTypeConfiguration<TaskItem>
{
    public void Configure(EntityTypeBuilder<TaskItem> builder)
    {
        builder.ToTable("tasks");
        builder.HasKey(t => t.Id);

        builder.Property(t => t.Id).HasColumnName("id").HasColumnType("uuid");
        builder.Property(t => t.BoardColumnId).HasColumnName("board_column_id").HasColumnType("uuid").IsRequired();
        builder.Property(t => t.Title).HasColumnName("title").HasColumnType("varchar").IsRequired();
        builder.Property(t => t.Description).HasColumnName("description").HasColumnType("text");
        builder.Property(t => t.Priority)
            .HasColumnName("priority")
            .HasColumnType("varchar")
            .HasConversion<string>()
            .IsRequired(false);
        builder.Property(t => t.DueDate).HasColumnName("due_date").HasColumnType("timestamp with time zone");
        builder.Property(t => t.StartDate).HasColumnName("start_date").HasColumnType("timestamp with time zone");
        builder.Property(t => t.SortOrder).HasColumnName("sort_order").HasColumnType("double precision");
        builder.Property(t => t.CreatedByUserId).HasColumnName("created_by_user_id").HasColumnType("uuid").IsRequired();
        builder.Property(t => t.CompletedAt).HasColumnName("completed_at").HasColumnType("timestamp with time zone").IsRequired(false);
        builder.Property(t => t.DeletedAt).HasColumnName("deleted_at").HasColumnType("timestamp with time zone").IsRequired(false);
        builder.Property(t => t.CreatedAt).HasColumnName("created_at").HasColumnType("timestamp with time zone");
        builder.Property(t => t.UpdatedAt).HasColumnName("updated_at").HasColumnType("timestamp with time zone");

        builder.HasOne(t => t.BoardColumn)
            .WithMany(bc => bc.TaskItems)
            .HasForeignKey(t => t.BoardColumnId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(t => t.SprintId)
            .HasColumnName("sprint_id")
            .HasColumnType("uuid")
            .IsRequired(false);

        builder.HasOne(t => t.Sprint)
            .WithMany(s => s.TaskItems)
            .HasForeignKey(t => t.SprintId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(t => t.CreatedByUser)
            .WithMany()
            .HasForeignKey(t => t.CreatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);
            
        builder.HasQueryFilter(x => x.DeletedAt == null);

        builder.HasIndex(t => new { t.BoardColumnId, t.SortOrder })
            .HasDatabaseName("ix_tasks_board_column_id_sort_order");

        builder.HasIndex(t => t.SprintId)
            .HasDatabaseName("ix_tasks_sprint_id");
    }
}
