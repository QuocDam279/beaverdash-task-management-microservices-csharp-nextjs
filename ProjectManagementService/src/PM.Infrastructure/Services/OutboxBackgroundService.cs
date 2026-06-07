using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using PM.Domain.Common;
using PM.Domain.Entities;
using PM.Infrastructure.Data;
using System;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Infrastructure.Services;

public class OutboxBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<OutboxBackgroundService> _logger;
    private DateTime _lastCleanupTime = DateTime.MinValue;

    public OutboxBackgroundService(IServiceProvider serviceProvider, ILogger<OutboxBackgroundService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("OutboxBackgroundService is starting.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessOutboxMessagesAsync(stoppingToken);
                await CleanupOldMessagesAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while processing outbox messages.");
            }

            await Task.Delay(TimeSpan.FromSeconds(1), stoppingToken);
        }

        _logger.LogInformation("OutboxBackgroundService is stopping.");
    }

    private async Task ProcessOutboxMessagesAsync(CancellationToken stoppingToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<PMDbContext>();
        var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();

        var messages = await dbContext.OutboxMessages
            .Where(m => m.ProcessedOnUtc == null && m.RetryCount < 5)
            .OrderBy(m => m.OccurredOnUtc)
            .Take(20)
            .ToListAsync(stoppingToken);

        if (!messages.Any())
        {
            return;
        }

        _logger.LogInformation("Processing {Count} outbox messages...", messages.Count);

        foreach (var message in messages)
        {
            try
            {
                // Tìm loại Event từ assembly của Domain
                var assembly = typeof(IDomainEvent).Assembly;
                var eventType = assembly.GetType(message.Type);

                if (eventType == null)
                {
                    _logger.LogWarning("Event type '{Type}' not found. Skipping message '{Id}'.", message.Type, message.Id);
                    message.ProcessedOnUtc = DateTime.UtcNow;
                    message.Error = $"Event type '{message.Type}' not found in assembly.";
                    continue;
                }

                var domainEvent = JsonSerializer.Deserialize(message.Content, eventType);
                if (domainEvent == null)
                {
                    _logger.LogWarning("Deserialization failed for message '{Id}' of type '{Type}'.", message.Id, message.Type);
                    message.ProcessedOnUtc = DateTime.UtcNow;
                    message.Error = "Deserialization failed.";
                    continue;
                }

                await mediator.Publish(domainEvent, stoppingToken);

                message.ProcessedOnUtc = DateTime.UtcNow;
                message.Error = null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to process outbox message {Id} of type '{Type}'.", message.Id, message.Type);
                message.Error = ex.ToString();
                message.RetryCount++;
            }
        }

        await dbContext.SaveChangesAsync(stoppingToken);
    }

    private async Task CleanupOldMessagesAsync(CancellationToken stoppingToken)
    {
        // Chỉ dọn dẹp mỗi 1 giờ một lần để tiết kiệm tài nguyên
        if (DateTime.UtcNow - _lastCleanupTime < TimeSpan.FromHours(1))
        {
            return;
        }

        _logger.LogInformation("Running cleanup for processed/failed outbox messages older than 7 days...");

        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<PMDbContext>();

        var cutoff = DateTime.UtcNow.AddDays(-7);
        var rowsDeleted = await dbContext.OutboxMessages
            .Where(m => (m.ProcessedOnUtc != null && m.ProcessedOnUtc < cutoff) || 
                        (m.ProcessedOnUtc == null && m.RetryCount >= 5 && m.OccurredOnUtc < cutoff))
            .ExecuteDeleteAsync(stoppingToken);

        if (rowsDeleted > 0)
        {
            _logger.LogInformation("Deleted {Count} old outbox messages from database.", rowsDeleted);
        }

        _lastCleanupTime = DateTime.UtcNow;
    }
}
