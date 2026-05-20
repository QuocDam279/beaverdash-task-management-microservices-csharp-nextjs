using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Teams.Commands;

public class UpdateTeamMemberRoleCommandHandler : IRequestHandler<UpdateTeamMemberRoleCommand, bool>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IPMDbContext _dbContext;

    public UpdateTeamMemberRoleCommandHandler(IPMDbContext dbContext, ICurrentUserService currentUserService)
    {
        _currentUserService = currentUserService;
        _dbContext = dbContext;
    }

    public async Task<bool> Handle(UpdateTeamMemberRoleCommand request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserService.UserId ?? throw new System.UnauthorizedAccessException();
        // 1. Kiểm tra quyền của người gọi API (Chỉ leader mới được cập nhật role)
        var requestingMember = await _dbContext.TeamMembers
            .AsNoTracking()
            .FirstOrDefaultAsync(tm => tm.TeamId == request.TeamId && tm.UserId == currentUserId, cancellationToken);

        if (requestingMember == null || requestingMember.Role != "leader")
            throw new UnauthorizedAccessException("Chỉ có leader mới có quyền thay đổi Role của thành viên.");

        // 2. Tìm thành viên cần cập nhật
        var targetMember = await _dbContext.TeamMembers
            .FirstOrDefaultAsync(tm => tm.TeamId == request.TeamId && tm.UserId == request.TargetUserId, cancellationToken);

        if (targetMember == null)
            throw new InvalidOperationException("Thành viên không tồn tại trong team này.");

        // 3. (Tùy chọn) Chặn tự giáng chức mình nếu là leader duy nhất - Ở mức cơ bản thì bỏ qua
        
        // 4. Cập nhật Role
        targetMember.Role = request.NewRole.ToLower(); // "leader" hoặc "member"

        await _dbContext.SaveChangesAsync(cancellationToken);

        return true;
    }
}
