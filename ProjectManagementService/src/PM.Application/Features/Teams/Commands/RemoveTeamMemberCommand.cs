using MediatR;
using System;

namespace PM.Application.Features.Teams.Commands;

public class RemoveTeamMemberDto
{
    // Giả lập ID của người đang gọi API (sẽ lấy từ JWT trong thực tế)
}

public class RemoveTeamMemberCommand : IRequest<bool>
{
    public Guid TeamId { get; set; }
    public Guid TargetUserId { get; set; }
}
