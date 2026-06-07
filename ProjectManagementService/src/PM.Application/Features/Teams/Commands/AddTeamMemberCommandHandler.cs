using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using PM.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Teams.Commands;

public class AddTeamMemberCommandHandler : IRequestHandler<AddTeamMemberCommand, bool>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IPMDbContext _dbContext;

    public AddTeamMemberCommandHandler(
        IPMDbContext dbContext,
        ICurrentUserService currentUserService)
    {
        _currentUserService = currentUserService;
        _dbContext = dbContext;
    }

    public async Task<bool> Handle(AddTeamMemberCommand request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserService.UserId ?? throw new System.UnauthorizedAccessException();
        // 1. Kiểm tra Team có tồn tại không
        var team = await _dbContext.Teams
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == request.TeamId, cancellationToken);

        if (team == null)
            throw new InvalidOperationException("Team không tồn tại.");

        // 2. Kiểm tra quyền: Người gọi API có phải là leader của team này không?
        var requestingMember = await _dbContext.TeamMembers
            .AsNoTracking()
            .FirstOrDefaultAsync(tm => tm.TeamId == request.TeamId && tm.UserId == currentUserId, cancellationToken);

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

        // Lấy thông tin phụ trợ cho Domain Event trước khi lưu
        var projectIds = await _dbContext.Projects
            .Where(p => p.TeamId == request.TeamId)
            .Select(p => p.Id)
            .ToListAsync(cancellationToken);

        var memberIds = await _dbContext.TeamMembers
            .Where(tm => tm.TeamId == request.TeamId)
            .Select(tm => tm.UserId)
            .ToListAsync(cancellationToken);

        if (!memberIds.Contains(request.UserId))
        {
            memberIds.Add(request.UserId);
        }

        newMember.AddDomainEvent(new PM.Domain.Events.TeamMemberAddedEvent(
            request.TeamId,
            team.Name,
            currentUserId,
            request.UserId,
            projectIds,
            memberIds
        ));

        _dbContext.TeamMembers.Add(newMember);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return true;
    }
}
