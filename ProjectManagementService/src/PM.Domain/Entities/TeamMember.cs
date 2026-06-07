using PM.Domain.Common;

namespace PM.Domain.Entities;

public class TeamMember : BaseEntity
{
    public Guid TeamId { get; set; }
    public Team? Team { get; set; }

    public Guid UserId { get; set; }
    public User? User { get; set; }

    public string Role { get; set; } = null!;
    public DateTime JoinedAt { get; set; }
}
