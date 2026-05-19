using MediatR;
using System;

namespace PM.Application.Features.Teams.Commands;

public class CreateTeamCommand : IRequest<Guid>
{
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    
    // Giả lập UserId gọi request, thường sẽ được lấy từ JWT Token ở middleware hoặc controller
    public Guid CreatedByUserId { get; set; } 
}
