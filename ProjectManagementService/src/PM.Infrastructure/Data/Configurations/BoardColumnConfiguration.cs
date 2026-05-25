using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PM.Domain.Entities;

namespace PM.Infrastructure.Data.Configurations;

public class BoardColumnConfiguration : IEntityTypeConfiguration<BoardColumn>
{
    public void Configure(EntityTypeBuilder<BoardColumn> builder)
    {
        builder.ToTable("board_columns");

        builder.HasKey(bc => bc.Id);

        builder.Property(bc => bc.Id)
            .HasColumnName("id")
            .HasColumnType("uuid");

        builder.Property(bc => bc.ProjectId)
            .HasColumnName("project_id")
            .HasColumnType("uuid")
            .IsRequired();

        builder.Property(bc => bc.Name)
            .HasColumnName("name")
            .HasColumnType("varchar")
            .IsRequired();

        builder.Property(bc => bc.Position)
            .HasColumnName("position")
            .HasColumnType("integer")
            .IsRequired();

        builder.Property(bc => bc.WipLimit)
            .HasColumnName("wip_limit")
            .HasColumnType("integer");

        builder.Property(bc => bc.IsDone)
            .HasColumnName("is_done")
            .HasColumnType("boolean")
            .HasDefaultValue(false);

        builder.Property(bc => bc.CreatedAt)
            .HasColumnName("created_at")
            .HasColumnType("timestamp with time zone");

        builder.Property(bc => bc.UpdatedAt)
            .HasColumnName("updated_at")
            .HasColumnType("timestamp with time zone");

        builder.HasOne(bc => bc.Project)
            .WithMany(p => p.BoardColumns)
            .HasForeignKey(bc => bc.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
