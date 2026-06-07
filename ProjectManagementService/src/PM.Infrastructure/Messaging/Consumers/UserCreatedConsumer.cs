using System.Threading.Tasks;
using EventBus.Messages.Events;
using MassTransit;
using Microsoft.EntityFrameworkCore;
using PM.Domain.Entities;

// Note: Ensure your ProjectManagement DbContext is included, here assuming PMDbContext.
// using PM.Infrastructure.Data;

namespace PM.Infrastructure.Messaging.Consumers;

public class UserCreatedConsumer : IConsumer<UserCreatedEvent>
{
    private readonly PM.Application.Contracts.IPMDbContext _dbContext;

    // Injecting DbContext (or your specific PMDbContext)
    public UserCreatedConsumer(PM.Application.Contracts.IPMDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task Consume(ConsumeContext<UserCreatedEvent> context)
    {
        var message = context.Message;

        var userExists = await _dbContext.Set<User>().AnyAsync(u => u.Id == message.Id);
        
        if (!userExists)
        {
            var user = new User
            {
                Id = message.Id,
                Email = message.Email.ToLowerInvariant(),
                DisplayName = message.DisplayName,
                Avatar = message.Avatar
            };

            _dbContext.Set<User>().Add(user);
            await _dbContext.SaveChangesAsync();
        }
    }
}
