using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Teams.Commands;

public class UpdateTeamCommandHandler : IRequestHandler<UpdateTeamCommand, bool>
{
    private readonly IPMDbContext _dbContext;

    public UpdateTeamCommandHandler(IPMDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<bool> Handle(UpdateTeamCommand request, CancellationToken cancellationToken)
    {
        // 1. Tìm Team cần cập nhật
        var team = await _dbContext.Teams
            .FirstOrDefaultAsync(t => t.Id == request.TeamId, cancellationToken);

        if (team == null)
            throw new InvalidOperationException("Team không tồn tại.");

        // 2. Kiểm tra quyền của người gọi API (Chỉ leader mới được cập nhật)
        var requestingMember = await _dbContext.TeamMembers
            .AsNoTracking()
            .FirstOrDefaultAsync(tm => tm.TeamId == request.TeamId && tm.UserId == request.RequestingUserId, cancellationToken);

        if (requestingMember == null || requestingMember.Role != "leader")
            throw new UnauthorizedAccessException("Chỉ có leader mới có quyền thay đổi thông tin của team.");

        // 3. Thực thi cập nhật
        team.Name = request.Name;
        team.Description = request.Description;
        team.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return true;
    }
}
