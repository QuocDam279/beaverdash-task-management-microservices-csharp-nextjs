using Microsoft.EntityFrameworkCore;
using Identity.Domain.Entities;
using System.Threading;
using System.Threading.Tasks;

namespace Identity.Application.Contracts;

public interface IIdentityDbContext
{
    DbSet<User> Users { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
