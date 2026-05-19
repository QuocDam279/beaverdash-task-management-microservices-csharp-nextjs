using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Teams.Commands;

public class DeleteTeamCommandHandler : IRequestHandler<DeleteTeamCommand, bool>
{
    private readonly IPMDbContext _dbContext;

    public DeleteTeamCommandHandler(IPMDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<bool> Handle(DeleteTeamCommand request, CancellationToken cancellationToken)
    {
        // 1. Kiểm tra Team tồn tại
        var team = await _dbContext.Teams
            .FirstOrDefaultAsync(t => t.Id == request.TeamId, cancellationToken);

        if (team == null)
            throw new InvalidOperationException("Team không tồn tại.");

        // 2. Kiểm tra quyền xóa (phải là leader)
        var requestingMember = await _dbContext.TeamMembers
            .AsNoTracking()
            .FirstOrDefaultAsync(tm => tm.TeamId == request.TeamId && tm.UserId == request.RequestingUserId, cancellationToken);

        if (requestingMember == null || requestingMember.Role != "leader")
            throw new UnauthorizedAccessException("Chỉ có leader mới có quyền xóa Team.");

        // 3. Kiểm tra ràng buộc dữ liệu: Team có đang chứa Project nào không?
        var hasProjects = await _dbContext.Projects
            .AnyAsync(p => p.TeamId == request.TeamId, cancellationToken);

        if (hasProjects)
            throw new InvalidOperationException("Không thể xóa Team đang chứa dự án. Vui lòng xóa hoặc chuyển các dự án sang team khác trước khi thực hiện.");

        // 4. Xóa Team (Nhờ Cascade Delete, EF Core sẽ tự dọn các bản ghi trong TeamMembers)
        _dbContext.Teams.Remove(team);
        
        await _dbContext.SaveChangesAsync(cancellationToken);

        return true;
    }
}
