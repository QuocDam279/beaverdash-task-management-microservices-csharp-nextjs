using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PM.Domain.Entities;

namespace PM.Infrastructure.Data.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("users");

        builder.HasKey(u => u.Id);

        builder.Property(u => u.Id)
            .HasColumnName("id")
            .HasColumnType("uuid");

        builder.Property(u => u.Email)
            .HasColumnName("email")
            .HasColumnType("varchar")
            .IsRequired();

        builder.HasIndex(u => u.Email)
            .IsUnique();

        builder.Property(u => u.DisplayName)
            .HasColumnName("display_name")
            .HasColumnType("varchar")
            .IsRequired();

        builder.Property(u => u.Avatar)
            .HasColumnName("avatar")
            .HasColumnType("varchar");
    }
}
