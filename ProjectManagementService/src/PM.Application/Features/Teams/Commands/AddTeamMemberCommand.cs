using MediatR;
using System;

namespace PM.Application.Features.Teams.Commands;

public class AddTeamMemberDto
{
    public Guid UserId { get; set; }
    
    // Giả lập ID của người đang thực hiện request (trong thực tế sẽ lấy từ Token)
    public Guid RequestingUserId { get; set; } 
}

public class AddTeamMemberCommand : IRequest<bool>
{
    public Guid TeamId { get; set; }
    public Guid UserId { get; set; }
    public Guid RequestingUserId { get; set; }
}
