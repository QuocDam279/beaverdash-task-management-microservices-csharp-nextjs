using System.Threading.Tasks;
using EventBus.Messages.Events;
using MassTransit;
using Microsoft.EntityFrameworkCore;
using PM.Domain.Entities;

namespace PM.Infrastructure.Messaging.Consumers;

public class UserUpdatedConsumer : IConsumer<UserUpdatedEvent>
{
    private readonly PM.Application.Contracts.IPMDbContext _dbContext;

    public UserUpdatedConsumer(PM.Application.Contracts.IPMDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task Consume(ConsumeContext<UserUpdatedEvent> context)
    {
        var message = context.Message;

        var user = await _dbContext.Set<User>().FirstOrDefaultAsync(u => u.Id == message.Id);
        
        if (user != null)
        {
            user.Email = message.Email.ToLowerInvariant();
            user.DisplayName = message.DisplayName;
            user.Avatar = message.Avatar;

            await _dbContext.SaveChangesAsync();
        }
    }
}
