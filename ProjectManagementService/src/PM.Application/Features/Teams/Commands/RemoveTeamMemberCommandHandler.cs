using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Teams.Commands;

public class RemoveTeamMemberCommandHandler : IRequestHandler<RemoveTeamMemberCommand, bool>
{
    private readonly IPMDbContext _dbContext;

    public RemoveTeamMemberCommandHandler(IPMDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<bool> Handle(RemoveTeamMemberCommand request, CancellationToken cancellationToken)
    {
        // 1. Kiểm tra quyền của người gọi API
        var requestingMember = await _dbContext.TeamMembers
            .AsNoTracking()
            .FirstOrDefaultAsync(tm => tm.TeamId == request.TeamId && tm.UserId == request.RequestingUserId, cancellationToken);

        if (requestingMember == null)
            throw new UnauthorizedAccessException("Bạn không phải là thành viên của team này.");

        // Quyền hợp lệ: Là leader HOẶC đang tự rời team (self-leave)
        bool isSelfLeave = request.RequestingUserId == request.TargetUserId;
        if (!isSelfLeave && requestingMember.Role != "leader")
            throw new UnauthorizedAccessException("Chỉ leader mới có quyền xóa thành viên khác khỏi team.");

        // 2. Tìm thành viên cần xóa
        var targetMember = await _dbContext.TeamMembers
            .FirstOrDefaultAsync(tm => tm.TeamId == request.TeamId && tm.UserId == request.TargetUserId, cancellationToken);

        if (targetMember == null)
            throw new InvalidOperationException("Thành viên không tồn tại trong team này.");

        // 3. Quy tắc an toàn: Không cho phép team bị mất leader cuối cùng
        if (targetMember.Role == "leader")
        {
            var leaderCount = await _dbContext.TeamMembers
                .CountAsync(tm => tm.TeamId == request.TeamId && tm.Role == "leader", cancellationToken);

            if (leaderCount <= 1)
                throw new InvalidOperationException("Không thể xóa leader cuối cùng. Vui lòng chỉ định một leader khác trước khi thực hiện.");
        }

        // 4. Thực thi xóa
        _dbContext.TeamMembers.Remove(targetMember);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return true;
    }
}
