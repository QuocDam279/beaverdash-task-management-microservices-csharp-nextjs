using MediatR;
using System;

namespace PM.Application.Features.Teams.Commands;

public class UpdateTeamMemberRoleDto
{
    public string NewRole { get; set; } = null!;
    
    // Giả lập ID của người đang thực hiện request (trong thực tế sẽ lấy từ Token)
    public Guid RequestingUserId { get; set; } 
}

public class UpdateTeamMemberRoleCommand : IRequest<bool>
{
    public Guid TeamId { get; set; }
    public Guid TargetUserId { get; set; }
    public string NewRole { get; set; } = null!;
    public Guid RequestingUserId { get; set; }
}
