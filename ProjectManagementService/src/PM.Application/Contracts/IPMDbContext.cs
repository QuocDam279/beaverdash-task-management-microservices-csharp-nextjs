using Microsoft.EntityFrameworkCore;
using PM.Domain.Entities;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Contracts;

public interface IPMDbContext
{
    DbSet<User> Users { get; }
    DbSet<Team> Teams { get; }
    DbSet<TeamMember> TeamMembers { get; }
    DbSet<Project> Projects { get; }
    DbSet<BoardColumn> BoardColumns { get; }
    DbSet<TaskItem> TaskItems { get; }
    DbSet<SubTask> SubTasks { get; }
    DbSet<Comment> Comments { get; }
    DbSet<Attachment> Attachments { get; }
    DbSet<ProjectDocument> ProjectDocuments { get; }
    DbSet<ActivityLog> ActivityLogs { get; }
    DbSet<Notification> Notifications { get; }
    DbSet<OutboxMessage> OutboxMessages { get; }

    DbSet<TEntity> Set<TEntity>() where TEntity : class;
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
