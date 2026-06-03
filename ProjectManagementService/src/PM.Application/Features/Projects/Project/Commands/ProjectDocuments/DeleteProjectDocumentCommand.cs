using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using PM.Domain.Entities;
using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Projects.Project.Commands.ProjectDocuments;

public record DeleteProjectDocumentCommand(Guid ProjectId, Guid DocumentId) : IRequest<bool>;

public class DeleteProjectDocumentCommandHandler : IRequestHandler<DeleteProjectDocumentCommand, bool>
{
    private readonly IPMDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;

    public DeleteProjectDocumentCommandHandler(IPMDbContext dbContext, ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
    }

    public async Task<bool> Handle(DeleteProjectDocumentCommand request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("Bạn chưa đăng nhập.");

        // 1. Lấy thông tin tài liệu
        var doc = await _dbContext.ProjectDocuments
            .Include(d => d.Project)
            .FirstOrDefaultAsync(d => d.Id == request.DocumentId && d.ProjectId == request.ProjectId, cancellationToken);

        if (doc == null)
            return false;

        // 2. Kiểm tra quyền xóa
        // Quyền xóa thuộc về: Người upload HOẶC Chủ dự án (CreatedByUserId) HOẶC Trưởng nhóm (Leader)
        var project = doc.Project;
        bool isAllowed = doc.UploadedByUserId == currentUserId || (project != null && project.CreatedByUserId == currentUserId);

        if (!isAllowed && project != null && project.TeamId.HasValue)
        {
            var teamMember = await _dbContext.TeamMembers
                .FirstOrDefaultAsync(tm => tm.TeamId == project.TeamId.Value && tm.UserId == currentUserId, cancellationToken);
            
            if (teamMember != null && (teamMember.Role.ToLower() == "leader" || teamMember.Role.ToLower() == "owner"))
            {
                isAllowed = true;
            }
        }

        if (!isAllowed)
            throw new UnauthorizedAccessException("Bạn không có quyền xóa tài liệu này.");

        // 3. Xóa tệp vật lý trên đĩa
        string webRootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        string relativePath = doc.FileUrl.TrimStart('/');
        string fullPath = Path.Combine(webRootPath, relativePath);

        try
        {
            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Warning: Failed to delete physical file at {fullPath}. {ex.Message}");
        }

        // 4. Xóa record trong DB
        var log = new ActivityLog
        {
            Id = Guid.NewGuid(),
            ProjectId = request.ProjectId,
            UserId = currentUserId,
            EntityType = "ProjectDocument",
            EntityId = doc.Id,
            ActionType = "Delete",
            OldValue = System.Text.Json.JsonSerializer.Serialize(doc.FileName),
            NewValue = null,
            CreatedAt = DateTime.UtcNow
        };
        _dbContext.ActivityLogs.Add(log);

        _dbContext.ProjectDocuments.Remove(doc);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return true;
    }
}
