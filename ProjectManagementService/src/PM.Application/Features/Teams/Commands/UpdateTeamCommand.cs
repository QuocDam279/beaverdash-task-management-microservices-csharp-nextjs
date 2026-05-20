using MediatR;
using System;

namespace PM.Application.Features.Teams.Commands;

public class UpdateTeamDto
{
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    
    // Giả lập ID của người đang thực hiện request (trong thực tế sẽ lấy từ Token)
}

public class UpdateTeamCommand : IRequest<bool>
{
    public Guid TeamId { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
}
