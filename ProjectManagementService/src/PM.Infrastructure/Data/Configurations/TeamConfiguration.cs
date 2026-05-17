using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PM.Domain.Entities;

namespace PM.Infrastructure.Data.Configurations;

public class TeamConfiguration : IEntityTypeConfiguration<Team>
{
    public void Configure(EntityTypeBuilder<Team> builder)
    {
        builder.ToTable("teams");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.Id)
            .HasColumnName("id")
            .HasColumnType("uuid");

        builder.Property(t => t.Name)
            .HasColumnName("name")
            .HasColumnType("varchar")
            .IsRequired();

        builder.Property(t => t.Description)
            .HasColumnName("description")
            .HasColumnType("text");

        builder.Property(t => t.OwnerUserId)
            .HasColumnName("owner_user_id")
            .HasColumnType("uuid")
            .IsRequired();

        builder.Property(t => t.CreatedAt)
            .HasColumnName("created_at")
            .HasColumnType("timestamp with time zone");

        builder.Property(t => t.UpdatedAt)
            .HasColumnName("updated_at")
            .HasColumnType("timestamp with time zone");

        builder.HasOne(t => t.OwnerUser)
            .WithMany()
            .HasForeignKey(t => t.OwnerUserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
