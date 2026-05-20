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
    private readonly IMediator? _mediator;

    public PMDbContext(DbContextOptions<PMDbContext> options, IMediator? mediator = null) : base(options)
    {
        _mediator = mediator;
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

        // 2. Clear events ngay lập tức để tránh Infinite Loop (Lặp vô tận) nếu Handler gọi lại SaveChangesAsync
        entitiesWithEvents.ForEach(e => e.ClearDomainEvents());

        // 3. Publish tất cả các events
        if (_mediator != null)
        {
            foreach (var domainEvent in domainEvents)
            {
                await _mediator.Publish(domainEvent, cancellationToken);
            }
        }

        // 4. Thực thi việc lưu dữ liệu gốc vào DB
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
    public DbSet<ActivityLog> ActivityLogs => Set<ActivityLog>();
    public DbSet<Notification> Notifications => Set<Notification>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
        base.OnModelCreating(modelBuilder);
    }
}

