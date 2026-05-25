using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Teams.Commands;

public class UpdateTeamCommandHandler : IRequestHandler<UpdateTeamCommand, bool>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IPMDbContext _dbContext;

    public UpdateTeamCommandHandler(IPMDbContext dbContext, ICurrentUserService currentUserService)
    {
        _currentUserService = currentUserService;
        _dbContext = dbContext;
    }

    public async Task<bool> Handle(UpdateTeamCommand request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserService.UserId ?? throw new System.UnauthorizedAccessException();
        // 1. Tìm Team cần cập nhật
        var team = await _dbContext.Teams
            .FirstOrDefaultAsync(t => t.Id == request.TeamId, cancellationToken);

        if (team == null)
            throw new InvalidOperationException("Team không tồn tại.");

        // 2. Kiểm tra quyền của người gọi API (Chỉ leader mới được cập nhật)
        var requestingMember = await _dbContext.TeamMembers
            .AsNoTracking()
            .FirstOrDefaultAsync(tm => tm.TeamId == request.TeamId && tm.UserId == currentUserId, cancellationToken);

        if (requestingMember == null || requestingMember.Role != "leader")
            throw new UnauthorizedAccessException("Chỉ có leader mới có quyền thay đổi thông tin của team.");

        // 3. Thực thi cập nhật
        if (request.Name.ToLower() != team.Name.ToLower())
        {
            var isDuplicate = await _dbContext.Teams.AnyAsync(t => t.Id != team.Id && t.Name.ToLower() == request.Name.ToLower(), cancellationToken);
            if (isDuplicate)
            {
                throw new InvalidOperationException("Tên nhóm đã tồn tại. Vui lòng chọn tên khác.");
            }
        }

        team.Name = request.Name;
        team.Description = request.Description;
        team.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return true;
    }
}
