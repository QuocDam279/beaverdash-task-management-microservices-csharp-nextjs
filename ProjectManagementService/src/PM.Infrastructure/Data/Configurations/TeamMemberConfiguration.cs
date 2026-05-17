using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PM.Domain.Entities;

namespace PM.Infrastructure.Data.Configurations;

public class TeamMemberConfiguration : IEntityTypeConfiguration<TeamMember>
{
    public void Configure(EntityTypeBuilder<TeamMember> builder)
    {
        builder.ToTable("team_members");

        builder.HasKey(tm => new { tm.TeamId, tm.UserId });

        builder.Property(tm => tm.TeamId)
            .HasColumnName("team_id")
            .HasColumnType("uuid");

        builder.Property(tm => tm.UserId)
            .HasColumnName("user_id")
            .HasColumnType("uuid");

        builder.Property(tm => tm.Role)
            .HasColumnName("role")
            .HasColumnType("varchar")
            .IsRequired();

        builder.Property(tm => tm.JoinedAt)
            .HasColumnName("joined_at")
            .HasColumnType("timestamp with time zone")
            .HasDefaultValueSql("now()");

        builder.HasOne(tm => tm.Team)
            .WithMany(t => t.Members)
            .HasForeignKey(tm => tm.TeamId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(tm => tm.User)
            .WithMany()
            .HasForeignKey(tm => tm.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
