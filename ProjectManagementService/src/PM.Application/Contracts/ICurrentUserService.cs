namespace PM.Application.Contracts;

public interface ICurrentUserService
{
    Guid? UserId { get; }
}
