using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using PM.Application.Contracts;
using PM.Application.Features.Notifications.EventHandlers;
using PM.Domain.Entities;
using PM.Domain.Enums;
using PM.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Infrastructure.Services;

public class DeadlineReminderBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<DeadlineReminderBackgroundService> _logger;
    private DateOnly? _lastRunDate;

    public DeadlineReminderBackgroundService(
        IServiceProvider serviceProvider,
        ILogger<DeadlineReminderBackgroundService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("DeadlineReminderBackgroundService is starting.");

        // Configurable interval (default to 15 minutes)
        var intervalEnv = Environment.GetEnvironmentVariable("NOTIFICATION_CHECK_INTERVAL_MINUTES");
        var interval = TimeSpan.FromMinutes(15);
        if (!string.IsNullOrEmpty(intervalEnv) && int.TryParse(intervalEnv, out var parsedInterval))
        {
            interval = TimeSpan.FromMinutes(parsedInterval);
        }

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var vnNow = DateTime.UtcNow.AddHours(7);
                var vnToday = DateOnly.FromDateTime(vnNow);

                var scheduledHour = 7;
                var envHour = Environment.GetEnvironmentVariable("NOTIFICATION_SCHEDULED_HOUR_VN");
                if (!string.IsNullOrEmpty(envHour) && int.TryParse(envHour, out var parsedHour))
                {
                    scheduledHour = parsedHour;
                }

                // Run if the hour matches and we haven't successfully completed runs today
                if (vnNow.Hour == scheduledHour && _lastRunDate != vnToday)
                {
                    _logger.LogInformation("Starting deadline and overdue notifications processing for date {Date}...", vnToday);
                    await SendDeadlineRemindersAsync(vnNow, stoppingToken);
                    _lastRunDate = vnToday;
                    _logger.LogInformation("Finished deadline and overdue notifications processing for date {Date}.", vnToday);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred in DeadlineReminderBackgroundService.");
            }

            await Task.Delay(interval, stoppingToken);
        }

        _logger.LogInformation("DeadlineReminderBackgroundService is stopping.");
    }

    private async Task SendDeadlineRemindersAsync(DateTime vnNow, CancellationToken stoppingToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<PMDbContext>();
        var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();

        var systemUser = await dbContext.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Email == "system@beaverdash.com" || u.DisplayName == "System", stoppingToken);
        var systemUserId = systemUser?.Id ?? Guid.Empty;

        // 1. Process SubTasks (3, 2, 1 days remaining & 1 day overdue)
        await ProcessSubTaskRemindersAsync(dbContext, notificationService, vnNow, systemUserId, stoppingToken);

        // 2. Process TaskItems (3, 2, 1 days remaining & 1 day overdue)
        await ProcessTaskRemindersAsync(dbContext, notificationService, vnNow, systemUserId, stoppingToken);

        // 3. Process Projects (7, 3, 1 days remaining & 1 day overdue)
        await ProcessProjectRemindersAsync(dbContext, notificationService, vnNow, systemUserId, stoppingToken);

        // 4. Process Sprints (3, 2, 1 days remaining)
        await ProcessSprintRemindersAsync(dbContext, notificationService, vnNow, systemUserId, stoppingToken);
    }

    private async Task ProcessSubTaskRemindersAsync(
        PMDbContext dbContext,
        INotificationService notificationService,
        DateTime vnNow,
        Guid systemUserId,
        CancellationToken stoppingToken)
    {
        var subTasks = await dbContext.SubTasks
            .Include(st => st.Task)
                .ThenInclude(t => t!.BoardColumn)
            .Where(st => !st.IsCompleted && st.DueDate != null && st.DeletedAt == null && st.AssigneeUserId != null)
            .ToListAsync(stoppingToken);

        foreach (var st in subTasks)
        {
            var dueDate = st.DueDate!.Value.Date;
            var daysRemaining = (dueDate - vnNow.Date).Days;

            string? notifType = null;
            string? content = null;
            int trackingVal = 0;

            if (daysRemaining == 3 || daysRemaining == 2 || daysRemaining == 1)
            {
                notifType = "subtask_deadline_reminder";
                content = $"Nhiệm vụ '{st.Title}' thuộc công việc '{st.Task?.Title}' sắp đến hạn trong {daysRemaining} ngày.";
                trackingVal = daysRemaining;
            }
            else if (daysRemaining == -1) // Overdue by 1 day
            {
                notifType = "subtask_overdue";
                content = $"Cảnh báo: Nhiệm vụ '{st.Title}' thuộc công việc '{st.Task?.Title}' đã quá hạn hoàn thành 1 ngày.";
                trackingVal = -1;
            }

            if (notifType != null && content != null)
            {
                var userId = st.AssigneeUserId!.Value;
                bool alreadySent = await dbContext.NotificationTrackings
                    .AnyAsync(nt => nt.EntityId == st.Id && nt.NotificationType == notifType && nt.DaysRemainingOrOverdue == trackingVal && nt.UserId == userId, stoppingToken);

                if (!alreadySent)
                {
                    var notif = new Notification
                    {
                        Id = Guid.CreateVersion7(),
                        UserId = userId,
                        ActorUserId = systemUserId,
                        Type = notifType,
                        Content = content,
                        ActionUrl = st.Task != null && st.Task.BoardColumn != null
                            ? await NotificationUrlHelper.GetTaskUrlAsync(
                                dbContext,
                                st.Task.BoardColumn.ProjectId,
                                st.Task.Id,
                                userId,
                                stoppingToken)
                            : "/",
                        IsRead = false,
                        IsSentViaEmail = false,
                        CreatedAt = DateTime.UtcNow
                    };

                    dbContext.Notifications.Add(notif);
                    dbContext.NotificationTrackings.Add(new NotificationTracking
                    {
                        Id = Guid.CreateVersion7(),
                        EntityId = st.Id,
                        EntityType = "SubTask",
                        NotificationType = notifType,
                        DaysRemainingOrOverdue = trackingVal,
                        UserId = userId,
                        SentAtUtc = DateTime.UtcNow
                    });

                    await dbContext.SaveChangesAsync(stoppingToken);

                    try
                    {
                        await notificationService.SendNotificationToUserAsync(
                            userId.ToString(),
                            new
                            {
                                Id = notif.Id,
                                Type = notif.Type,
                                Content = notif.Content,
                                ActionUrl = notif.ActionUrl,
                                CreatedAt = notif.CreatedAt,
                                ActorUserId = systemUserId,
                                ActorDisplayName = "Hệ thống",
                                ActorAvatar = (string?)null
                            }
                        );
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Failed to send SignalR subtask reminder to user {UserId}.", userId);
                    }
                }
            }
        }
    }

    private async Task ProcessTaskRemindersAsync(
        PMDbContext dbContext,
        INotificationService notificationService,
        DateTime vnNow,
        Guid systemUserId,
        CancellationToken stoppingToken)
    {
        var tasks = await dbContext.TaskItems
            .Include(t => t.BoardColumn)
            .Where(t => t.CompletedAt == null && t.DueDate != null && t.DeletedAt == null)
            .ToListAsync(stoppingToken);

        foreach (var t in tasks)
        {
            if (t.BoardColumn != null && t.BoardColumn.IsDone)
                continue;

            var dueDate = t.DueDate!.Value.Date;
            var daysRemaining = (dueDate - vnNow.Date).Days;

            string? notifType = null;
            string? content = null;
            int trackingVal = 0;

            if (daysRemaining == 3 || daysRemaining == 2 || daysRemaining == 1)
            {
                notifType = "task_deadline_reminder";
                content = $"Công việc '{t.Title}' sắp đến hạn trong {daysRemaining} ngày.";
                trackingVal = daysRemaining;
            }
            else if (daysRemaining == -1) // Overdue by 1 day
            {
                notifType = "task_overdue";
                content = $"Cảnh báo: Công việc '{t.Title}' đã quá hạn hoàn thành 1 ngày.";
                trackingVal = -1;
            }

            if (notifType != null && content != null)
            {
                var userId = t.CreatedByUserId;
                bool alreadySent = await dbContext.NotificationTrackings
                    .AnyAsync(nt => nt.EntityId == t.Id && nt.NotificationType == notifType && nt.DaysRemainingOrOverdue == trackingVal && nt.UserId == userId, stoppingToken);

                if (!alreadySent)
                {
                    var notif = new Notification
                    {
                        Id = Guid.CreateVersion7(),
                        UserId = userId,
                        ActorUserId = systemUserId,
                        Type = notifType,
                        Content = content,
                        ActionUrl = t.BoardColumn != null
                            ? await NotificationUrlHelper.GetTaskUrlAsync(
                                dbContext,
                                t.BoardColumn.ProjectId,
                                t.Id,
                                userId,
                                stoppingToken)
                            : "/",
                        IsRead = false,
                        IsSentViaEmail = false,
                        CreatedAt = DateTime.UtcNow
                    };

                    dbContext.Notifications.Add(notif);
                    dbContext.NotificationTrackings.Add(new NotificationTracking
                    {
                        Id = Guid.CreateVersion7(),
                        EntityId = t.Id,
                        EntityType = "TaskItem",
                        NotificationType = notifType,
                        DaysRemainingOrOverdue = trackingVal,
                        UserId = userId,
                        SentAtUtc = DateTime.UtcNow
                    });

                    await dbContext.SaveChangesAsync(stoppingToken);

                    try
                    {
                        await notificationService.SendNotificationToUserAsync(
                            userId.ToString(),
                            new
                            {
                                Id = notif.Id,
                                Type = notif.Type,
                                Content = notif.Content,
                                ActionUrl = notif.ActionUrl,
                                CreatedAt = notif.CreatedAt,
                                ActorUserId = systemUserId,
                                ActorDisplayName = "Hệ thống",
                                ActorAvatar = (string?)null
                            }
                        );
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Failed to send SignalR task reminder to user {UserId}.", userId);
                    }
                }
            }
        }
    }

    private async Task ProcessProjectRemindersAsync(
        PMDbContext dbContext,
        INotificationService notificationService,
        DateTime vnNow,
        Guid systemUserId,
        CancellationToken stoppingToken)
    {
        var projects = await dbContext.Projects
            .Where(p => p.DueDate != null && p.Progress < 100)
            .ToListAsync(stoppingToken);

        foreach (var p in projects)
        {
            var dueDate = p.DueDate!.Value.Date;
            var daysRemaining = (dueDate - vnNow.Date).Days;

            string? notifType = null;
            string? content = null;
            int trackingVal = 0;

            if (daysRemaining == 7 || daysRemaining == 3 || daysRemaining == 1)
            {
                notifType = "project_deadline_reminder";
                content = $"Dự án '{p.Name}' sắp đến hạn hoàn thành trong {daysRemaining} ngày.";
                trackingVal = daysRemaining;
            }
            else if (daysRemaining == -1) // Overdue by 1 day
            {
                notifType = "project_overdue_leader";
                content = $"Cảnh báo: Dự án '{p.Name}' đã quá hạn hoàn thành 1 ngày.";
                trackingVal = -1;
            }

            if (notifType != null && content != null)
            {
                // Recipients: Project Creator + Team leaders
                var recipients = new HashSet<Guid> { p.CreatedByUserId };

                if (p.TeamId.HasValue)
                {
                    var leaders = await dbContext.TeamMembers
                        .AsNoTracking()
                        .Where(tm => tm.TeamId == p.TeamId.Value && (tm.Role == "leader" || tm.Role == "Owner"))
                        .Select(tm => tm.UserId)
                        .ToListAsync(stoppingToken);

                    foreach (var leaderId in leaders)
                    {
                        recipients.Add(leaderId);
                    }
                }

                foreach (var userId in recipients)
                {
                    bool alreadySent = await dbContext.NotificationTrackings
                        .AnyAsync(nt => nt.EntityId == p.Id && nt.NotificationType == notifType && nt.DaysRemainingOrOverdue == trackingVal && nt.UserId == userId, stoppingToken);

                    if (!alreadySent)
                    {
                        var notif = new Notification
                        {
                            Id = Guid.CreateVersion7(),
                            UserId = userId,
                            ActorUserId = systemUserId,
                            Type = notifType,
                            Content = content,
                            ActionUrl = $"/projects/{p.Id}/board",
                            IsRead = false,
                            IsSentViaEmail = false,
                            CreatedAt = DateTime.UtcNow
                        };

                        dbContext.Notifications.Add(notif);
                        dbContext.NotificationTrackings.Add(new NotificationTracking
                        {
                            Id = Guid.CreateVersion7(),
                            EntityId = p.Id,
                            EntityType = "Project",
                            NotificationType = notifType,
                            DaysRemainingOrOverdue = trackingVal,
                            UserId = userId,
                            SentAtUtc = DateTime.UtcNow
                        });

                        await dbContext.SaveChangesAsync(stoppingToken);

                        try
                        {
                            await notificationService.SendNotificationToUserAsync(
                                userId.ToString(),
                                new
                                {
                                    Id = notif.Id,
                                    Type = notif.Type,
                                    Content = notif.Content,
                                    ActionUrl = notif.ActionUrl,
                                    CreatedAt = notif.CreatedAt,
                                    ActorUserId = systemUserId,
                                    ActorDisplayName = "Hệ thống",
                                    ActorAvatar = (string?)null
                                }
                            );
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, "Failed to send SignalR project reminder to user {UserId}.", userId);
                        }
                    }
                }
            }
        }
    }

    private async Task ProcessSprintRemindersAsync(
        PMDbContext dbContext,
        INotificationService notificationService,
        DateTime vnNow,
        Guid systemUserId,
        CancellationToken stoppingToken)
    {
        var sprints = await dbContext.Sprints
            .Include(s => s.Project)
            .Where(s => s.Status == SprintStatus.Active && s.EndDate != null)
            .ToListAsync(stoppingToken);

        foreach (var s in sprints)
        {
            var endDate = s.EndDate!.Value.Date;
            var daysRemaining = (endDate - vnNow.Date).Days;

            if (daysRemaining == 3 || daysRemaining == 2 || daysRemaining == 1)
            {
                var notifType = "sprint_ending_reminder";
                var content = $"Sprint '{s.Name}' của dự án '{s.Project?.Name}' sắp kết thúc trong {daysRemaining} ngày.";
                var trackingVal = daysRemaining;

                if (s.Project?.TeamId != null)
                {
                    var teamMembers = await dbContext.TeamMembers
                        .AsNoTracking()
                        .Where(tm => tm.TeamId == s.Project.TeamId.Value)
                        .Select(tm => tm.UserId)
                        .ToListAsync(stoppingToken);

                    foreach (var userId in teamMembers)
                    {
                        bool alreadySent = await dbContext.NotificationTrackings
                            .AnyAsync(nt => nt.EntityId == s.Id && nt.NotificationType == notifType && nt.DaysRemainingOrOverdue == trackingVal && nt.UserId == userId, stoppingToken);

                        if (!alreadySent)
                        {
                            var notif = new Notification
                            {
                                Id = Guid.CreateVersion7(),
                                UserId = userId,
                                ActorUserId = systemUserId,
                                Type = notifType,
                                Content = content,
                                ActionUrl = $"/projects/{s.ProjectId}/board",
                                IsRead = false,
                                IsSentViaEmail = false,
                                CreatedAt = DateTime.UtcNow
                            };

                            dbContext.Notifications.Add(notif);
                            dbContext.NotificationTrackings.Add(new NotificationTracking
                            {
                                Id = Guid.CreateVersion7(),
                                EntityId = s.Id,
                                EntityType = "Sprint",
                                NotificationType = notifType,
                                DaysRemainingOrOverdue = trackingVal,
                                UserId = userId,
                                SentAtUtc = DateTime.UtcNow
                            });

                            await dbContext.SaveChangesAsync(stoppingToken);

                            try
                            {
                                await notificationService.SendNotificationToUserAsync(
                                    userId.ToString(),
                                    new
                                    {
                                        Id = notif.Id,
                                        Type = notif.Type,
                                        Content = notif.Content,
                                        ActionUrl = notif.ActionUrl,
                                        CreatedAt = notif.CreatedAt,
                                        ActorUserId = systemUserId,
                                        ActorDisplayName = "Hệ thống",
                                        ActorAvatar = (string?)null
                                    }
                                );
                            }
                            catch (Exception ex)
                            {
                                _logger.LogError(ex, "Failed to send SignalR sprint reminder to user {UserId}.", userId);
                            }
                        }
                    }
                }
            }
        }
    }
}
