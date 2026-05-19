using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using PM.Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Teams.Commands;

public class AddTeamMemberCommandHandler : IRequestHandler<AddTeamMemberCommand, bool>
{
    private readonly IPMDbContext _dbContext;

    public AddTeamMemberCommandHandler(IPMDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<bool> Handle(AddTeamMemberCommand request, CancellationToken cancellationToken)
    {
        // 1. Kiểm tra Team có tồn tại không
        var team = await _dbContext.Teams
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == request.TeamId, cancellationToken);

        if (team == null)
            throw new InvalidOperationException("Team không tồn tại.");

        // 2. Kiểm tra quyền: Người gọi API có phải là leader của team này không?
        var requestingMember = await _dbContext.TeamMembers
            .AsNoTracking()
            .FirstOrDefaultAsync(tm => tm.TeamId == request.TeamId && tm.UserId == request.RequestingUserId, cancellationToken);

        if (requestingMember == null || requestingMember.Role != "leader")
            throw new UnauthorizedAccessException("Chỉ có leader mới có quyền thêm thành viên vào team.");

        // 3. Kiểm tra user đã ở trong team chưa
        var existingMember = await _dbContext.TeamMembers
            .AsNoTracking()
            .FirstOrDefaultAsync(tm => tm.TeamId == request.TeamId && tm.UserId == request.UserId, cancellationToken);

        if (existingMember != null)
            throw new InvalidOperationException("User này đã là thành viên của team.");

        // 4. Thêm thành viên mới với quyền mặc định là "member"
        var newMember = new TeamMember
        {
            TeamId = request.TeamId,
            UserId = request.UserId,
            Role = "member",
            JoinedAt = DateTime.UtcNow
        };

        _dbContext.TeamMembers.Add(newMember);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return true;
    }
}
