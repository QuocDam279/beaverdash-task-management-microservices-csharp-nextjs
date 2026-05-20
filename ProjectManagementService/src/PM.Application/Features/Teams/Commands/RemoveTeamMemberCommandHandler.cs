using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Teams.Commands;

public class RemoveTeamMemberCommandHandler : IRequestHandler<RemoveTeamMemberCommand, bool>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IPMDbContext _dbContext;
    private readonly IDocumentIntelligenceServiceClient _docIntelClient;

    public RemoveTeamMemberCommandHandler(
        IPMDbContext dbContext,
        ICurrentUserService currentUserService,
        IDocumentIntelligenceServiceClient docIntelClient)
    {
        _currentUserService = currentUserService;
        _dbContext = dbContext;
        _docIntelClient = docIntelClient;
    }

    public async Task<bool> Handle(RemoveTeamMemberCommand request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserService.UserId ?? throw new System.UnauthorizedAccessException();
        // 1. Kiểm tra quyền của người gọi API
        var requestingMember = await _dbContext.TeamMembers
            .AsNoTracking()
            .FirstOrDefaultAsync(tm => tm.TeamId == request.TeamId && tm.UserId == currentUserId, cancellationToken);

        if (requestingMember == null)
            throw new UnauthorizedAccessException("Bạn không phải là thành viên của team này.");

        // Quyền hợp lệ: Là leader HOẶC đang tự rời team (self-leave)
        bool isSelfLeave = (_currentUserService.UserId ?? throw new System.UnauthorizedAccessException()) == request.TargetUserId;
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

        // 5. Đồng bộ thành viên dự án sang DocumentIntelligence Service
        // Lấy tất cả dự án thuộc team này
        var projectIds = await _dbContext.Set<PM.Domain.Entities.Project>()
            .Where(p => p.TeamId == request.TeamId)
            .Select(p => p.Id)
            .ToListAsync(cancellationToken);

        // Lấy danh sách thành viên còn lại (đã loại user bị xóa)
        var memberIds = await _dbContext.TeamMembers
            .Where(tm => tm.TeamId == request.TeamId)
            .Select(tm => tm.UserId)
            .ToListAsync(cancellationToken);

        // Đồng bộ cho từng dự án
        foreach (var projectId in projectIds)
        {
            await _docIntelClient.SyncProjectMembersAsync(projectId, memberIds);
        }

        return true;
    }
}
