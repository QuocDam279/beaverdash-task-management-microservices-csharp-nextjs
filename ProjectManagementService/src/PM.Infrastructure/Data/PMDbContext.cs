using System.Reflection;
using Microsoft.EntityFrameworkCore;
using PM.Domain.Entities;

using System.Threading;
using System.Threading.Tasks;
using System.Linq;
using MediatR;

namespace PM.Infrastructure.Data;

public class PMDbContext : DbContext, PM.Application.Contracts.IPMDbContext
{
    public PMDbContext(DbContextOptions<PMDbContext> options) : base(options)
    {
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // 1. Lấy tất cả Entities có chứa Domain Events
        var entitiesWithEvents = ChangeTracker.Entries<PM.Domain.Common.BaseEntity>()
            .Select(e => e.Entity)
            .Where(e => e.DomainEvents.Any())
            .ToList();

        var domainEvents = entitiesWithEvents
            .SelectMany(e => e.DomainEvents)
            .ToList();

        // 2. Clear events ngay lập tức
        entitiesWithEvents.ForEach(e => e.ClearDomainEvents());

        // 3. Chuyển thành OutboxMessages
        foreach (var domainEvent in domainEvents)
        {
            var outboxMessage = new OutboxMessage
            {
                Id = Guid.CreateVersion7(),
                OccurredOnUtc = DateTime.UtcNow,
                Type = domainEvent.GetType().FullName!,
                Content = System.Text.Json.JsonSerializer.Serialize(domainEvent, domainEvent.GetType())
            };
            OutboxMessages.Add(outboxMessage);
        }

        // 4. Thực thi việc lưu dữ liệu gốc + OutboxMessages vào DB
        return await base.SaveChangesAsync(cancellationToken);
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Team> Teams => Set<Team>();
    public DbSet<TeamMember> TeamMembers => Set<TeamMember>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<BoardColumn> BoardColumns => Set<BoardColumn>();
    public DbSet<TaskItem> TaskItems => Set<TaskItem>();
    public DbSet<SubTask> SubTasks => Set<SubTask>();
    public DbSet<Comment> Comments => Set<Comment>();
    public DbSet<Attachment> Attachments => Set<Attachment>();
    public DbSet<ProjectDocument> ProjectDocuments => Set<ProjectDocument>();
    public DbSet<ActivityLog> ActivityLogs => Set<ActivityLog>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<OutboxMessage> OutboxMessages => Set<OutboxMessage>();
    public DbSet<Sprint> Sprints => Set<Sprint>();
    public DbSet<ProjectShare> ProjectShares => Set<ProjectShare>();
    public DbSet<ChatMessage> ChatMessages => Set<ChatMessage>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
        base.OnModelCreating(modelBuilder);
    }
}

