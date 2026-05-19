using MediatR;
using System;

namespace PM.Application.Features.Teams.Commands;

public class DeleteTeamDto
{
    // Giả lập ID người thực hiện request (sẽ lấy từ JWT thực tế)
    public Guid RequestingUserId { get; set; }
}

public class DeleteTeamCommand : IRequest<bool>
{
    public Guid TeamId { get; set; }
    public Guid RequestingUserId { get; set; }
}
